import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import { CRUDLDataSource } from "./DataSource";
import { HTTPNotFound } from "./errors";
import { APIContext } from "./types";

export default function CRUDLResolver<
  T extends CRUDLDataSource<{ id: string | number }>
>(name: string, dataSource?: string, path?: string) {
  const endpoint = "/_api" + (path ?? "/" + name);
  const ctxKey = dataSource ?? name;
  type CRUDLContext = APIContext & Record<string, T>;

  const resolve = (
    action: "create" | "update" | "delete" | "list",
    args: (params: any) => any = (p) => p
  ) =>
    requiresPermission(
      { scope: name, permissions: Permission[action] },
      async (params, ctx: CRUDLContext) => {
        return ctx[ctxKey][action](...args(params));
      }
    );

  return {
    [endpoint]: {
      GET: resolve("list"),
      POST: resolve("create", ({ input }) => input),
    },
    [`${endpoint}/:id`]: {
      GET: requiresPermission(
        { scope: path, permissions: Permission.read },
        async ({ id }, ctx: CRUDLContext) => {
          const item = await ctx[ctxKey].get(id);
          if (!item) throw new HTTPNotFound();
          return item;
        }
      ),
      POST: resolve("update", ({ id, input }) => [id, input]),
      PATCH: resolve("update", ({ id, input }) => [id, input]),
      DELETE: resolve("delete", ({ id }) => id),
    },
  };
}
