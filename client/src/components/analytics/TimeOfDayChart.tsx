import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { VisitByTimeSlot } from '../../types/analytics'
import Card from '../ui/Card'

interface Props {
  data: VisitByTimeSlot[]
}

const SLOT_COLORS: Record<string, string> = {
  Breakfast: '#fbbf24',
  Lunch: '#34d399',
  Evening: '#818cf8',
  Dinner: '#6366f1',
  'Late Night': '#ec4899',
}

const SLOT_ORDER = ['Breakfast', 'Lunch', 'Evening', 'Dinner', 'Late Night']

export default function TimeOfDayChart({ data }: Props) {
  const sorted = [...data]
    .sort((a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot))
    .map((d) => ({ ...d, fill: SLOT_COLORS[d.slot] ?? '#6366f1' }))

  return (
    <Card className="p-5 analytics-card">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">Visits by Time of Day</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={sorted} margin={{ left: -16, right: 4, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis
            dataKey="slot"
            tick={{ fill: '#a1a1aa', fontSize: 10 }}
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
              const d = payload[0].payload as VisitByTimeSlot
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-zinc-100">{d.slot}</p>
                  <p className="text-zinc-400">{d.count} visits</p>
                </div>
              )
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
        {sorted.map((d) => (
          <span key={d.slot} className="flex items-center gap-1 text-xs text-zinc-400">
            <span
              className="inline-block w-2 h-2 rounded-full"
              style={{ background: SLOT_COLORS[d.slot] ?? '#6366f1' }}
            />
            {d.slot}
          </span>
        ))}
      </div>
    </Card>
  )
}
