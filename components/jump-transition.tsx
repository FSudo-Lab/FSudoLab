'use client'

// "Blob swallow": clicking any in-page link (navbar, phone menu, logo, footer, hero buttons…)
// no longer scrolls the whole page past the reader. A violet liquid blob grows out of the click,
// swallows the screen, the page jumps to the section underneath it, and the blob then opens
// from the middle like a portal onto the new section (~1 s in all). No long scroll = no lag.
// Reduced motion: the page simply jumps.

import { useEffect, useRef } from 'react'

const COVER = 400 // blob grows from the click until it fills the screen
const HOLD = 220 // fully covered: the page jumps underneath, the section name shows
const OPEN = 500 // the portal opens from the middle

const inCubic = (t: number) => t * t * t
const outCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const N = 40 // points around the blob's edge

/** A closed, wobbly, smooth blob outline (Catmull-Rom through N points → cubic Béziers). */
function blobPath(cx: number, cy: number, R: number, wob: number, t: number) {
  const pts: [number, number][] = []
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2
    const w = Math.sin(3 * a + t * 2.3) * 0.5 + Math.sin(5 * a - t * 1.9) * 0.3 + Math.sin(2 * a + t * 1.1) * 0.2
    const r = Math.max(0, R * (1 + wob * w))
    pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r])
  }
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N]
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6
    d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d + 'Z'
}

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
  const rootRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const fillRef = useRef<SVGPathElement>(null)
  const rimRef = useRef<SVGPathElement>(null)
  const gradRef = useRef<SVGRadialGradientElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const html = document.documentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let busy = false

    const jump = (id: string) => {
      const top = targetTop(id)
      if (top === null) return false
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
      return true
    }

    const play = (id: string, x: number, y: number, label: string) => {
      const root = rootRef.current, svg = svgRef.current, fill = fillRef.current, rim = rimRef.current
      const grad = gradRef.current, lab = labelRef.current
      if (!root || !svg || !fill || !rim || !grad || !lab) return void jump(id)
      busy = true
      const W = window.innerWidth, H = window.innerHeight
      svg.setAttribute('viewBox', `0 0 ${W} ${H}`)
      const frame = `M-2 -2H${W + 2}V${H + 2}H-2Z`
      const far = (px: number, py: number) => Math.hypot(Math.max(px, W - px), Math.max(py, H - py))
      const coverR = far(x, y) * 1.25
      const openR = far(W / 2, H / 2) * 1.3
      lab.textContent = label
      root.style.display = 'block'
      let start = performance.now()
      let jumped = false

      const step = (now: number) => {
        const e = now - start
        const t = now / 1000
        if (e < COVER) {
          // Grow out of the click: wobbly while small, rounder as it fills the screen.
          const u = inCubic(clamp01(e / COVER))
          grad.setAttribute('cx', String(x)); grad.setAttribute('cy', String(y)); grad.setAttribute('r', String(coverR))
          fill.setAttribute('d', blobPath(x, y, 6 + u * coverR, 0.14 * (1 - u * 0.5), t))
          rim.setAttribute('d', '')
          lab.style.opacity = '0'
        } else if (e < COVER + HOLD) {
          fill.setAttribute('d', frame)
          grad.setAttribute('cx', String(W / 2)); grad.setAttribute('cy', String(H / 2)); grad.setAttribute('r', String(openR))
          if (!jumped) { jumped = true; jump(id) }
          const h = clamp01((e - COVER) / HOLD)
          lab.style.opacity = String(Math.min(1, h * 3))
          lab.style.transform = `translate3d(0,${((1 - outCubic(h)) * 14).toFixed(1)}px,0)`
        } else if (e < COVER + HOLD + OPEN) {
          // The portal: a wobbly hole opens from the middle, with a soft bright rim.
          const u = outCubic(clamp01((e - COVER - HOLD) / OPEN))
          const hole = blobPath(W / 2, H / 2, u * openR, 0.12 * (1 - u * 0.6), t)
          fill.setAttribute('d', frame + hole)
          rim.setAttribute('d', hole)
          rim.style.opacity = String(1 - u)
          lab.style.opacity = String(Math.max(0, 1 - u * 6))
          lab.style.transform = `translate3d(0,0,0) scale(${(1 + u * 0.35).toFixed(3)})`
        } else {
          root.style.display = 'none'
          fill.setAttribute('d', ''); rim.setAttribute('d', '')
          busy = false
          return
        }
        requestAnimationFrame(step)
      }
      requestAnimationFrame((now) => { start = now; step(now) })
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
      if (reduced.matches) return void jump(id)
      // Keyboard "clicks" have no pointer position: start from the link itself.
      const r = a.getBoundingClientRect()
      const x = e.clientX || e.detail ? e.clientX : r.left + r.width / 2
      const y = e.clientY || e.detail ? e.clientY : r.top + r.height / 2
      const label = (a.dataset.jumpLabel || a.textContent || '').replace(/\s+/g, ' ').trim()
      play(id, x, y, label.length > 28 || id === 'top' ? 'FSudoLab' : label)
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <div ref={rootRef} className="jump-veil" aria-hidden="true">
      <svg ref={svgRef} className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <defs>
          <radialGradient ref={gradRef} id="jump-fill" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="1">
            <stop offset="0" stopColor="#8d569e" />
            <stop offset="0.35" stopColor="#58357d" />
            <stop offset="0.7" stopColor="#3c2357" />
            <stop offset="1" stopColor="#1d1238" />
          </radialGradient>
        </defs>
        <path ref={fillRef} fill="url(#jump-fill)" fillRule="evenodd" />
        <path ref={rimRef} fill="none" stroke="#e7b8ff" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 14px #c447f0)' }} />
      </svg>
      <span ref={labelRef} className="jump-label">FSudoLab</span>
    </div>
  )
}
