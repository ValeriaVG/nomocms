import { flatten } from "core/DataSource";
import { APIContext } from "core/types";

export const routes = {
  "/_ping": {
    POST: async (
      { input, files, ...params }: any,
      { user, redis, headers, token, url, ip, ip_num }: APIContext
    ) => {
      const info = {
        ...params,
        ...headers,
        ip,
        ip_num,
        normalized_path: url.normalizedPath,
      };
      if (token) {
        info.token = token;
      }
      if (user) {
        info.user_id = user?.id;
        info.user_email = user?.email;
        info.user_name = user?.name;
      }
      redis.xadd("analytics", "*", flatten(info)).then(() => {});
      return { message: "OK" };
    },
  },
};
