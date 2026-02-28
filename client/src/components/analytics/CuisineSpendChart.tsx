import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts'
import type { SpendByCuisine } from '../../types/analytics'
import Card from '../ui/Card'
import { formatCompact } from '../../utils/format'

interface Props {
  data: SpendByCuisine[]
}

// recharts v3: pass fill inside each data item instead of Cell
function toChartData(data: SpendByCuisine[]) {
  return data.map((d) => ({ ...d, fill: d.cuisineColor }))
}

export default function CuisineSpendChart({ data }: Props) {
  const chartData = toChartData(data)

  return (
    <Card className="p-5 analytics-card">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">Spend by Cuisine</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="total"
            nameKey="cuisine"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload as SpendByCuisine
              return (
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full"
                      style={{ background: d.cuisineColor }}
                    />
                    <span className="font-semibold text-zinc-100">{d.cuisine}</span>
                  </div>
                  <p className="text-zinc-400">{d.visits} visits · {formatCompact(d.total)}</p>
                  <p className="text-zinc-500">{d.percentage}% of spend</p>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 mt-2">
        {data.map((d) => (
          <span key={d.cuisine} className="flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.cuisineColor }} />
            {d.cuisine}
          </span>
        ))}
      </div>
    </Card>
  )
}
