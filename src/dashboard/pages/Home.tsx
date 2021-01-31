import useQuery from "dashboard/utils/useQuery";
import * as Preact from "preact";
import {
  LineChart,
  XAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  YAxis,
} from "recharts";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function Home(): any {
  const { result } = useQuery("/_api/analytics/pageviews");
  const data = result?.items ?? [];
  return (
    <>
      <section style="padding:2rem 2rem 2rem 0;">
        <ResponsiveContainer width={"100%"} minHeight={260}>
          {/* @ts-ignore */}
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              padding={{ left: 40, right: 40 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatDate}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(visitors: number) =>
                (visitors ? visitors : "") as any
              }
            />
            <Tooltip labelFormatter={formatDate} />
            <CartesianGrid vertical={false} />
            <Line
              type="monotone"
              dataKey="pageviews"
              yAxisId={0}
              strokeWidth={2}
              color="#03a9f4"
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </>
  );
}

function formatDate(ts: number) {
  const date = new Date(ts);
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
