import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { useAppStore } from '../stores/appStore'
import { useAnalytics, useSummaryCard } from '../api/queries'
import SummaryCard from '../components/analytics/SummaryCard'
import ShareButton from '../components/analytics/ShareButton'
import CuisineSpendChart from '../components/analytics/CuisineSpendChart'
import NeighborhoodSpendChart from '../components/analytics/NeighborhoodSpendChart'
import DayOfWeekChart from '../components/analytics/DayOfWeekChart'
import TimeOfDayChart from '../components/analytics/TimeOfDayChart'
import MonthlySpendChart from '../components/analytics/MonthlySpendChart'
import Card from '../components/ui/Card'

export default function AnalyticsView() {
  const customerId = useAppStore((s) => s.customerId)
  const { data: analytics, isLoading: analyticsLoading } = useAnalytics(customerId)
  const { data: summary, isLoading: summaryLoading } = useSummaryCard(customerId)

  const containerRef = useRef<HTMLDivElement>(null)
  const summaryCardRef = useRef<HTMLDivElement>(null!)

  useGSAP(
    () => {
      if (!analyticsLoading && !summaryLoading) {
        gsap.from('.analytics-card', {
          opacity: 0,
          y: 20,
          stagger: 0.08,
          ease: 'power2.out',
          duration: 0.5,
        })
      }
    },
    { scope: containerRef, dependencies: [analyticsLoading, summaryLoading] }
  )

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-700"
    >
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">

        {/* Hero: Summary Card + Share */}
        {summaryLoading ? (
          <SummaryCardSkeleton />
        ) : summary ? (
          <div className="analytics-card">
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <SummaryCard data={summary} cardRef={summaryCardRef} />
              </div>
              <div className="shrink-0 pt-1">
                <ShareButton cardRef={summaryCardRef} />
              </div>
            </div>
          </div>
        ) : null}

        {/* Charts grid */}
        {analyticsLoading ? (
          <ChartsGridSkeleton />
        ) : analytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-1">
              <CuisineSpendChart data={analytics.spendByCuisine} />
            </div>
            <div className="xl:col-span-2">
              <NeighborhoodSpendChart data={analytics.spendByNeighborhood} />
            </div>
            <div className="xl:col-span-1">
              <DayOfWeekChart data={analytics.visitsByDayOfWeek} />
            </div>
            <div className="xl:col-span-1">
              <TimeOfDayChart data={analytics.visitsByTimeSlot} />
            </div>
            <div className="md:col-span-2 xl:col-span-1">
              <MonthlySpendChart data={analytics.monthlySpendTrend} />
            </div>
          </div>
        ) : null}

      </div>
    </div>
  )
}

function SummaryCardSkeleton() {
  return (
    <div className="analytics-card p-px rounded-xl bg-linear-to-r from-indigo-500/30 to-amber-400/30">
      <div className="bg-zinc-900 rounded-xl p-6 space-y-4 animate-pulse">
        <div className="h-4 w-28 bg-zinc-700/60 rounded" />
        <div className="h-7 w-48 bg-zinc-700/60 rounded" />
        <div className="grid grid-cols-5 gap-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-3 w-16 bg-zinc-700/60 rounded" />
              <div className="h-5 w-20 bg-zinc-700/60 rounded" />
            </div>
          ))}
        </div>
        <div className="border-t border-zinc-700/50" />
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-zinc-700/60 rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}

function ChartsGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Card key={i} className="p-5 h-64 animate-pulse">
          <div className="h-4 w-36 bg-zinc-700/60 rounded mb-4" />
          <div className="h-full bg-zinc-700/30 rounded" />
        </Card>
      ))}
    </div>
  )
}
