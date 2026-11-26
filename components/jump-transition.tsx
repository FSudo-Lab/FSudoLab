'use client'

// Jump links (navbar, phone menu, logo, footer, hero buttons…) don't scroll the whole page past
// the reader. A soft violet glow swells out of the click and covers the screen, the page jumps to
// the section underneath it, and the glow then melts away onto the new section (~0.85 s).
// Everything animates with transform + opacity only (GPU-composited, no repaints), so it stays
// smooth on phones. Reduced motion: the page simply jumps.

import { useEffect, useRef } from 'react'

const COVER = 380 // glow swells from the click until the screen is covered
const OPEN = 460 // glow melts away onto the new section
const ORB = 640 // orb's drawn size in px; it is scaled up (soft gradient, so scaling is invisible)

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const inOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2
const outQuart = (t: number) => 1 - Math.pow(1 - t, 4)

/** Page offset that puts this section where a normal link would (respects scroll-margin). */
function targetTop(id: string): number | null {
  if (id === 'top') return 0
  const el = document.getElementById(id)
  if (!el) return null
  const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
  const max = document.documentElement.scrollHeight - window.innerHeight
  return Math.round(Math.min(max, Math.max(0, el.getBoundingClientRect().top + window.scrollY - margin)))
}

export function JumpTransition() {
  const veilRef = useRef<HTMLDivElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let busy = false

    const jump = (id: string) => {
      const top = targetTop(id)
      if (top === null) return
      window.dispatchEvent(new Event('fs:jump'))
      html.style.scrollBehavior = 'auto'
      window.scrollTo({ top, behavior: 'instant' as ScrollBehavior })
      html.style.scrollBehavior = ''
      if (location.hash !== `#${id}`) history.pushState(null, '', `#${id}`)
      // Keyboard and screen-reader users continue from the new section.
      const el = document.getElementById(id)
      if (el) {
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
        el.focus({ preventScroll: true })
      }
    }

    const play = (id: string, x: number, y: number) => {
      const veil = veilRef.current, orb = orbRef.current
      if (!veil || !orb) return jump(id)
      busy = true
      const W = window.innerWidth, H = window.innerHeight
      // The orb's solid core ends at ~62% of its radius: scale it so that core reaches every corner.
      const far = Math.hypot(Math.max(x, W - x), Math.max(y, H - y))
      const full = (far / 0.62) / (ORB / 2)
      orb.style.left = `${x - ORB / 2}px`
      orb.style.top = `${y - ORB / 2}px`
      orb.style.transform = 'scale(0.01)'
      veil.style.opacity = '1'
      veil.style.display = 'block'

      let start = 0
      let phase: 'cover' | 'wait' | 'open' = 'cover'
      let waitFrames = 0
      const step = (now: number) => {
        if (!start) start = now
        if (phase === 'cover') {
          const u = inOutSine(clamp01((now - start) / COVER))
          orb.style.transform = `scale(${(0.01 + u * full).toFixed(4)})`
          if (u >= 1) { jump(id); phase = 'wait' }
        } else if (phase === 'wait') {
          // Give the new section (and the 3D blob) two frames to settle before revealing it.
          if (++waitFrames >= 2) { phase = 'open'; start = now }
        } else {
          const u = clamp01((now - start) / OPEN)
          const e = outQuart(u)
          veil.style.opacity = (1 - e).toFixed(3)
          orb.style.transform = `scale(${(full * (1 + 0.25 * e)).toFixed(4)})`
          if (u >= 1) {
            veil.style.display = 'none'
            busy = false
            return
          }
        }
        requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    }

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null
      if (!a) return
      const id = decodeURIComponent(a.getAttribute('href')!.slice(1))
      if (!id || html.dataset.intro === 'on') return
      if (id !== 'top' && !document.getElementById(id)) return
      e.preventDefault()
      if (busy) return
      if (reduced.matches) return jump(id)
      // Keyboard "clicks" have no pointer position: start from the link itself.
      const r = a.getBoundingClientRect()
      const pointer = e.detail > 0
      play(id, pointer ? e.clientX : r.left + r.width / 2, pointer ? e.clientY : r.top + r.height / 2)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div ref={veilRef} className="jump-veil" aria-hidden="true">
      <div ref={orbRef} className="jump-orb" />
    </div>
  )
}
