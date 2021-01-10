import { APIContext } from "core/types";
import Users from "./Users";

import * as loginPage from "./pages/login";
import { dashboard, superuser } from "config";
import { HTTPNotFound, HTTPUserInputError } from "core/errors";
import Permissions, { Permission } from "./Permissions";
import Tokens from "./Tokens";
import CRUDLResolver from "core/CRUDLResolver";
import { requiresPermission } from "./lib";

const routes = {
  [dashboard.pathname]: { GET: () => ({ ...loginPage, type: "amp" }) },
  "/_api/login": {
    POST: async (
      { input: { email, password } },
      {
        users,
        token,
        tokens,
        permissions,
      }: APIContext & { users: Users; tokens: Tokens; permissions: Permissions }
    ) => {
      if (!token) throw new HTTPUserInputError("token", "Must be provided");
      //Check if its a superuser defined by env variables
      if (
        superuser.email &&
        superuser.password &&
        email === superuser.email &&
        password === superuser.password
      ) {
        if (token) tokens.save({ id: "superuser", token });
        return { user: superuser, canAccessDashboard: true };
      }
      const user = await users.login({ email, password });
      if (!user) return { user };
      if (token) tokens.save({ id: user.id, token });
      const canAccessDashboard = await permissions.check({
        user: user.id,
        permissions: Permission.read,
      });
      return { user, canAccessDashboard };
    },
  },
  "/_api/logout": {
    PUT: async (
      _,
      { token, user, tokens }: APIContext & { tokens: Tokens }
    ) => {
      if (!token || !user?.id) return { result: false };
      const result = await tokens.delete({ token, id: user.id });
      return { result: Boolean(result) };
    },
  },
  "/_api/access": {
    GET: async (_, { user, canAccessDashboard }: APIContext) => {
      return { canAccessDashboard, user };
    },
  },
  "/_api/ping": {
    POST: (params) => {
      return { message: "OK" };
    },
  },
  ...CRUDLResolver<Users>("users"),
};

routes["/_api/users/:id"].GET = requiresPermission(
  { scope: "users", permissions: Permission.view },
  async (
    { id },
    { users, permissions }: { users: Users; permissions: Permissions } & any
  ) => {
    const user = await users.get(id);
    if (!user) throw new HTTPNotFound();
    const userPermissions = await (permissions as Permissions).get({
      user: user.id,
    });
    return { ...user, permissions: userPermissions };
  }
);

export default routes;
