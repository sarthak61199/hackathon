import { cn } from '../../utils/cn'

interface DividerProps {
  label?: string
  className?: string
}

export default function Divider({ label, className }: DividerProps) {
  if (label) {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <hr className="flex-1 border-zinc-700/50" />
        <span className="text-xs text-zinc-500 shrink-0">{label}</span>
        <hr className="flex-1 border-zinc-700/50" />
      </div>
    )
  }

  return <hr className={cn('border-zinc-700/50', className)} />
}
