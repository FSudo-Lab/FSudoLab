'use client'

import { useEffect, useRef } from 'react'

// A soft light that follows the pointer across its parent section (like a torch in a dark room).
// Mouse/trackpad: it follows the cursor. Touch screens: it follows your finger while you touch,
// and drifts slowly across the section on its own the rest of the time.
export function Spotlight({ color = 'rgba(231, 130, 245, 0.16)', size = 520 }: { color?: string; size?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let x = 0
    let y = 0
    let touchedAt = -1e9
    // Moved with a transform only (no repaint), so it stays smooth at 60 fps+.
    const half = size / 2
    const paint = () => {
      frame = 0
      el.style.transform = `translate3d(${(x - half).toFixed(1)}px, ${(y - half).toFixed(1)}px, 0)`
      el.style.opacity = '1'
    }
    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect()
      x = e.clientX - r.left
      y = e.clientY - r.top
      if (e.pointerType !== 'mouse') touchedAt = performance.now()
      if (!frame) frame = requestAnimationFrame(paint)
    }
    const onLeave = (e: PointerEvent) => { if (e.pointerType === 'mouse') el.style.opacity = '0' }
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerdown', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)

    // Touch screens: an idle drift while the section is on screen.
    let drift = 0
    let visible = false
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting
      if (visible && !drift) drift = requestAnimationFrame(wander)
    })
    const wander = (now: number) => {
      drift = 0
      if (!visible) return
      if (now - touchedAt > 2500) {
        const w = host.clientWidth
        const h = host.clientHeight
        const t = now / 1000
        x = w * (0.5 + 0.32 * Math.sin(t * 0.35))
        y = h * (0.42 + 0.22 * Math.sin(t * 0.5 + 1.3))
        paint()
      }
      drift = requestAnimationFrame(wander)
    }
    if (!reduced && window.matchMedia('(pointer: coarse)').matches) io.observe(host)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(drift)
      io.disconnect()
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerdown', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [size])
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        ref={ref}
        className="spotlight absolute left-0 top-0"
        style={{ width: size, height: size, background: `radial-gradient(closest-side, ${color}, transparent)` }}
      />
    </div>
  )
}
