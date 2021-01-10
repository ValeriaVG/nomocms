import { flatten } from "core/DataSource";
import { APIContext } from "core/types";
import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import pageviews from "./pageviews";

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

  "/analytics/pageviews": {
    GET: requiresPermission(
      { scope: "analytics", permissions: Permission.list },
      (params = {}, context: APIContext) => {
        const from = params.from
          ? parseInt(params.from)
          : Date.now() - 7 * 24 * 60 * 60 * 1000;
        const to = params.to && parseInt(params.to);
        return pageviews({ from, to }, context).then((views) => {
          const items = [...views.entries()].map(([date, pageviews]) => {
            return { date, pageviews };
          });
          return { items };
        });
      }
    ),
  },
};
