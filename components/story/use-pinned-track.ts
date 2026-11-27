'use client'

import { type RefObject, useEffect, useState } from 'react'
import { stableVh } from '@/lib/viewport'

// Srut-style pinned strip: the section is made tall, its inner frame sticks to the screen, and
// scrolling down slides `track` sideways. The item nearest the middle of the screen is "active".
// `pace` = page pixels scrolled per pixel the strip moves (higher = slower, more deliberate).
// With reduced motion the strip is not pinned (returns pinned = false) and nothing moves.

export function usePinnedTrack(
  sectionRef: RefObject<HTMLElement | null>,
  trackRef: RefObject<HTMLElement | null>,
  { pace = 1.25, itemSelector = '[data-track-item]' }: { pace?: number; itemSelector?: string } = {},
) {
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(true)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setPinned(!mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return
    if (!pinned) {
      section.style.height = ''
      track.style.transform = ''
      return
    }
    let frame = 0
    let last = -1
    let travel = 0
    let shown = -1 // eased progress actually drawn (follows the scroll with a soft lag)

    // Item centres along the track, measured once (not every frame), so finding the middle
    // item is plain arithmetic with no layout reads while scrolling.
    let centres: number[] = []
    let viewW = 0
    const measure = () => {
      const vh = stableVh()
      viewW = track.parentElement!.clientWidth
      travel = Math.max(0, track.scrollWidth - viewW)
      section.style.height = `${Math.round(vh + travel * pace)}px`
      centres = Array.from(track.querySelectorAll<HTMLElement>(itemSelector)).map((el) => el.offsetLeft + el.offsetWidth / 2)
    }
    const update = () => {
      frame = 0
      const vh = stableVh()
      const r = section.getBoundingClientRect()
      const span = Math.max(1, r.height - vh)
      const target = Math.min(1, Math.max(0, -r.top / span))
      // Ease toward the scroll position so the strip glides even on notchy mouse wheels and touch.
      shown = shown < 0 ? target : shown + (target - shown) * 0.16
      if (Math.abs(target - shown) < 0.0004) shown = target
      const p = shown
      track.style.transform = `translate3d(${(-p * travel).toFixed(2)}px,0,0)`
      section.style.setProperty('--pin-p', p.toFixed(4))
      const mid = p * travel + viewW / 2
      let best = 0
      let bestD = Infinity
      centres.forEach((c, i) => {
        const d = Math.abs(c - mid)
        if (d < bestD) { bestD = d; best = i }
      })
      if (best !== last) { last = best; setActive(best) }
      if (shown !== target) frame = requestAnimationFrame(update)
    }
    const req = () => { if (!frame) frame = requestAnimationFrame(update) }
    const onResize = () => { measure(); req() }

    measure()
    update()
    const ro = new ResizeObserver(onResize)
    ro.observe(track)
    // After a jump link the strip lands in place instead of sliding from where it was.
    const onJump = () => { shown = -1; req() }
    window.addEventListener('fs:jump', onJump)
    window.addEventListener('scroll', req, { passive: true })
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('fs:jump', onJump)
      cancelAnimationFrame(frame)
      ro.disconnect()
      window.removeEventListener('scroll', req)
      window.removeEventListener('resize', onResize)
      section.style.height = ''
      track.style.transform = ''
    }
  }, [sectionRef, trackRef, pinned, pace, itemSelector])

  return { active, pinned }
}
