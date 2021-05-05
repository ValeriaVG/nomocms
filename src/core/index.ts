import { IncomingMessage, ServerResponse } from "http";
import cookie from "cookie";
import {
  APIContext,
  DataSource,
  HTTPMethod,
  InitializedContext,
} from "./types";
import { appUrl, superuser } from "config";
import requestParams from "./requestParams";
import routeRequest from "./routeRequest";
import responseFactory from "./responseFactory";
import NormalizedURL from "./NormalizedURL";
import Users from "modules/authorization/Users";
import { insertInto } from "./sql";
import cors from "./cors";
import { perform } from "./sql/migration";
import { AppModules } from "modules";
import { createRoutes } from "utils/router";
import { mergeDeepRight } from "ramda";
import gqlRoute from "./graphql";

const initSuperUser = (ctx: APIContext) =>
  ctx.db
    ?.query(
      ...insertInto(
        ctx["users"].collection,
        {
          name: "superuser",
          email: superuser.email,
          pwhash: "",
        },
        {
          onConflict: {
            constraint: "email",
            update: { set: { name: "superuser" } },
          },
          returning: "*",
        }
      )
    )
    .then(({ rows }) => rows[0]);

export const initDataSources = async (
  ctx: APIContext,
  dataSources: Record<string, typeof DataSource>
) => {
  if (!dataSources) return;
  const migrations = [];
  for (let source in dataSources) {
    const Source = dataSources[source] as any;
    ctx[source] = new Source(ctx);
    const sourceMigrations: Record<string, { up: string }> =
      ctx[source].migrations || ctx[source].defaultMigrations;
    if (sourceMigrations)
      Object.entries(sourceMigrations).forEach(([name, { up }]) => {
        up && migrations.push({ name, model: source, query: up });
      });
  }
  if (migrations.length) await perform(ctx.db, migrations);
};

const createSessionContext = (req: IncomingMessage) => {
  const context: Record<string, any> = {};
  context.headers = req.headers;
  context.ip = req.socket.remoteAddress;
  // TODO: check accept header
  context.url = new NormalizedURL(req.url);
  context.appUrl = (appUrl || "http://" + req.headers.host).replace(/\/+$/, "");
  context.cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  context.method = req.method?.toUpperCase();
  return context;
};

const initializeAccess = async (context: InitializedContext) => {
  if (!context.token) return;
  context.user = await (context.users as Users).byToken(context.token);
};

const ensurePages = async (context: InitializedContext) => {
  await context.db.query(
    ...insertInto(
      context.pages["collection"],
      [
        {
          path: "/",
          title: "Home",
          code: 200,
          content: [
            "---",
            "title: Home",
            "---",
            "# Coming soon",
            "Currently under construction",
          ].join("\n"),
          html: `<h1>Coming soon</h1>\n<p>Currently under construction</p>`,
        },
        {
          path: "/*",
          code: 404,
          title: "Not Found",
          content: [
            "---",
            "title: Not Found",
            "---",
            "# 404: Page not found",
            "Page you were looking for does not exist",
          ].join("\n"),
          html: `<h1>Page not found</h1>\n<p>Page you were looking for does not exist</p>`,
        },
      ],
      { onConflict: { constraint: "path", do: "NOTHING" } }
    )
  );
};

export default async function core(modules: AppModules, ctx: APIContext) {
  const routes = createRoutes(mergeDeepRight(modules.routes, gqlRoute));
  try {
    await initDataSources(ctx, modules.dataSources);
    ctx.superuser = await initSuperUser(ctx);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
  await ensurePages(ctx as InitializedContext);
  return async (req: IncomingMessage, res: ServerResponse) => {
    const sendResponse = responseFactory(req, res);

    try {
      cors(req, res);
      const context: InitializedContext = Object.assign(
        createSessionContext(req),
        ctx
      );
      const params = await requestParams(req);
      context.token = context.cookies["amp-access"] ?? params.rid;
      // Clean context for each request
      const method = req.method?.toUpperCase();
      await initializeAccess(context).catch(console.error);
      const { resolver, params: routeParams } = routeRequest(
        context.url,
        method as HTTPMethod,
        routes
      );
      const response = await resolver(context, { ...routeParams, ...params });
      if (typeof response !== "object")
        throw new Error(
          `Wrong response returned from ${context.url.normalizedPath}`
        );
      return sendResponse(response);
    } catch (error) {
      const code = "code" in error ? error.code : 500;
      const message = code >= 500 ? "Internal Server Error" : error.message;
      if (code >= 500) console.error(error);
      return sendResponse({
        errors: [{ name: error["field"] ?? error.name, message }],
        code,
      });
    }
  };
}
