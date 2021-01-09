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

const data: { date: number; visitors: number }[] = [
  {
    date: new Date("2020-12-01").getTime(),
    visitors: 0,
  },
  {
    date: new Date("2020-12-05").getTime(),
    visitors: 30,
  },
  {
    date: new Date("2020-12-11").getTime(),
    visitors: 54,
  },
  {
    date: new Date("2020-11-23").getTime(),
    visitors: 80,
  },
  {
    date: new Date("2020-12-25").getTime(),
    visitors: 90,
  },
  {
    date: new Date("2021-01-01").getTime(),
    visitors: 150,
  },
];

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
  return (
    <>
      <h1>Website name</h1>
      <section style="padding:2rem 2rem 2rem 0;">
        <ResponsiveContainer width={"100%"} minHeight={260}>
          {/* @ts-ignore */}
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              padding={{ left: 40, right: 40 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(ts: number) => {
                const date = new Date(ts);
                return `${
                  months[date.getMonth()]
                } ${date.getDate()}, ${date.getFullYear()}`;
              }}
            />
            <YAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(visitors: number) =>
                (visitors ? visitors : "") as any
              }
            />
            <Tooltip />
            <CartesianGrid vertical={false} />
            <Line
              type="monotone"
              dataKey="visitors"
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
