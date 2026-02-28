import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

export function useSlideIn(direction: 'right' | 'left' | 'up' | 'down' = 'right') {
  const ref = useRef<HTMLDivElement>(null)

  const from = {
    right: { x: '100%' },
    left: { x: '-100%' },
    up: { y: '-100%' },
    down: { y: '100%' },
  }[direction]

  useGSAP(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, from, {
      x: 0,
      y: 0,
      duration: 0.4,
      ease: 'power3.out',
    })
  }, { scope: ref })

  return ref
}

export function useFadeIn(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    gsap.fromTo(ref.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' })
  }, { dependencies: deps, scope: ref })

  return ref
}

export function useStaggerIn(deps: unknown[] = []) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!ref.current) return
    gsap.from(ref.current.children, {
      opacity: 0,
      y: 30,
      stagger: 0.1,
      duration: 0.5,
      ease: 'power2.out',
    })
  }, { dependencies: deps, scope: ref })

  return ref
}
