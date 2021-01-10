import CRUDLResolver from "core/CRUDLResolver";
import { requiresPermission } from "modules/authorization/lib";
import Styles from "modules/styles/Styles";
import Templates from "modules/templates/Templates";
import Pages from "./Pages";

export const dataSources = {
  pages: Pages,
};

export const routes = CRUDLResolver<Pages>("pages");
routes["/_api/page/preview"] = {
  POST: requiresPermission(
    { scope: "pages", permissions: 1 },
    async (
      { input },
      {
        templates,
        pages,
      }: { templates: Templates; pages: Pages; styles: Styles }
    ) => {
      const parsed = pages.parse(input);
      if ("errors" in parsed) return parsed;
      const { content, html, ...params } = parsed;
      const result = await templates.render(input.template, {
        ...params,
        content: html,
      });
      return { ...result, type: "amp" } as any;
    }
  ),
} as any;
