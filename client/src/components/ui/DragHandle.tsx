import { cn } from '../../utils/cn'

interface DragHandleProps {
  className?: string
}

export default function DragHandle({ className }: DragHandleProps) {
  return (
    <div className={cn('flex justify-center pt-2 pb-1', className)}>
      <div className="w-10 h-1 rounded-full bg-zinc-500" />
    </div>
  )
}
