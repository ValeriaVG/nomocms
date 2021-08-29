import { Permission } from "modules/authorization/Permissions";
import { requiresPermission } from "modules/authorization/utils";
import { SQLDataSource } from "../core/sql";
import { ListParams, Routes } from "../core/types";

export default function createRoutes<
  T extends { id: number | string },
  I = Omit<T, "id">,
  P = I
>(scope: string): Routes {
  type D = SQLDataSource<T, I, P>;

  return {
    [`/_api/${scope}`]: requiresPermission(
      [scope, Permission.list],
      (params: ListParams, ctx) => (ctx[scope] as D).list(params)
    ),
    [`/_api/${scope}/:id`]: {
      GET: requiresPermission(
        [scope, Permission.view],
        ({ id }: { id: T["id"] }, ctx) => (ctx[scope] as D).get(id)
      ),
      POST: requiresPermission(
        [scope, Permission.create],
        ({ input }: { input: I }, ctx) => (ctx[scope] as D).create(input)
      ),
      PUT: requiresPermission(
        [scope, Permission.update],
        ({ id, input }: { id: number; input: P }, ctx) =>
          (ctx[scope] as D).update(id, input)
      ),
      DELETE: requiresPermission(
        [scope, Permission.delete],
        ({ id }: { id: T["id"] }, ctx) => (ctx[scope] as D).delete(id)
      ),
    },
  };
}
