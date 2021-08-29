import { Permission } from "modules/authorization/Permissions";
import { requiresPermission } from "modules/authorization/utils";
import { SQLDataSource } from "../core/sql";
import { ListParams, Routes } from "../core/types";

export default function createRoutes<
  T extends { id: number | string },
  I = Omit<T, "id">,
  P = I
>(scope: string, transformItem: (item: any) => T = (item) => item): Routes {
  type D = SQLDataSource<T, I, P>;

  return {
    [`/_api/${scope}`]: requiresPermission(
      [scope, Permission.list],
      async (params: ListParams, ctx) => {
        const result = await (ctx[scope] as D).list(params);
        result.items = result.items.map(transformItem);
        return result;
      }
    ),
    [`/_api/${scope}/:id`]: {
      GET: requiresPermission(
        [scope, Permission.view],
        async ({ id }: { id: T["id"] }, ctx) => {
          return transformItem(await (ctx[scope] as D).get(id));
        }
      ),
      POST: requiresPermission(
        [scope, Permission.create],
        async ({ input }: { input: I }, ctx) => {
          return transformItem(await (ctx[scope] as D).create(input));
        }
      ),
      PUT: requiresPermission(
        [scope, Permission.update],
        async ({ id, input }: { id: number; input: P }, ctx) => {
          return transformItem(await (ctx[scope] as D).update(id, input));
        }
      ),
      DELETE: requiresPermission(
        [scope, Permission.delete],
        ({ id }: { id: T["id"] }, ctx) => (ctx[scope] as D).delete(id)
      ),
    },
  };
}
