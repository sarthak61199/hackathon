import type { CustomerStats } from "../../types/restaurant";
import {
  formatCompact,
  formatCurrency,
  formatDate,
  formatRelativeDate,
} from "../../utils/format";
import Badge from "../ui/Badge";
import Divider from "../ui/Divider";
import Stat from "../ui/Stat";

interface PersonalStatsProps {
  stats: CustomerStats;
}

function getLoyaltyTier(score: number): { label: string; color: string } {
  if (score >= 80) return { label: "Platinum", color: "#e2e8f0" };
  if (score >= 60) return { label: "Gold", color: "#fbbf24" };
  if (score >= 40) return { label: "Silver", color: "#94a3b8" };

  return { label: "Regular", color: "#6366f1" };
}

export default function PersonalStats({ stats }: PersonalStatsProps) {
  const loyalty = getLoyaltyTier(stats.loyaltyScore);

  return (
    <div className="px-4 py-4 space-y-4">
      <Divider label="Your Stats" />

      {/* 2×3 grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        <Stat label="Visits" value={stats.visitCount} />
        <Stat label="Total Spent" value={formatCompact(stats.totalSpent)} />
        <Stat label="Avg / Visit" value={formatCurrency(stats.avgSpent)} />
        <Stat
          label="Last Visit"
          value={
            <span title={formatDate(stats.lastVisit)} className="text-base">
              {formatRelativeDate(stats.lastVisit)}
            </span>
          }
        />
        <Stat label="Avg Party Size" value={`${stats.avgPax.toFixed(1)} pax`} />
        <Stat
          label="Total Savings"
          value={
            <span className="text-amber-400">
              {formatCompact(stats.totalSavings)}
            </span>
          }
        />
      </div>

      {/* Loyalty score row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-zinc-400 uppercase tracking-wide">
            Loyalty Score
          </span>
          <span className="text-lg font-semibold tabular-nums text-zinc-50">
            {stats.loyaltyScore}
          </span>
        </div>
        <Badge color={loyalty.color}>{loyalty.label}</Badge>
      </div>

      {/* Progress bar for loyalty score */}
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(stats.loyaltyScore, 100)}%`,
            backgroundColor: loyalty.color,
          }}
        />
      </div>

      {/* Favourite deal */}
      {stats.favouriteDeal && (
        <div className="text-xs text-zinc-500">
          Favourite deal:{" "}
          <span className="text-zinc-300 font-medium">
            {stats.favouriteDeal}
          </span>
        </div>
      )}
    </div>
  );
}
