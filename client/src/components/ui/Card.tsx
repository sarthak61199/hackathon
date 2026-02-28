import { cn } from '../../utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        'bg-zinc-900/80 backdrop-blur-md border border-zinc-700/50 rounded-lg',
        className
      )}
    >
      {children}
    </div>
  )
}
