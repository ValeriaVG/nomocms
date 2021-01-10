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
import Permissions, { Permission } from "modules/authorization/Permissions";
import Users from "modules/authorization/Users";

export default function core(
  modules: {
    routes?: Routes;
    dataSources?: Record<string, typeof DataSource>;
  },
  ctx: APIContext
): any {
  const context: any = Object.assign({}, ctx);
  if (modules.dataSources) {
    for (let source in modules.dataSources) {
      context[source] = new (modules.dataSources[source] as any)(context);
    }
  }
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
  ) => {
    const sendResponse = responseFactory(res);
    try {
      const method = req.method?.toUpperCase();
      // TODO: check accept header
      // Look for existing page
      const url = new NormalizedURL(req.url);
      const page = await context.redis?.hgetall("pages::" + url.normalizedPath);
      if (page?.id) return sendResponse({ type: "amp", ...page });
      if (["HEAD", "OPTIONS"].includes(method)) return res.end();

      context.cookies = req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : {};

      context.canAccessDashboard = false;
      const params = await requestParams(req);
      if ("users" in context && "permissions" in context) {
        context.token = context.cookies["amp-access"] ?? params.rid;

        context.user = context.token
          ? await (context.users as Users).byToken(context.token)
          : undefined;

        context.canAccessDashboard =
          context.user?.id === "superuser"
            ? true
            : context.user?.id &&
              (await (context.permissions as Permissions).check({
                permissions: Permission.read,
                user: context.user.id,
              }));
      }

      if (
        context.canAccessDashboard &&
        url.normalizedPath.startsWith(dashboard.pathname)
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

      const response = await resolver({ ...routeParams, ...params }, context);

      if (typeof response !== "object")
        throw new Error(`Wrong response returned from ${url}`);

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
