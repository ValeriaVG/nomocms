import { IncomingMessage, ServerResponse } from "http";
import cookie from "cookie";
import { APIContext, Routes, HTTPMethod } from "./types";
import requestParams from "./requestParams";
import routeRequest from "./routeRequest";
import { DataSource } from "./DataSource";
import responseFactory from "./responseFactory";

export default function core(
  modules: {
    routes?: Routes;
    dataSources?: Record<string, typeof DataSource>;
  },
  context: APIContext
): any {
  return async (req: IncomingMessage, res: ServerResponse) => {
    const sendResponse = responseFactory(res);
    try {
      const method = req.method?.toUpperCase();
      // TODO: normalize url path to deal with trailing slash
      const url = new URL(req.url, "http://localhost");
      const { resolver, params: routeParams } = routeRequest(
        url,
        method as HTTPMethod,
        modules.routes
      );
      const params = await requestParams(req);
      context.cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
      const dataSources = {};
      if (modules.dataSources) {
        for (let source in modules.dataSources) {
          dataSources[source] = new (modules.dataSources[source] as any)(
            context
          );
        }
      }
      const response = await resolver(
        { ...routeParams, ...params },
        { ...context, ...dataSources }
      );

      return sendResponse(response);
    } catch (error) {
      const code = "code" in error ? error.code : 500;
      const message = code >= 500 ? "Internal Server Error" : error.message;
      if (code >= 500) context.log?.error(error);
      return sendResponse({
        errors: [{ name: error["field"] ?? error.name, message }],
        code,
      });
    }
  };
}
