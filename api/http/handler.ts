import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { Migration } from "../db/migrations";
import { HTTPMethod } from "lib/HTTPMethod";
import createRouter, { Ctx, Route } from "./router";
import { HTTPStatus } from "lib/HTTPStatus";
import { HTTPError } from "lib/errors";

export interface AppModule<C extends Ctx = Ctx> {
  routes?: Record<string, Route<C>>;
  migrations?: Array<Migration>;
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
  const routePath = createRouter<{ req: IncomingMessage }>(routes);

  return async (req: IncomingMessage, res: ServerResponse) => {
    setCORSHeaders(res);
    const url = new URL(req.url, "http://127.0.0.1");
    try {
      const body = await consumeJSON(req);
      const result = await routePath(
        { path: url.pathname, method: req.method.toUpperCase() as HTTPMethod },
        { ...context, req },
        { body, queryParams: url.searchParams }
      );
      if (!result)
        throw new Error(
          `Route ${url.pathname} returned incorrect response: ${JSON.stringify(
            result
          )}`
        );
      res.statusCode = result.status || 200;
      if (result.headers) {
        for (const [header, value] of Object.entries(result.headers)) {
          res.setHeader(header, value as string);
        }
      }
      if (result.body instanceof Readable) {
        // TODO: Warn that it needs length, if missing
        return result.body.pipe(res);
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
}

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
