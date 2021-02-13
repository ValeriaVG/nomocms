export function buildRegExp(path: string): RegExp {
  const routePath = path.startsWith("/") ? path : "/" + path;
  return new RegExp(
    `^${routePath
      .replace(/:([a-z]+)/gi, "(?<$1>[a-z-0-9-_]+)")
      .replace("/", "/")}$`,
    "i"
  );
}

export type RouteMatcher<T> = (
  url: string | string[]
) => [route?: T, params?: Record<string, string>];

export default function createRoutes<T>(
  routes: Record<string, T>
): RouteMatcher<T> {
  const cache = new Map<string, RegExp>();
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
    return [];
  };
}
