import { ResolverFn, HTTPMethod, Route } from "./types";
import { HTTPMethodNotAllowed } from "./errors";
import NormalizedURL from "./NormalizedURL";
import { RouteMatcher } from "utils/routes";

export default function routeRequest(
  url: NormalizedURL,
  method: HTTPMethod | "OPTIONS",
  matchRoute: RouteMatcher<Route>
): { resolver: ResolverFn; params: Record<string, string> } {
  const [route, params] = matchRoute(url.paths);
  if (!route) return { params, resolver: null };
  if (typeof route === "function") {
    return { params, resolver: route };
  }
  if (method === "OPTIONS") {
    return { params, resolver: () => ({ code: 200 }) };
  }
  if (!(method in route))
    throw new HTTPMethodNotAllowed(Object.keys(route) as any);
  return { params, resolver: route[method] };
}
