import { APIContext } from "core/types";
import Users from "./Users";

import * as loginPage from "./pages/login";
import { dashboard } from "config";

export default {
  [dashboard.pathname]: { GET: () => ({ ...loginPage, type: "amp" }) },
  "/login": {
    POST: async (
      { input: { email, password } },
      { users, token }: APIContext & { users: Users }
    ) => {
      const user = await users.login({ email, password });
      if (token) users.saveToken(user.id, token);
      return { user };
    },
  },
  "/access": {
    GET: async (_, { canAccessDashboard, user }: APIContext) => {
      return { canAccessDashboard, user };
    },
  },
  "/ping": {
    POST: (params) => {
      return { message: "OK" };
    },
  },
};
