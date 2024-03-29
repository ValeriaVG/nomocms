import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { Migration } from "../db/migrations";
import { HTTPMethod } from "lib/HTTPMethod";
import createRouter, { Ctx, Route } from "./router";
import { HTTPStatus } from "lib/HTTPStatus";
import { HTTPError } from "lib/errors";
import { Pool } from "pg";

export type Middleware = (
  ctx: Ctx,
  res: ServerResponse,
  next: () => Promise<void>
) => Promise<void> | void;
export interface AppModule<C extends Ctx = Ctx> {
  routes?: Record<string, Route<C>>;
  migrations?: Array<Migration>;
  middlewares?: Array<Middleware>;
}

const setCORSHeaders = (res: ServerResponse) => {
  // TODO: Proper CORS
  res.setHeader(
    "Access-Control-Allow-Origin",
    process.env.APP_URL || "http://localhost:3000"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

const aggregateModules = <C extends Ctx>(
  modules: Array<AppModule<C>>
): AppModule<C> => {
  const routes = modules.reduceRight(
    (a, m) => ({ ...a, ...(m.routes || {}) }),
    {} as Record<string, Route<C & { req: IncomingMessage }>>
  );
  const middlewares = modules.reduceRight(
    (a, m) => [...a, ...(m.middlewares || [])],
    []
  );
  return { routes, middlewares };
};

export default function createHandler<C extends Omit<Ctx, "req">>(
  modules: Array<AppModule<C & { req: IncomingMessage }>>,
  context: C
) {
  const { routes, middlewares } = aggregateModules(modules);

  const routesMiddleware: Middleware = makeRoutesMiddleware(routes);
  middlewares.push(routesMiddleware);
  return async (req: IncomingMessage, res: ServerResponse) => {
    setCORSHeaders(res);
    await executeMiddlewares({ ...context, req, res }, middlewares);
  };
}

export const executeMiddlewares = async (
  { res, ...ctx }: Ctx & { res: ServerResponse },
  middlewares: Array<Middleware>
) => {
  let i = 0;
  const executeNextMiddleware = async () => {
    const middleware = middlewares[i++];
    if (typeof middleware === "function") {
      await middleware(ctx, res, executeNextMiddleware);
    }
  };
  await executeNextMiddleware();
  if (!res.writableEnded) {
    res.statusCode = 404;
    res.end();
  }
};

async function consumeJSON(req: IncomingMessage) {
  if (!req?.on) return;
  if (
    req?.headers &&
    req.headers["content-type"] &&
    !req.headers["content-type"].toLowerCase().startsWith("application/json")
  )
    return;

  let data = "";

  return new Promise((resolve, reject) => {
    const flush = () => {
      if (!data) return resolve(undefined);
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        // TODO: throw proper HTTPError
        reject(err);
      }
    };
    req.on("data", (chunk) => {
      if (!chunk.length) return flush();
      data += chunk.toString();
    });
    req.on("end", flush);
    req.on("error", reject);
  });
}

const makeRoutesMiddleware =
  <C extends Ctx>(routes: Record<string, Route<C>>): Middleware =>
    async (ctx, res, next) => {
      const routePath = createRouter<{ req: IncomingMessage }>(routes);
      const req = ctx.req;
      const url = new URL(req.url, "http://127.0.0.1");
      try {
        req.body = await consumeJSON(req);
        const result = await routePath(
          { path: url.pathname, method: req.method.toUpperCase() as HTTPMethod },
          ctx,
          { body: req.body, queryParams: url.searchParams }
        );
        if (!result) {
          return next();
        }
        res.statusCode = result.status || 200;
        if (result.headers) {
          for (const [header, value] of Object.entries(result.headers)) {
            res.setHeader(header, value as string);
          }
        }
        await sendResponse(res, result.body);
        return
      } catch (err) {
        if (err instanceof HTTPError) {
          res.statusCode = err.status;
          res.setHeader("content-type", "application/json");
          res.write(JSON.stringify({ error: err.message }));
        } else {
          console.error(err);
          res.statusCode = HTTPStatus.InternalServerError;
          res.setHeader("content-type", "application/json");
          res.write(`{"error":"Internal Server Error"}`);
        }
        res.end();
      }
    };

const sendResponse = (
  res: ServerResponse,
  body: Record<string, any> | Array<any> | string | Buffer | Readable
) => {
  if (!body) return res.end();
  if (body instanceof Readable) {
    if (!res.hasHeader("content-length")) {
      throw new Error(
        "Content-Length header is required when response is a stream"
      );
    }
    body.pipe(res);
    return;
  }
  const isBodyBuffer = Buffer.isBuffer(body);
  const isBodyString = typeof body === "string";
  if (!res.hasHeader("content-type") && !isBodyBuffer && !isBodyString) {
    // Set "default" content type
    res.setHeader("content-type", "application/json");
  }
  const buffer = isBodyBuffer
    ? body
    : isBodyString
      ? Buffer.from(body)
      : Buffer.from(JSON.stringify(body));

  res.setHeader("content-length", buffer.byteLength);
  res.write(buffer);

  return res.end();
};
