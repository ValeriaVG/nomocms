import { APIContext } from "core/types";

export default async function pageviews(
  { from, to }: { from: number; to: number },
  { redis }: APIContext
) {
  // TODO: Limit returned values and scan
  const views = await redis.xrange("analytics", from, to ?? "+");
  const byDay = views.reduce((a, c) => {
    // Get date
    const recordedAt = parseInt(c[0].split("-").shift());
    const date = new Date(recordedAt);
    date.setMilliseconds(0);
    date.setSeconds(0);
    date.setMinutes(0);
    date.setHours(0);
    const ts = date.getTime();
    const views = a.get(ts) ?? 0;
    a.set(ts, views + 1);
    return a;
  }, new Map<number, number>());

  return byDay;
}
