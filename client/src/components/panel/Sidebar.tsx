import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { cn } from '../../utils/cn'

export interface SidebarHandle {
  dismiss: () => void
}

interface SidebarProps {
  children: React.ReactNode
  onClose: () => void
  className?: string
}

const Sidebar = forwardRef<SidebarHandle, SidebarProps>(
  function Sidebar({ children, onClose, className }, ref) {
    const sidebarRef = useRef<HTMLDivElement>(null)
    const onCloseRef = useRef(onClose)

    useEffect(() => {
      onCloseRef.current = onClose
    }, [onClose])

    const dismiss = useCallback(() => {
      if (!sidebarRef.current) return
      gsap.to(sidebarRef.current, {
        x: '100%',
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => onCloseRef.current(),
      })
    }, [])

    useImperativeHandle(ref, () => ({ dismiss }), [dismiss])

    // Entrance animation
    useGSAP(
      () => {
        if (!sidebarRef.current) return
        gsap.fromTo(
          sidebarRef.current,
          { x: '100%' },
          { x: 0, duration: 0.4, ease: 'power3.out' },
        )
      },
      { scope: sidebarRef },
    )

    return (
      <div
        ref={sidebarRef}
        className={cn(
          'fixed top-14 right-0 bottom-0 z-50',
          'w-[400px]',
          'bg-zinc-900/95 backdrop-blur-md',
          'border-l border-zinc-700/50',
          'overflow-y-auto overscroll-contain',
          'will-change-transform',
          className,
        )}
      >
        {children}
      </div>
    )
  },
)

export default Sidebar
