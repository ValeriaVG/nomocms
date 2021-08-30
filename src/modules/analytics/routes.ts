import ensureType from "core/ensureType";
import { Integer, Optional } from "core/transformers";
import { APIContext } from "core/types";
import { Permission } from "modules/authorization/Permissions";
import { requiresPermission } from "modules/authorization/utils";
import Analytics, { PageEventInput } from "./Analytics";

export default {
  "/_api/analytics/pageviews": requiresPermission(
    ["analytics", Permission.view],
    async (rawParams, { analytics }: APIContext & { analytics: Analytics }) => {
      const params = ensureType<{ from?: number; to?: number }>(rawParams, {
        from: Optional(Integer),
        to: Optional(Integer),
      });
      const from = params.from
        ? new Date(params.from)
        : new Date(Date.now() - ONE_WEEK_MS);
      const to = new Date(params.to || Date.now());
      const items = await analytics.viewsPerDay({ from, to });
      return { items };
    }
  ),
  "/_ping": async (
    { event, path, input, files, ...payload }: any,
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
};
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
