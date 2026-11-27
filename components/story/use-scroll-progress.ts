'use client'

// Writes how far you have scrolled through a pinned (sticky) chapter into the CSS
// variable --p on that element: 0 when the chapter reaches the top, 1 when it is
// about to scroll away. CSS uses --p to scrub text in step with the scroll.
// Runs in requestAnimationFrame and never re-renders React.

import { type RefObject, useEffect } from 'react'
import { stableVh } from '@/lib/viewport'

export function useScrollProgress(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let frame = 0
    const update = () => {
      frame = 0
      const r = el.getBoundingClientRect()
      const travel = Math.max(1, r.height - stableVh())
      const p = Math.min(1, Math.max(0, -r.top / travel))
      el.style.setProperty('--p', p.toFixed(4))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [ref])
}
