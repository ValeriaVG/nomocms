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
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
};

export default function createHandler<C extends Omit<Ctx, "req">>(
  modules: Array<AppModule<C & { req: IncomingMessage }>>,
  context: C
) {
  const routes = modules.reduceRight(
    (a, m) => ({ ...a, ...(m.routes || {}) }),
    {} as Record<string, Route<C & { req: IncomingMessage }>>
  );
  const middlewares = modules.reduceRight(
    (a, m) => [...a, ...(m.middlewares || [])],
    []
  );

  const routePath = createRouter<{ req: IncomingMessage }>(routes);

  const routesMiddleware: Middleware = async (
    ctx: { db: Pool; req: IncomingMessage },
    res: ServerResponse,
    next
  ) => {
    setCORSHeaders(res);
    const req = ctx.req;
    const url = new URL(req.url, "http://127.0.0.1");
    try {
      const body = await consumeJSON(req);
      const result = await routePath(
        { path: url.pathname, method: req.method.toUpperCase() as HTTPMethod },
        ctx,
        { body, queryParams: url.searchParams }
      );
      if (!result) return next();
      res.statusCode = result.status || 200;
      if (result.headers) {
        for (const [header, value] of Object.entries(result.headers)) {
          res.setHeader(header, value as string);
        }
      }
      if (result.body instanceof Readable) {
        // TODO: Warn that it needs length, if missing
        result.body.pipe(res);
        return;
      }
      if (result.body) {
        if (
          !res.hasHeader("content-type") &&
          !Buffer.isBuffer(result.body) &&
          typeof result.body !== "string"
        ) {
          res.setHeader("content-type", "application/json");
        }
        const buffer =
          result.body instanceof Buffer
            ? result.body
            : typeof result.body === "string"
            ? Buffer.from(result.body)
            : Buffer.from(JSON.stringify(result.body));
        res.setHeader("content-length", buffer.byteLength);
        res.write(buffer);
      }
      return res.end();
    } catch (err) {
      if (err instanceof HTTPError) {
        res.statusCode = err.status;
        res.write(JSON.stringify({ error: err.message }));
      } else {
        console.error(err);
        res.statusCode = HTTPStatus.InternalServerError;
        res.write(`{"error":"Internal Server Error"}`);
      }
      res.end();
    }
  };
  middlewares.push(routesMiddleware);
  return async (req: IncomingMessage, res: ServerResponse) => {
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
    if (typeof middleware === "function")
      await middleware(ctx, res, executeNextMiddleware);
    else {
      res.statusCode = 404;
      res.end();
    }
  };
  await executeNextMiddleware();
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
