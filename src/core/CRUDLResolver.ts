import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import { CRUDLDataSource } from "./DataSource";
import { APIContext } from "./types";

export default function CRUDLResolver<
  T extends CRUDLDataSource<{ id: string }>
>(name: string, dataSource?: string, path?: string) {
  const endpoint = path ?? "/" + name;
  const ctxKey = dataSource ?? name;
  type CRUDLContext = APIContext & Record<string, T>;
  return {
    [endpoint]: {
      GET: requiresPermission(
        { scope: name, permissions: Permission.list },
        async (params, ctx: CRUDLContext) => {
          return ctx[ctxKey].list(params);
        }
      ),
      POST: requiresPermission(
        { scope: name, permissions: Permission.create },
        async ({ input }, ctx: CRUDLContext) => {
          return ctx[ctxKey].create(input);
        }
      ),
    },
    [`${endpoint}/:id`]: {
      GET: requiresPermission(
        { scope: "pages", permissions: Permission.read },
        async ({ id }, ctx: CRUDLContext) => {
          return ctx[ctxKey].delete(id);
        }
      ),
      UPDATE: requiresPermission(
        { scope: "pages", permissions: Permission.update },
        async ({ id, input }, ctx: CRUDLContext) => {
          return ctx[ctxKey].update(id, input);
        }
      ),
      DELETE: requiresPermission(
        { scope: "pages", permissions: Permission.delete },
        async ({ id }, ctx: CRUDLContext) => {
          return ctx[ctxKey].delete(id);
        }
      ),
    },
  };
}
