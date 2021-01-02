import { APIResolver, APIResolvers, HTTPMethod } from "../types";
import { HTTPMethodNotAllowed, HTTPNotFound } from "./errors";

export default function routeRequest(
  url: URL,
  method: HTTPMethod,
  resolvers: APIResolvers
): APIResolver {
  const path = url.pathname
    .replace(new RegExp(`^\/api\/`, "i"), "")
    .toLowerCase();

  if (!(path in resolvers)) throw new HTTPNotFound();
  if (!(method in resolvers[path]))
    throw new HTTPMethodNotAllowed(
      Object.keys(resolvers[path]) as HTTPMethod[]
    );
  return resolvers[path][method];
}
