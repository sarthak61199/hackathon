import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
  {
    variants: {
      variant: {
        default: 'bg-zinc-700 text-zinc-200',
        primary: 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30',
        accent: 'bg-amber-400/20 text-amber-300 border border-amber-400/30',
        cuisine: '', // color set via style prop
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

interface BadgeProps extends VariantProps<typeof badgeVariants> {
  children: React.ReactNode
  className?: string
  /** Hex color for cuisine-type badges */
  color?: string
}

export default function Badge({ variant, color, className, children }: BadgeProps) {
  const style =
    color
      ? {
          backgroundColor: `${color}26`, // ~15% opacity
          color,
          borderColor: `${color}4D`,     // ~30% opacity
          borderWidth: '1px',
          borderStyle: 'solid',
        }
      : undefined

  return (
    <span className={cn(badgeVariants({ variant: color ? 'cuisine' : variant }), className)} style={style}>
      {children}
    </span>
  )
}
