import { ResolverFn, Routes, HTTPMethod } from "./types";
import { HTTPMethodNotAllowed } from "./errors";
import NormalizedURL from "./NormalizedURL";

const cache = new Map<string, RegExp>();

export default function routeRequest(
  url: NormalizedURL,
  method: HTTPMethod | "OPTIONS",
  routes: Routes
): { resolver: ResolverFn; params: Record<string, string> } {
  let params;
  let resolver;
  for (let path in routes) {
    if (!cache.has(path)) {
      cache.set(path, buildRegExp(path));
    }
    const re = cache.get(path);
    for (let pathname of url.paths) {
      const matches = pathname.match(re);
      if (matches) {
        params = matches.groups ?? {};
        resolver = routes[path];
        break;
      }
    }
    if (resolver) break;
  }
  if (!resolver) return { params, resolver: null };
  if (typeof resolver === "function") {
    return { params, resolver };
  }
  if (method === "OPTIONS") {
    return { params, resolver: () => ({ code: 200 }) };
  }
  if (!(method in resolver))
    throw new HTTPMethodNotAllowed(Object.keys(resolver) as any);
  return { params, resolver: resolver[method] };
}

export function buildRegExp(path: string): RegExp {
  return new RegExp(
    `^${path.replace(/:([a-z]+)/gi, "(?<$1>[a-z-0-9-_]+)").replace("/", "/")}$`,
    "i"
  );
}
