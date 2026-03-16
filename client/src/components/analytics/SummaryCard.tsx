import type { RefObject } from "react";
import type { SummaryResponse } from "../../types/analytics";
import Stat from "../ui/Stat";
import { formatCurrency, formatCompact } from "../../utils/format";

interface SummaryCardProps {
  data: SummaryResponse;
  cardRef: RefObject<HTMLDivElement>;
}

export default function SummaryCard({ data, cardRef }: SummaryCardProps) {
  return (
    <div className="p-px rounded-xl bg-linear-to-r from-indigo-500 to-amber-400">
      <div ref={cardRef} className="bg-zinc-900 rounded-xl p-6">
        {/* Header */}
        <div className="mb-5">
          <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">
            Your Dining Year
          </p>
          <h2 className="text-2xl font-semibold text-zinc-50 tracking-tight">
            {data.customerName}
          </h2>
        </div>

        {/* Main stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5 mb-6">
          <Stat label="Total Visits" value={data.totalVisits} />
          <Stat label="Total Spent" value={formatCompact(data.totalSpent)} />
          <Stat label="Restaurants" value={data.uniqueRestaurants} />
          <Stat
            label="Avg / Visit"
            value={formatCompact(data.avgSpendPerVisit)}
          />
          <Stat label="Total Saved" value={formatCompact(data.totalSavings)} />
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-700/50 mb-5" />

        {/* Highlights grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              Top Restaurant
            </p>
            <p className="text-base font-semibold text-zinc-50 truncate">
              {data.topRestaurant.name}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {data.topRestaurant.visits} visits ·{" "}
              {formatCurrency(data.topRestaurant.totalSpent)}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              Top Cuisine
            </p>
            <p className="text-base font-semibold text-zinc-50 truncate">
              {data.topCuisine.name}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {data.topCuisine.visits} visits ·{" "}
              {formatCurrency(data.topCuisine.totalSpent)}
            </p>
          </div>
          <div className="bg-zinc-800/60 rounded-lg p-4">
            <p className="text-xs text-zinc-400 uppercase tracking-wide mb-1">
              Explorer
            </p>
            <p className="text-base font-semibold text-zinc-50">
              {data.newVsRevisit.newRestaurants} new spots
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              {data.newVsRevisit.revisitCount} revisit visits ·{" "}
              {data.avgPax.toFixed(1)} avg party size
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
