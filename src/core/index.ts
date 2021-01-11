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
import { ip2num } from "modules/analytics/lib";

export default function core(
  modules: {
    routes?: Routes;
    dataSources?: Record<string, typeof DataSource>;
  },
  ctx: APIContext
): any {
  if (modules.dataSources) {
    for (let source in modules.dataSources) {
      ctx[source] = new (modules.dataSources[source] as any)(ctx);
    }
  }

  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next?: () => void
  ) => {
    // Clean context for each request
    const context: APIContext & Record<string, any> = Object.assign({}, ctx);
    const sendResponse = responseFactory(req, res);

    const initializeAccess = async () => {
      if (!context.token) return;
      context.user = await (context.users as Users).byToken(context.token);

      context.canAccessDashboard =
        context.user?.id === "superuser"
          ? true
          : context.user?.id &&
            (await (context.permissions as Permissions).check({
              permissions: Permission.read,
              user: context.user.id,
            }));
    };

    try {
      const method = req.method?.toUpperCase();

      context.headers = req.headers;
      context.ip = req.connection.remoteAddress;
      context.ip_num = ip2num(req.connection.remoteAddress);
      // TODO: check accept header
      // Look for existing page
      context.url = new NormalizedURL(req.url);
      const acceptsJSON = req.headers.accept?.endsWith("/json");

      context.cookies = req.headers.cookie
        ? cookie.parse(req.headers.cookie)
        : {};

      const params = await requestParams(req);
      context.token = context.cookies["amp-access"] ?? params.rid;
      await initializeAccess().catch(console.error);
      if (
        context.canAccessDashboard &&
        !acceptsJSON &&
        context.url.normalizedPath.startsWith(dashboard.pathname)
      ) {
        return renderDashboard(req, res, next);
      }
      if (!acceptsJSON) {
        const page = await context.redis?.hgetall(
          "pages::url::" + context.url.normalizedPath
        );
        if (page?.id) {
          return sendResponse({ type: "amp", ...page });
        }
      }

      const { resolver, params: routeParams } = routeRequest(
        context.url,
        method as HTTPMethod,
        modules.routes
      );

      if (!resolver) {
        if (next) return next();
        const notFoundPage = await ctx.redis?.hgetall("pages::url::wildcard");
        if (notFoundPage)
          return sendResponse({ type: "amp", ...notFoundPage, code: 404 });
        throw new HTTPNotFound();
      }

      const response = await resolver({ ...routeParams, ...params }, context);

      if (typeof response !== "object")
        throw new Error(
          `Wrong response returned from ${context.url.normalizedPath}`
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
