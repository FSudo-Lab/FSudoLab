'use client'

import { useEffect } from 'react'

// Slow, eased scrolling for the free part of the page (from "Selected work" down), the way
// thefinestpour.com (Srut) feels: each wheel / trackpad movement sets a target and the page
// eases towards it instead of jumping. The story part above keeps its scene-by-scene glide
// (SceneStepper handles those wheel events first and marks them as handled).
// Touch swipes keep the phone's own momentum (they send no wheel events); off for reduced motion.

const EASE = 0.085 // share of the remaining distance covered each frame (lower = floatier)

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const html = document.documentElement

    const freeFrom = () => {
      const el = document.getElementById('projects')
      if (!el) return 0
      // While Selected work's handoff is pinned, its beats glide (SceneStepper); free scroll starts after.
      if (el.dataset.handoff === 'on') return Math.round(el.getBoundingClientRect().top + window.scrollY + Math.max(0, el.offsetHeight - window.innerHeight))
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      return Math.round(el.getBoundingClientRect().top + window.scrollY - margin)
    }
    const inScrollable = (t: EventTarget | null) => {
      let el = t as HTMLElement | null
      while (el && el !== document.body) {
        if (el.matches?.('input, textarea, select, [data-own-scroll], [role=dialog]')) return true
        const st = getComputedStyle(el)
        if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 2) return true
        el = el.parentElement
      }
      return false
    }

    let target = window.scrollY
    let current = window.scrollY
    let lastSet = -1
    let raf = 0
    let floor = 0

    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    const step = () => {
      // Someone else moved the page (scrollbar drag, keyboard, a link, the story glide): let go.
      if (lastSet >= 0 && Math.abs(window.scrollY - lastSet) > 3) { stop(); return }
      current += (target - current) * EASE
      if (Math.abs(target - current) < 0.4) current = target
      lastSet = Math.round(current)
      window.scrollTo({ top: current, behavior: 'instant' as ScrollBehavior })
      lastSet = window.scrollY
      if (current !== target) raf = requestAnimationFrame(step)
      else raf = 0
    }

    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || html.dataset.intro === 'on' || inScrollable(e.target)) return
      floor = freeFrom()
      if (window.scrollY < floor - 2) return
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1
      const max = html.scrollHeight - window.innerHeight
      if (!raf) { target = current = window.scrollY; lastSet = -1 }
      const next = Math.min(max, Math.max(floor, target + e.deltaY * unit))
      // Scrolling up from the very top of "Selected work" belongs to the story glide.
      if (next === target && e.deltaY < 0) return
      e.preventDefault()
      target = next
      if (!raf) raf = requestAnimationFrame(step)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    return () => {
      stop()
      window.removeEventListener('wheel', onWheel)
    }
  }, [])

  return null
}
