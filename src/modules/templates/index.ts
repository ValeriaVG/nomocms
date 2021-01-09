import CRUDLResolver from "core/CRUDLResolver";
import { requiresPermission } from "modules/authorization/lib";
import Templates from "./Templates";

export const dataSources = {
  templates: Templates,
};

export const routes = CRUDLResolver<Templates>("templates");

routes["/template/preview"] = {
  POST: requiresPermission(
    { scope: "template", permissions: 1 },
    async ({ input }, { templates }: { templates: Templates }) => {
      const result = await templates.preview(input);
      return { ...result, type: "amp" } as any;
    }
  ),
} as any;
