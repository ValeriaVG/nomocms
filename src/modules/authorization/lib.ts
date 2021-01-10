import { HTTPNotAuthorized } from "core/errors";
import { ResolverFn, RouteResponse } from "core/types";
import Users, { User } from "./Users";
import Permissions, { Permission } from "./Permissions";

export const ip2num = (ip: string) => {
  const p = ip.split(".");
  if (p.length !== 4) return 0;
  return p.reduce((a, c, i) => {
    const num = parseInt(c);
    return a + Math.pow(256, 3 - i) * num;
  }, 0);
};

export const num2ip = (num: number) => {
  const p = [];
  let v = num;
  for (let i = 0; i < 4; i++) {
    const k = Math.pow(256, 3 - i);
    p[i] = Math.floor(v / k);
    v = v % k;
  }
  return p.join(".");
};

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
