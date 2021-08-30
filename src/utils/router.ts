export function buildRegExp(
  path: string,
  matchNested: boolean = false
): RegExp {
  const routePath = path.startsWith("/") ? path : "/" + path;
  return new RegExp(
    `^${routePath
      .replace(/:([a-z]+)/gi, "(?<$1>[a-z-0-9-_.]+)")
      .replace("/", "/")}${matchNested ? "" : "$"}`,
    "i"
  );
}

export type RouteMatcher<T> = (
  url: string | string[]
) => [route?: T, params?: Record<string, string>];

export function createRoutes<T>(routes: Record<string, T>): RouteMatcher<T> {
  const cache = new Map<string, RegExp>();
  const defaultRoute = routes["/*"];
  return (url) => {
    const urls = Array.isArray(url) ? url : [url];
    for (let path in routes) {
      if (!cache.has(path)) {
        cache.set(path, buildRegExp(path));
      }
      const re = cache.get(path);
      for (let pathname of urls) {
        const matches = pathname.match(re);
        if (matches) {
          const params = matches.groups ?? {};
          const route = routes[path];
          return [route, params];
        }
      }
    }
    if (defaultRoute) return [defaultRoute, {}];
    return [];
  };
}

export function createNestedRoutes<T>(
  routes: Record<string, { exact?: boolean; route: T }>
): RouteMatcher<T> {
  const cache = new Map<string, RegExp>();
  const defaultRoute = routes["/*"]?.route;
  return (url) => {
    const urls = Array.isArray(url) ? url : [url];
    for (let path in routes) {
      if (!cache.has(path)) {
        cache.set(path, buildRegExp(path, !routes[path].exact));
      }
      const re = cache.get(path);
      for (let pathname of urls) {
        const matches = pathname.match(re);
        if (matches) {
          const params = matches.groups;
          const route = routes[path]?.route;
          return [route, params];
        }
      }
    }
    if (defaultRoute) return [defaultRoute];
    return [];
  };
}

export default function createRouter(
  routes: Record<string, (params: Record<string, string>) => void>
) {
  const matchRoute = createRoutes(routes);
  return (path: string) => {
    const [route, params] = matchRoute(path);
    if (!route) return;
    return route(params);
  };
}
