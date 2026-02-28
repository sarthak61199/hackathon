import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { MonthlySpend } from "../../types/analytics";
import Card from "../ui/Card";
import { formatCompact } from "../../utils/format";
import dayjs from "dayjs";

interface Props {
  data: MonthlySpend[];
}

export default function MonthlySpendChart({ data }: Props) {
  return (
    <Card className="p-5 h-full analytics-card">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">
        Monthly Spend Trend
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart
          data={data}
          margin={{ left: 0, right: 4, top: 4, bottom: 0 }}
        >
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#3f3f46"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tickFormatter={(v) => dayjs(v).format("MMM 'YY")}
            tick={{ fill: "#a1a1aa", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={(v) => formatCompact(v)}
            tick={{ fill: "#a1a1aa", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const d = payload[0].payload as MonthlySpend;
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-zinc-100">
                    {dayjs(label as string).format("MMMM YYYY")}
                  </p>
                  <p className="text-zinc-400">{d.visits} visits</p>
                  <p className="text-indigo-300">
                    {formatCompact(d.totalSpend)} total
                  </p>
                  <p className="text-zinc-400">
                    avg {formatCompact(d.avgSpend)}
                  </p>
                </div>
              );
            }}
          />
          <Area
            type="monotone"
            dataKey="totalSpend"
            stroke="#6366f1"
            strokeWidth={2}
            fill="url(#spendGradient)"
            dot={false}
            activeDot={{
              r: 4,
              fill: "#6366f1",
              stroke: "#a5b4fc",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}
