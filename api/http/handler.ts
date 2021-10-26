import { IncomingMessage, ServerResponse } from "http";
import { Readable } from "stream";
import { Migration } from "../db/migrations";
import { HTTPMethod } from "lib/HTTPMethod";
import createRouter, { Route } from "./router";

export interface AppModule<C = any> {
  routes?: Record<string, Route<C>>;
  migrations?: Array<Migration>;
}

export default function createHandler<C>(
  modules: Array<AppModule<C>>,
  context: C
) {
  const routes = modules.reduceRight(
    (a, m) => ({ ...a, ...(m.routes || {}) }),
    {} as Record<string, Route<C>>
  );
  const routePath = createRouter<{ req: IncomingMessage }>(routes);

  return async (req: IncomingMessage, res: ServerResponse) => {
    // TODO: Proper CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    const url = new URL(req.url, "http://127.0.0.1");
    const result = await routePath(
      { path: url.pathname, method: req.method.toUpperCase() as HTTPMethod },
      { ...context, req }
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
  };
}
