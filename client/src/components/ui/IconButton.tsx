import { cn } from '../../utils/cn'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps {
  icon: LucideIcon
  onClick?: () => void
  label?: string
  active?: boolean
  className?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export default function IconButton({
  icon: Icon,
  onClick,
  label,
  active = false,
  className,
  size = 'md',
  disabled = false,
}: IconButtonProps) {
  const iconSize = size === 'sm' ? 14 : 18

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        'flex items-center justify-center rounded-full transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
        'active:scale-[0.97] transition-transform',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'md' ? 'w-10 h-10' : 'w-8 h-8',
        active
          ? 'bg-indigo-600 text-white ring-2 ring-indigo-500/50'
          : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 border border-zinc-700',
        className
      )}
    >
      <Icon size={iconSize} />
    </button>
  )
}
