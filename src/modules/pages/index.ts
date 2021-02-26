import CRUDLResolver from "core/CRUDLResolver";
import { ResolverFn } from "core/types";
import { IncomingHttpHeaders, IncomingMessage } from "http";
import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import Styles from "modules/styles/Styles";
import Templates from "modules/templates/Templates";
import Pages from "./Pages";

export const dataSources = {
  pages: Pages,
};

export const routes = CRUDLResolver<Pages>("pages");
routes["/_api/page/preview"] = {
  POST: requiresPermission(
    { scope: "pages", permissions: Permission.read },
    async (
      { input },
      {
        templates,
        pages,
      }: { templates: Templates; pages: Pages; styles: Styles }
    ) => {
      const { content, html, ...params } = pages.parse(input);
      const result = await templates.render(input.template, {
        ...params,
        content: html,
      });
      return { ...result, type: "amp" };
    }
  ),
};

routes["/_api/menu"] = requiresPermission(
  { scope: "pages", permissions: Permission.list },
  async ({ parent }, { pages }: { pages: Pages }) => {
    const items = await pages.find({
      where: { parent_id: parent || { is: "NULL" } },
      columns: ["id", "path", "title", "code"],
    });
    return { items };
  }
);

// Public sitemap
routes["sitemap.xml"] = async (
  {},
  { pages, appUrl }: { appUrl: string; pages: Pages }
) => {
  const sitemap = await pages.getSiteMap();
  const entries = sitemap
    .map((entry) => "<url>" + `<loc>${appUrl}${entry.path}</loc>` + "</url>")
    .join("");

  return {
    type: "text/xml",
    data:
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      entries +
      "</urlset>",
  };
};
