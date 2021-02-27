import { APIContext } from "core/types";
import Users from "./Users";
import { superuser } from "config";
import { v4 as uuid } from "uuid";
import { HTTPNotFound } from "core/errors";
import Permissions, { Permission } from "./Permissions";
import Tokens from "./Tokens";
import { createResolvers } from "utils/createResolvers";

const userResolvers = createResolvers("users");

export default {
  Mutation: {
    ...userResolvers.Mutation,
    login: async (
      _,
      { email, password },
      {
        users,
        token,
        tokens,
        permissions,
        ...ctx
      }: APIContext & { users: Users; tokens: Tokens; permissions: Permissions }
    ) => {
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
        return { user: ctx.superuser, canAccessDashboard: true, token };
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
    logout: async (
      _,
      __,
      { token, user, tokens }: APIContext & { tokens: Tokens }
    ) => {
      if (!token || !user?.id) return { result: false };
      const result = await tokens.deleteOne({ token, user_id: user.id });
      return Boolean(result);
    },
  },
  Query: {
    ...userResolvers.Query,
    access: async (
      _,
      __,
      { user, permissions }: APIContext & { permissions: Permissions }
    ) => {
      const canAccessDashboard =
        user?.email === superuser.email
          ? true
          : user?.id &&
            (await permissions.check({
              permissions: Permission.read,
              user_id: user.id,
            }));
      return { canAccessDashboard, user };
    },
    user: async (
      _,
      { id },
      { users, permissions }: { users: Users; permissions: Permissions } & any
    ) => {
      const user = await users.get(id);
      if (!user) throw new HTTPNotFound();
      const userPermissions = await (permissions as Permissions).getPermissions(
        {
          user_id: user.id,
        }
      );
      return { ...user, permissions: userPermissions };
    },
  },
};
