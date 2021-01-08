import { IncomingMessage, ServerResponse } from "http";
import cookie from "cookie";
import { APIContext, Routes, HTTPMethod } from "./types";
import { dashboard } from "config";
import requestParams from "./requestParams";
import routeRequest from "./routeRequest";
import { DataSource } from "./DataSource";
import responseFactory from "./responseFactory";
import { HTTPNotFound } from "./errors";
import NormalizedURL from "./NormalizedURL";
import renderDashboard from "./renderDashboard";
import Users from "modules/authorization/Users";
import Permissions, { Permission } from "modules/authorization/Permissions";

export default function core(
  modules: {
    routes?: Routes;
    dataSources?: Record<string, typeof DataSource>;
  },
  context: APIContext
): any {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
  ) => {
    const sendResponse = responseFactory(res);
    try {
      const method = req.method?.toUpperCase();
      const url = new NormalizedURL(req.url);
      context.cookies = req.headers.cookie && cookie.parse(req.headers.cookie);
      const dataSources: any = {};
      if (modules.dataSources) {
        for (let source in modules.dataSources) {
          dataSources[source] = new (modules.dataSources[source] as any)(
            context
          );
        }
      }

      context.canAccessDashboard = false;

      if ("users" in dataSources && "permissions" in dataSources) {
        context.token = context.cookies["amp-access"];
        context.user = context.token
          ? await (dataSources.users as Users).byToken(context.token)
          : undefined;

        context.canAccessDashboard =
          context.user?.id &&
          (await (dataSources.permissions as Permissions).check({
            permissions: Permission.read,
            user: context.user.id,
          }));
      }

      if (
        context.canAccessDashboard &&
        url.normalizedPath.startsWith(dashboard.path)
      )
        return renderDashboard(req, res, next);
      const { resolver, params: routeParams } = routeRequest(
        url,
        method as HTTPMethod,
        modules.routes
      );
      if (!resolver) {
        if (next) return next();
        throw new HTTPNotFound();
      }
      const params = await requestParams(req);

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
