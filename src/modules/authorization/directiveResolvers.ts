import { superuser } from "config";
import { HTTPNotAuthorized } from "core/errors";
import { Permission } from "./Permissions";

const requiresUser = async (next, src, args, context) => {
  if (!context.user) throw new HTTPNotAuthorized();
  return next();
};

const requiresPermission = async (next, src, args, context) => {
  if (!context.user) throw new HTTPNotAuthorized();
  const permissions = Permission[args.min];
  if (context.user.email === superuser.email) return next();
  const hasAccess = await context.permissions.check({
    scope: args.scope,
    permissions,
    user_id: context.user.id,
  });
  if (!hasAccess) throw new HTTPNotAuthorized();
  return next();
};

export default {
  requiresUser,
  requiresPermission,
};
