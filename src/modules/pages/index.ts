import CRUDLResolver from "core/CRUDLResolver";
import { requiresPermission } from "modules/authorization/lib";
import Templates from "modules/templates/Templates";
import Pages from "./Pages";

export const dataSources = {
  pages: Pages,
};

export const routes = CRUDLResolver<Pages>("pages");
routes["/page/preview"] = {
  POST: requiresPermission(
    { scope: "pages", permissions: 1 },
    async (
      { input },
      { templates, pages }: { templates: Templates; pages: Pages }
    ) => {
      const template = await templates.get(input.template);
      const { content, html, ...params } = pages.parse(input);
      const result = await templates.preview(template, {
        ...params,
        content: html,
      });
      return { ...result, type: "amp" } as any;
    }
  ),
} as any;
