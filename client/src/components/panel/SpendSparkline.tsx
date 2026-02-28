import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import type { SpendTimelineEntry } from "../../types/restaurant";
import { formatCurrency, formatDate } from "../../utils/format";
import Divider from "../ui/Divider";

interface SpendSparklineProps {
  timeline: SpendTimelineEntry[];
}

interface TooltipPayload {
  value: number;
  payload: SpendTimelineEntry;
}

function SparkTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];

  return (
    <div className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs shadow-lg">
      <p className="text-zinc-400">
        {formatDate(entry.payload.date, "MMM D, YYYY")}
      </p>
      <p className="text-amber-400 font-semibold">
        {formatCurrency(entry.value)}
      </p>
      {entry.payload.pax > 0 && (
        <p className="text-zinc-500">{entry.payload.pax} pax</p>
      )}
    </div>
  );
}

export default function SpendSparkline({ timeline }: SpendSparklineProps) {
  if (!timeline || timeline.length === 0) return null;

  // Sort chronologically
  const sorted = [...timeline].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="px-4 pb-4 space-y-3">
      <Divider label="Spend Over Time" />
      <ResponsiveContainer width="100%" height={60}>
        <AreaChart
          data={sorted}
          margin={{ top: 4, right: 0, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            content={<SparkTooltip />}
            cursor={{
              stroke: "#fbbf24",
              strokeWidth: 1,
              strokeDasharray: "3 3",
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="#fbbf24"
            strokeWidth={1.5}
            fill="url(#sparkGradient)"
            dot={false}
            activeDot={{ r: 3, fill: "#fbbf24", stroke: "transparent" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <p className="text-xs text-zinc-500 text-center">
        {sorted.length} visit{sorted.length !== 1 ? "s" : ""} ·{" "}
        {formatDate(sorted[0].date, "MMM YYYY")} –{" "}
        {formatDate(sorted[sorted.length - 1].date, "MMM YYYY")}
      </p>
    </div>
  );
}
