import { APIContext } from "core/types";
import Users from "./Users";

import * as loginPage from "./pages/login";
import { dashboard } from "config";
import { HTTPUserInputError } from "core/errors";
import Permissions, { Permission } from "./Permissions";
import Tokens from "./Tokens";
import CRUDLResolver from "core/CRUDLResolver";

export default {
  [dashboard.pathname]: { GET: () => ({ ...loginPage, type: "amp" }) },
  "/login": {
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
      const user = await users.login({ email, password });
      if (token) tokens.save({ id: user.id, token });
      const canAccessDashboard = await permissions.check({
        user: user.id,
        permissions: Permission.read,
      });
      return { user, canAccessDashboard };
    },
  },
  "/logout": {
    PUT: async (
      _,
      { token, user, tokens }: APIContext & { tokens: Tokens }
    ) => {
      if (!token || !user?.id) return { result: false };
      const result = await tokens.delete({ token, id: user.id });
      return { result: Boolean(result) };
    },
  },
  "/access": {
    GET: async (_, { user, canAccessDashboard }: APIContext) => {
      return { canAccessDashboard, user };
    },
  },
  "/ping": {
    POST: (params) => {
      return { message: "OK" };
    },
  },
  ...CRUDLResolver<Users>("users"),
};
