import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import Pages from "./Pages";

export default {
  "/pages": {
    GET: requiresPermission(
      { scope: "pages", permissions: Permission.list },
      async (params, { pages }: { pages: Pages }) => {
        return pages.list(params);
      }
    ),
    POST: requiresPermission(
      { scope: "pages", permissions: Permission.create },
      async ({ input }, { pages }: { pages: Pages }) => {
        return pages.create(input);
      }
    ),
  },
  "/pages/:id": {
    GET: requiresPermission(
      { scope: "pages", permissions: Permission.read },
      async ({ id }, { pages }: { pages: Pages }) => {
        return pages.delete(id);
      }
    ),
    UPDATE: requiresPermission(
      { scope: "pages", permissions: Permission.update },
      async ({ id, input }, { pages }: { pages: Pages }) => {
        return pages.update(id, input);
      }
    ),
    DELETE: requiresPermission(
      { scope: "pages", permissions: Permission.delete },
      async ({ id }, { pages }: { pages: Pages }) => {
        return pages.delete(id);
      }
    ),
  },
};
