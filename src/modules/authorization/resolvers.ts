import { APIContext } from "types";
import Users from "./Users";

export default {
  login: {
    POST: async (
      { input: { email, password }, rid },
      { cookies, users }: APIContext & { users: Users }
    ) => {
      const user = await users.login({ email, password });
      if (cookies["amp-access"])
        users.saveToken(user.id, cookies["amp-access"]);
      return { user };
    },
  },
  access: {
    GET: async ({ rid }, { users }: APIContext & { users: Users }) => {
      const user = await users.byToken(rid);
      if (user) return { user, authorized: true };
      return { authorized: false };
    },
  },
  ping: {
    POST: (params) => {
      return { message: "OK" };
    },
  },
};
