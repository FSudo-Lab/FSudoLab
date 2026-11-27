'use client'

// Fixed layers behind the page content:
//   z-0  section background bands (absolute, scroll with the page)
//   z-1  the signature blob (WebGL, or a CSS blob that still follows the scroll)
// Content sits at z-[2]. Also drives the navbar theme, scroll progress and [data-reveal] animations.

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import { navSpace, readAnchorTarget } from './anchors'
import { DEFAULT_POSE, getBreakpoint } from './config'
import { detectTier, type Tier } from './quality'

const BlobScene = dynamic(() => import('./BlobScene'), { ssr: false })

type Mode = { kind: 'pending' } | { kind: 'webgl'; tier: Tier; locked: boolean } | { kind: 'css' }

function webglAvailable() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

function prefersSavingData() {
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return !!conn?.saveData || window.matchMedia('(prefers-reduced-data: reduce)').matches
}

export function BlobStage() {
  const bgRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<Mode>({ kind: 'pending' })
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduced(rm.matches)
    sync()
    rm.addEventListener('change', sync)
    // Data saver → no WebGL at all; the lightweight CSS blob keeps the signature on screen.
    // ?blobtier=high|medium|low forces a tier (testing); ?blobfallback forces the CSS blob.
    const params = new URLSearchParams(window.location.search)
    const forced = params.get('blobtier') as Tier | null
    const useWebgl = webglAvailable() && !prefersSavingData() && !params.has('blobfallback')
    const isForced = !!forced && ['high', 'medium', 'low'].includes(forced)
    setMode(useWebgl ? { kind: 'webgl', tier: isForced ? forced! : detectTier(), locked: isForced } : { kind: 'css' })
    return () => rm.removeEventListener('change', sync)
  }, [])

  // Section backgrounds: one colour band per [data-bg] section, painted behind the blob,
  // with a soft gradient where two chapters meet. Every section keeps its own colour even
  // when two are on screen, so text contrast is always right.
  useEffect(() => {
    const layer = bgRef.current
    if (!layer) return
    let frame = 0
    let recolorFrame = 0
    let idle = 0
    // Geometry is measured only when layout really changes (resize, a section changing size,
    // load). Scrolling never needs it — band positions are in page coordinates — so a colour
    // change mid-scroll (Selected work: navy → warm white) only repaints, with no layout work.
    let geo: { el: HTMLElement; top: number; height: number }[] = []
    let SEAM = 240
    const paint = () => {
      recolorFrame = 0
      geo.forEach(({ el, top, height }, i) => {
        const band = layer.children[i] as HTMLDivElement | undefined
        if (!band) return
        const color = el.dataset.bg!
        // data-bg-end: the colour a section finishes on (e.g. Selected work starts navy, ends warm white).
        const prev = geo[i - 1] ? (geo[i - 1]!.el.dataset.bgEnd ?? geo[i - 1]!.el.dataset.bg) : undefined
        const blend = !!prev && prev !== color
        const t = top - (blend ? SEAM / 2 : 0)
        const h = height + (blend ? SEAM / 2 : 0)
        const bg = blend
          ? `linear-gradient(to bottom, ${prev} 0, color-mix(in oklab, ${prev} 80%, ${color}) ${SEAM * 0.25}px, color-mix(in oklab, ${prev} 50%, ${color}) ${SEAM * 0.5}px, color-mix(in oklab, ${prev} 20%, ${color}) ${SEAM * 0.75}px, ${color} ${SEAM}px)`
          : color
        const css = `position:absolute;left:0;right:0;top:${t}px;height:${h}px;background:${bg}`
        if (band.style.cssText !== css) band.style.cssText = css
      })
    }
    const build = () => {
      frame = 0
      // Only sections actually on the page (the intro removes itself once it has played).
      const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]')).filter((el) => el.offsetParent !== null)
      // Collapse first so the layer never props the page up at an old, taller height.
      layer.style.height = '0px'
      layer.style.height = `${document.documentElement.scrollHeight}px`
      while (layer.children.length < sections.length) layer.appendChild(document.createElement('div'))
      while (layer.children.length > sections.length) layer.lastElementChild?.remove()
      // Colour changes between chapters are long, eased blends that straddle the boundary
      // (starting half a blend inside the previous chapter), not a band at the next one's top.
      SEAM = Math.round(Math.min(320, Math.max(180, window.innerHeight * 0.3)))
      geo = sections.map((el) => {
        const r = el.getBoundingClientRect()
        return { el, top: r.top + window.scrollY, height: r.height }
      })
      paint()
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(build)
    }
    const recolor = () => {
      if (!recolorFrame) recolorFrame = requestAnimationFrame(paint)
    }
    // Safety net: re-measure once scrolling has paused (never during the scroll itself).
    const onScroll = () => {
      window.clearTimeout(idle)
      idle = window.setTimeout(schedule, 400)
    }
    build()
    const ro = new ResizeObserver(schedule)
    ro.observe(document.body)
    document.querySelectorAll('[data-bg]').forEach((el) => ro.observe(el))
    const mo = new MutationObserver(recolor)
    document.querySelectorAll('[data-bg]').forEach((el) => mo.observe(el, { attributes: true, attributeFilter: ['data-bg'] }))
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('load', schedule)
    return () => {
      mo.disconnect()
      cancelAnimationFrame(frame)
      cancelAnimationFrame(recolorFrame)
      window.clearTimeout(idle)
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('load', schedule)
    }
  }, [])

  // Navbar theme follows the section directly under the navbar.
  useEffect(() => {
    let frame = 0
    const sectionAt = (y: number) => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-bg]'))) {
        const r = el.getBoundingClientRect()
        if (r.top <= y && r.bottom > y) return el
      }
      return null
    }
    // A dark card on a light chapter (or the reverse) can sit under the navbar too.
    const cardAt = (y: number) => {
      for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-nav-theme]'))) {
        const r = el.getBoundingClientRect()
        if (r.top <= y && r.bottom > y) return el.dataset.navTheme
      }
      return null
    }
    const update = () => {
      frame = 0
      const y = navSpace() - 40
      const theme = cardAt(y) ?? sectionAt(y)?.dataset.theme ?? 'light'
      document.documentElement.dataset.storyTheme = theme
      // Overall reading progress, for the chapter rail.
      const max = document.documentElement.scrollHeight - window.innerHeight
      document.documentElement.style.setProperty('--read', String(max > 0 ? Math.min(1, window.scrollY / max) : 0))
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    // Sections that switch theme mid-scroll (Selected work: dark → light) update the navbar at once.
    const mo = new MutationObserver(schedule)
    document.querySelectorAll('[data-bg]').forEach((el) => mo.observe(el, { attributes: true, attributeFilter: ['data-theme'] }))
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      mo.disconnect()
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  // Scroll-in reveals. Content stays visible if this never runs.
  useEffect(() => {
    document.documentElement.classList.add('reveal-ready')
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in')
            io.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={bgRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-0 bg-[#fbfafc]" />
      <div aria-hidden="true" className="blob-layer pointer-events-none fixed inset-0 z-[1]">
        {mode.kind === 'webgl' && <BlobScene initialTier={mode.tier} lockTier={mode.locked} reduced={reduced} />}
        {mode.kind === 'css' && <CssBlob />}
      </div>
    </>
  )
}

/** Lightweight fallback: the CSS signature blob, still gliding between the same anchors. */
function CssBlob() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const pose = { ...DEFAULT_POSE }
    const cur = { ...DEFAULT_POSE }
    let frame = 0
    let first = true
    const tick = () => {
      const W = window.innerWidth
      const H = window.innerHeight
      readAnchorTarget(getBreakpoint(W), pose)
      const k = first ? 1 : 0.12
      first = false
      cur.x += (pose.x - cur.x) * k
      cur.y += (pose.y - cur.y) * k
      cur.s += (pose.s - cur.s) * k
      cur.o += (pose.o - cur.o) * k
      const r = (cur.s * Math.min(W * 0.95, H)) / 2
      const el = ref.current
      if (el) {
        el.style.left = `${((cur.x + 1) / 2) * W - r}px`
        el.style.top = `${((1 - cur.y) / 2) * H - r}px`
        el.style.width = el.style.height = `${r * 2}px`
        el.style.opacity = String(cur.o)
      }
      frame = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <div ref={ref} className="hero-blob hero-blob-one" style={{ zIndex: 0 }} />
}
