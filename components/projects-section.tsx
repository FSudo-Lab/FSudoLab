'use client'

import { useEffect, useRef, useState } from 'react'
import { CodeWindow } from '@/components/code-window'
import { story } from '@/lib/story-content'

// Selected work — the signature moment. On desktop the section holds still for ~1.2 viewports of
// scroll and plays ONE continuous, reversible timeline (p = 0..1):
//   0–20%   Deliver composition held; the 3D box turns its broad face to the viewer (BlobScene)
//   20–40%  that face widens onto this frame's measured bounds; midnight navy → warm white
//   38–45%  the real HTML frame takes over at the exact same outline (violet edge = border)
//   40–52%  the last code lines type in (scrubbed, so a fast scroll passes straight through)
//   55–80%  inside the same, still frame: close-up on the chapter indicator, pulling back to the page
//   80–100% "Selected work" / project name / one sentence settle in and stay readable
// The 3D part reads the same progress in BlobScene's readHandoff(). Phones, tablets and
// reduced motion get the finished state. On phones the title and summary sit above a full-width frame.

const PIN = '(prefers-reduced-motion: no-preference)' // every screen size; only reduced motion skips it
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const band = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export function ProjectsSection() {
  const c = story.work
  const ref = useRef<HTMLElement>(null)
  const [pin, setPin] = useState(false)
  const [reveal, setReveal] = useState(1)
  const [shot, setShot] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(PIN)
    const set = () => setPin(mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  // A direct link to #work lands on the finished project (image and title visible).
  useEffect(() => {
    if (location.hash !== '#work') return
    requestAnimationFrame(() => document.getElementById('work')?.scrollIntoView({ behavior: 'instant' as ScrollBehavior }))
  }, [pin])

  useEffect(() => {
    const sec = ref.current
    if (!sec) return
    if (!pin) {
      sec.removeAttribute('style')
      setReveal(1)
      setShot(true)
      return
    }
    let frame = 0
    let lastReveal = -1
    let lastShot: boolean | null = null
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const r = sec.getBoundingClientRect()
      const p = clamp01(-r.top / Math.max(1, r.height - vh))
      const st = sec.style
      // Midnight navy → warm white. The colour is painted by BlobStage's band layer (under the
      // blob canvas, so the 3D box stays visible); it re-reads data-bg on every scroll.
      const navy = Math.round((1 - band(0.2, 0.4, p)) * 100)
      sec.dataset.bg = navy >= 100 ? '#11142f' : navy <= 0 ? c.bg : `color-mix(in oklab, #11142f ${navy}%, ${c.bg})`
      st.setProperty('--frame', band(0.36, 0.44, p).toFixed(3))
      st.setProperty('--edge', (1 - band(0.42, 0.62, p)).toFixed(3))
      st.setProperty('--code', (1 - band(0.55, 0.62, p)).toFixed(3))
      st.setProperty('--shot', band(0.55, 0.62, p).toFixed(3))
      st.setProperty('--zoom', (1 + 2.6 * (1 - band(0.6, 0.8, p))).toFixed(3))
      st.setProperty('--text', band(0.8, 0.92, p).toFixed(3))
      // The navbar and rail switch to their light look once the page has turned warm white.
      sec.dataset.theme = p < 0.3 ? 'dark' : 'light'
      const rv = Math.round(band(0.4, 0.52, p) * 60) / 60
      if (rv !== lastReveal) { lastReveal = rv; setReveal(rv) }
      const sh = p > 0.58
      if (sh !== lastShot) { lastShot = sh; setShot(sh) }
    }
    const req = () => { if (!frame) frame = requestAnimationFrame(update) }
    update()
    window.addEventListener('scroll', req, { passive: true })
    window.addEventListener('resize', req)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', req)
      window.removeEventListener('resize', req)
    }
  }, [pin])

  const text = (
    <div className={pin ? 'work-text' : ''}>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a329c8]">{c.chapter}</p>
      <h2 className="mt-5 text-5xl font-semibold leading-[0.98] tracking-[-0.05em] text-[#11142f] sm:text-6xl lg:text-7xl">{c.project}</h2>
      <span className="mt-5 inline-flex rounded-full border border-[#e2d9ec] bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6b2a91]">{c.tag}</span>
      <p className="mt-5 max-w-md text-lg leading-7 text-[#5a5b70]">{c.summary}</p>
      {c.link && (
        <a href={c.link} className="mt-7 inline-flex rounded-full bg-[#27275c] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#3b3383]">
          {c.linkLabel} <span aria-hidden className="ml-2">↗</span>
        </a>
      )}
    </div>
  )

  const preview = (
    <div data-work-frame className={pin ? 'work-frame' : ''}>
      <CodeWindow reveal={reveal} label={shot ? c.address : 'fsudolab / studio.ts'} className="aspect-[16/10] w-full">
        <div className="work-shot absolute inset-x-0 bottom-0 top-[45px] overflow-hidden bg-[#0f1230]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={c.image}
            alt={c.imageAlt}
            className="size-full object-cover object-top"
            style={pin ? { transform: 'scale(var(--zoom, 1))', transformOrigin: c.detailOrigin } : undefined}
          />
        </div>
      </CodeWindow>
    </div>
  )

  return (
    <section
      ref={ref}
      id="projects"
      data-bg={pin ? '#11142f' : c.bg}
      data-bg-end={c.bg}
      data-theme="light"
      data-handoff={pin ? 'on' : 'off'}
      className={`work relative z-[2] ${pin ? 'is-pinned h-[220vh]' : 'px-6 py-24'}`}
    >
      {pin ? (
        <div className="sticky top-0 h-svh overflow-hidden">
          <div className="relative mx-auto grid h-full max-w-7xl content-center items-center gap-6 px-6 pt-[var(--nav-space,6rem)] sm:gap-10 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:content-normal lg:gap-16">
            {text}
            {preview}
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-3xl">
          {text}
          <div className="mt-10">{preview}</div>
        </div>
      )}
      {/* #work = the finished project (end of the timeline); used by "See our work" and direct links. */}
      <span id="work" aria-hidden className="pointer-events-none absolute left-0 h-px w-px" style={{ top: pin ? 'calc(100% - 100svh)' : 0 }} />
      {/* The blob's "work" anchor: at the end while pinned (it stays the Deliver box until the handoff is
          done); at the top otherwise, so on phones / reduced motion it has fully beamed away by the title. */}
      <div aria-hidden data-blob-anchor="work" className={`pointer-events-none absolute inset-x-0 h-px ${pin ? 'bottom-0' : 'top-0'}`} />
    </section>
  )
}
