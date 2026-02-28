import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { SpendByNeighborhood } from '../../types/analytics'
import Card from '../ui/Card'
import { formatCompact } from '../../utils/format'

interface Props {
  data: SpendByNeighborhood[]
}

export default function NeighborhoodSpendChart({ data }: Props) {
  const sorted = [...data]
    .sort((a, b) => b.total - a.total)
    .map((d, index) => ({
      ...d,
      fill: index === 0 ? '#6366f1' : `rgba(99,102,241,${Math.max(0.25, 0.85 - index * 0.12)})`,
    }))

  return (
    <Card className="p-5 analytics-card">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">Spend by Neighborhood</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={sorted} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
          <XAxis
            type="number"
            tickFormatter={(v) => formatCompact(v)}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="neighborhood"
            width={80}
            tick={{ fill: '#a1a1aa', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(99,102,241,0.08)' }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as SpendByNeighborhood
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
                  <p className="font-semibold text-zinc-100">{d.neighborhood}</p>
                  <p className="text-zinc-400">{d.visits} visits · {formatCompact(d.total)}</p>
                </div>
              )
            }}
          />
          <Bar dataKey="total" radius={[0, 4, 4, 0]} fill="#6366f1" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
