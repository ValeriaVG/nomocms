import CRUDLResolver from "core/CRUDLResolver";
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
