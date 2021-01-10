import { HTTPNotAuthorized } from "core/errors";
import { ResolverFn, RouteResponse } from "core/types";
import Users, { User } from "./Users";
import Permissions, { Permission } from "./Permissions";

export function requiresUser<P = any, C = any, R extends RouteResponse = any>(
  next: ResolverFn<P, C, R>
): ResolverFn<P, C & { user: User; users: Users }, R> {
  return async (params, context) => {
    if (!context.user) throw new HTTPNotAuthorized();
    return next(params, context);
  };
}

export function requiresPermission<
  P = any,
  C = any,
  R extends RouteResponse = any
>(
  { scope, permissions }: { scope?: string; permissions: number },
  next: ResolverFn<P, C, R>
): ResolverFn<P, C & { user: User; permissions: Permissions }, R> {
  return requiresUser(async (params, context) => {
    if (context.user.id === "superuser") return next(params, context);
    /**
     * Allow users to read,
     * update and delete themselves
     */
    if (
      scope === "users" &&
      ![Permission.list, Permission.create].includes(permissions) &&
      params["id"] === context.user.id
    )
      return next(params, context);
    const hasAccess = await context.permissions.check({
      scope,
      permissions,
      user: context.user.id,
    });
    if (!hasAccess) throw new HTTPNotAuthorized();
    return next(params, context);
  });
}
