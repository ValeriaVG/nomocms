import { APIContext } from "core/types";
import { requiresPermission } from "modules/authorization/lib";
import { Permission } from "modules/authorization/Permissions";
import Analytics, { PageEventInput } from "./Analytics";

export const routes = {
  "/_ping": {
    POST: async (
      { input, files, event, path, ...payload }: any,
      { user, analytics, headers, ip }: APIContext & { analytics: Analytics }
    ) => {
      const info: PageEventInput = {
        event,
        headers,
        ip,
        path,
        payload,
      };
      if (user) {
        info.user_id = user?.id;
      }
      analytics.create(info).catch(console.error);
      return { message: "OK" };
    },
  },

  "/_api/analytics/pageviews": {
    GET: requiresPermission(
      { scope: "analytics", permissions: Permission.list },
      (params = {}, { analytics }: APIContext & { analytics: Analytics }) => {
        const from = params.from
          ? new Date(params.from)
          : new Date(Date.now() - ONE_WEEK_MS);
        const to = new Date(params.to || Date.now());
        return analytics.viewsPerDay({ from, to });
      }
    ),
  },
};
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
export const dataSources = {
  analytics: Analytics,
};
