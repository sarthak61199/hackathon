import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VisitByDayOfWeek } from '../../types/analytics'
import Card from '../ui/Card'

interface Props {
  data: VisitByDayOfWeek[]
}

const DAY_SHORT: Record<string, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
}

const WEEKEND = new Set(['Friday', 'Saturday', 'Sunday'])

export default function DayOfWeekChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => a.dayIndex - b.dayIndex)
  const max = Math.max(...sorted.map((d) => d.count))

  const chartData = sorted.map((d) => ({
    ...d,
    fill: d.count === max ? '#fbbf24' : WEEKEND.has(d.day) ? '#818cf8' : '#6366f1',
  }))

  return (
    <Card className="p-5 analytics-card">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">Visits by Day of Week</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} margin={{ left: -16, right: 4, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="day"
            tickFormatter={(v) => DAY_SHORT[v] ?? v}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip
            cursor={{ fill: 'rgba(99,102,241,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as VisitByDayOfWeek
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-zinc-100">{d.day}</p>
                  <p className="text-zinc-400">{d.count} visits</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-xs text-zinc-500 mt-2">
        <span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />
        Peak day &nbsp;
        <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 mr-1" />
        Weekends
      </p>
    </Card>
  )
}
