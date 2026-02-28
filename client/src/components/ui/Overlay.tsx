import { cn } from '../../utils/cn'

interface OverlayProps {
  onClick?: () => void
  className?: string
  /** 0–100, default 50 */
  opacity?: number
}

export default function Overlay({ onClick, className, opacity = 50 }: OverlayProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'fixed inset-0 z-40 transition-opacity duration-300',
        `bg-black/${opacity}`,
        className
      )}
    />
  )
}
