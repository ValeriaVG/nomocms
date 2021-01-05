import { HTTPNotAuthorized } from "api/errors";
import { APIResolver } from "types";
import Users, { User } from "./Users";
import Permissions from "./Permissions";

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

export function requiresUser<P = any, C = any, R = any>(
  next: APIResolver<P, C, R>
): APIResolver<P, C & { user: User; users: Users }, R> {
  return async (params, context) => {
    if (context.user) return next(params, context);
    const token = params["rid"] ?? context.cookies?.["amp-access"];
    if (!token) throw new HTTPNotAuthorized();
    const user = await context.users.byToken(token);
    if (!user) throw new HTTPNotAuthorized();
    context.user = user;
    return next(params, context);
  };
}

export function requiresPermission<P = any, C = any, R = any>(
  { scope, permissions }: { scope?: string; permissions: number },
  next: APIResolver<P, C, R>
): APIResolver<P, C & { user: User; permissions: Permissions }, R> {
  return requiresUser(async (params, context) => {
    const hasAccess = await context.permissions.check({
      scope,
      permissions,
      user: context.user.id,
    });
    if (!hasAccess) throw new HTTPNotAuthorized();
    return next(params, context);
  });
}
