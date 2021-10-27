import { HTTPMethod } from "lib/HTTPMethod";
import { HTTPStatus } from "lib/HTTPStatus";
import { Readable } from "stream";

export interface HandlerResponse<
  T = Record<string, any> | Array<any> | string | Buffer | Readable
> {
  headers?: Record<string, string>;
  body?: T;
  status: HTTPStatus;
}
export type RouteHandler<
  C = any,
  O extends {
    body?: any;
    params?: Record<string, string>;
    queryParams?: URLSearchParams;
  } = any
> = (ctx: C, input?: O) => Promise<HandlerResponse> | HandlerResponse;

export type Route<C = any> =
  | RouteHandler<C>
  | Partial<Record<HTTPMethod, RouteHandler<C>>>;

export function buildPathRegExp(path: string): RegExp {
  const routePath = path.startsWith("/") ? path : "/" + path;
  return new RegExp(
    `^${routePath
      .replace(/:([a-z]+)/gi, "(?<$1>[a-z-0-9-_.]+)")
      .replace("/", "/")}$`,
    "i"
  );
}

export default function createRouter<C = any>(routes: Record<string, Route>) {
  const map = new Map<string, Route>(Object.entries(routes));
  const variablePaths = new Map<RegExp, string>();

  for (const key of map.keys()) {
    if (/\/:/.test(key)) {
      variablePaths.set(buildPathRegExp(key), key);
    }
  }
  return async (
    { path, method }: { path: string; method: HTTPMethod },
    ctx: C,
    reqInput?: { body?: any; queryParams?: URLSearchParams }
  ): Promise<HandlerResponse> => {
    const routePath = (path: string, params: Record<string, string> = {}) => {
      const input = Object.assign({ params }, reqInput);
      const route = map.get(path);
      if (typeof route === "function") return route(ctx, input);
      if (typeof route !== "object")
        throw new Error(`Mailformed route for ${path}: ${route}`);
      if (!route[method]) return { status: HTTPStatus.MethodNotAllowed };
      return route[method](ctx, input);
    };
    const respondWithOptions = (path: string) => {
      const route = map.get(path);
      const methods =
        typeof route === "function" ? "GET" : Object.keys(route).join(", ");
      return {
        status: HTTPStatus.NoContent,
        headers: {
          Allow: methods,
          "Access-Control-Allow-Methods": methods,
        },
      };
    };
    // Has this exact path
    if (map.has(path)) {
      if (method === HTTPMethod.OPTIONS) {
        return respondWithOptions(path);
      }
      return routePath(path);
    }
    for (const [re, pathWithVars] of variablePaths) {
      const matches = path.match(re);
      if (matches) {
        if (method === HTTPMethod.OPTIONS) {
          return respondWithOptions(pathWithVars);
        }
        const params = matches.groups ?? {};
        return routePath(pathWithVars, params);
      }
    }
    return { status: HTTPStatus.NotFound };
  };
}
