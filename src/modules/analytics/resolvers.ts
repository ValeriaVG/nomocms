import { APIContext } from "core/types";
import Analytics, { PageEventInput } from "./Analytics";

export default {
  Query: {
    pageviews: async (
      _,
      params: { from?: number; to?: number },
      { analytics }: APIContext & { analytics: Analytics }
    ) => {
      const from = params.from
        ? new Date(params.from)
        : new Date(Date.now() - ONE_WEEK_MS);
      const to = new Date(params.to || Date.now());
      const views = await analytics.viewsPerDay({ from, to });
      return views;
    },
  },
  Mutation: {
    ping: async (
      _,
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
      return "OK";
    },
  },
};
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
