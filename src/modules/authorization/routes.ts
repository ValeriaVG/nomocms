import { APIContext } from "core/types";
import Users from "./Users";
import { superuser } from "config";
import { v4 as uuid } from "uuid";
import { HTTPNotFound } from "core/errors";
import Permissions, { Permission } from "./Permissions";
import Tokens from "./Tokens";
import createRoutes from "utils/createRoutes";
import { requiresPermission } from "./utils";
import ensureType from "core/ensureType";
import { Required, Text } from "core/transformers";

const removePwhash = (user) => {
  if (!user) return null;
  delete user.pwhash;
  return user as {
    id: string;
    name: string;
    email: string;
    created: Date;
    updated: Date;
  };
};

const routes = {
  ...createRoutes("users", removePwhash),
  "/_api/login": {
    POST: async (
      { input },
      {
        users,
        token,
        tokens,
        permissions,
        ...ctx
      }: APIContext & { users: Users; tokens: Tokens; permissions: Permissions }
    ) => {
      const { email, password } = ensureType(input, {
        email: Required(Text),
        password: Required(Text),
      });
      if (!token) token = `nomocms-${uuid()}`;
      //Check if its a superuser defined by env variables
      if (
        superuser.email &&
        superuser.password &&
        email === superuser.email &&
        password === superuser.password
      ) {
        if (token)
          tokens.save({ user_id: ctx.superuser.id, token, ip: ctx.ip });
        return {
          user: removePwhash(ctx.superuser),
          canAccessDashboard: true,
          token,
        };
      }
      const user = await users.login({ email, password });
      if (!user) return { user };
      if (token) tokens.save({ user_id: user.id, token });
      const canAccessDashboard = await permissions.check({
        user_id: user.id,
        permissions: Permission.read,
      });
      return { user, canAccessDashboard, token };
    },
  },
  "/_api/logout": async (
    _,
    { token, user, tokens }: APIContext & { tokens: Tokens }
  ) => {
    if (!token || !user?.id) return { result: false };
    const result = await tokens.deleteOne({ token, user_id: user.id });
    return { success: Boolean(result) };
  },
  "/_api/access": async (
    _,
    { user, permissions }: APIContext & { permissions: Permissions }
  ) => {
    const canAccessDashboard = Boolean(
      user?.email === superuser.email
        ? true
        : user?.id &&
            (await permissions.check({
              permissions: Permission.read,
              user_id: user.id,
            }))
    );
    return { canAccessDashboard, user: removePwhash(user) };
  },
};

routes["/_api/users/:id"].GET = requiresPermission(
  ["users", Permission.view],
  async (
    { id },
    { users, permissions }: { users: Users; permissions: Permissions } & any
  ) => {
    const user = await users.get(id);
    if (!user) throw new HTTPNotFound();
    const userPermissions = await (permissions as Permissions).getPermissions({
      user_id: user.id,
    });
    return { ...removePwhash(user), permissions: userPermissions };
  }
);

export default routes;
