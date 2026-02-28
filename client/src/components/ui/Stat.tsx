import { cn } from '../../utils/cn'

interface StatProps {
  label: string
  value: React.ReactNode
  className?: string
}

export default function Stat({ label, value, className }: StatProps) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-xs text-zinc-400 uppercase tracking-wide">{label}</span>
      <span className="text-lg font-semibold tabular-nums text-zinc-50 leading-tight">{value}</span>
    </div>
  )
}
