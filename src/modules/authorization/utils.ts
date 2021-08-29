import { superuser } from "config";
import { HTTPNotAuthorized } from "core/errors";
import { ResolverFn } from "core/types";
import { Permission } from "./Permissions";

export const requiresUser = (action): ResolverFn => {
  return async (params, context) => {
    if (!context.user) throw new HTTPNotAuthorized();
    return action(params, context);
  };
};

export const requiresPermission = (
  [scope, permissions]: [string, Permission],
  action
): ResolverFn => {
  return async (params, context) => {
    if (!context.user) throw new HTTPNotAuthorized();

    if (context.user.email === superuser.email) return action(params, context);
    const hasAccess = await context.permissions.check({
      scope,
      permissions,
      user_id: context.user.id,
    });
    if (!hasAccess) throw new HTTPNotAuthorized();
    return action(params, context);
  };
};
