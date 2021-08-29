import { APIContext } from "core/types";
import Analytics, { PageEventInput } from "./Analytics";

// FIXME: add permissions
export default {
  "/_api/analytics/pageviews": async (
    params: { from?: number; to?: number },
    { analytics }: APIContext & { analytics: Analytics }
  ) => {
    const from = params.from
      ? new Date(params.from)
      : new Date(Date.now() - ONE_WEEK_MS);
    const to = new Date(params.to || Date.now());
    const items = await analytics.viewsPerDay({ from, to });
    return { items };
  },
  "/_ping": async (
    { event, path, ...payload }: any,
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
