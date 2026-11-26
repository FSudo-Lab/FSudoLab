'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'

// "What our partners say": one quote at a time on a liquid-glass card (same glass as the navbar),
// with soft blob shapes behind it so the glass has something to bend. Quotes change on their own
// every few seconds (paused while you hover or focus it), or with the partner chips below.
// The quotes are PLACEHOLDERS — edit them in lib/story-content.ts (story.testimonials).

const AUTO_MS = 7000

export function TestimonialsSection() {
  const c = story.testimonials
  const logos = Object.fromEntries(story.partners.items.map((p) => [p.name, p.logo]))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const n = c.items.length

  useEffect(() => {
    if (paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    let visible = false
    const io = new IntersectionObserver(([e]) => { visible = !!e?.isIntersecting })
    if (el) io.observe(el)
    const t = window.setInterval(() => { if (visible && !document.hidden) setIndex((i) => (i + 1) % n) }, AUTO_MS)
    return () => { window.clearInterval(t); io.disconnect() }
  }, [paused, n])

  return (
    <section
      ref={ref}
      id="testimonials"
      data-bg={c.bg}
      data-theme="dark"
      className="relative z-[2] overflow-hidden px-6 pb-28 pt-10 text-white lg:px-10 lg:pb-36"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <span className="testi-orb" style={{ left: '12%', top: '30%', width: 'clamp(120px,16vw,240px)' }} />
        <span className="testi-orb" style={{ right: '10%', top: '48%', width: 'clamp(150px,20vw,300px)', animationDelay: '-4s' }} />
        <span className="testi-orb" style={{ left: '46%', top: '8%', width: 'clamp(60px,7vw,110px)', animationDelay: '-7s' }} />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <p data-reveal className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
        <h2 data-reveal className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">{c.title}</h2>

        <figure data-lg-refract className="testi-card lg relative mt-12 rounded-[2rem] px-6 py-10 sm:px-12 sm:py-14" aria-live="polite">
          <span aria-hidden className="absolute left-6 top-4 font-serif text-7xl leading-none text-[#e782f5]/60 sm:left-10 sm:text-8xl">“</span>
          <div className="testi-stack grid">
            {c.items.map((t, i) => (
              <div key={i} aria-hidden={i !== index} className={`testi-slide col-start-1 row-start-1 ${i === index ? 'is-active' : ''}`}>
                <blockquote className="text-xl font-medium leading-relaxed tracking-[-0.02em] text-white/95 sm:text-2xl lg:text-[1.75rem] lg:leading-[1.5]">{t.quote}</blockquote>
                <figcaption className="mt-8 flex items-center justify-center gap-4">
                  {logos[t.partner] && (
                    <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/90">
                      <Image src={logos[t.partner]!} alt="" width={96} height={48} className="h-6 w-auto max-w-[80%] object-contain" />
                    </span>
                  )}
                  <span className="text-left">
                    <span className="block font-semibold">{t.name}</span>
                    <span className="block text-sm text-white/60">{t.role}</span>
                  </span>
                </figcaption>
              </div>
            ))}
          </div>
        </figure>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Choose a testimonial">
          {c.items.map((t, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              onClick={() => setIndex(i)}
              className={`testi-chip lg-chip rounded-full px-4 py-2 text-xs font-semibold tracking-[0.06em] ${i === index ? 'is-active' : ''}`}
            >
              {t.partner}
              {i === index && !paused && <span aria-hidden className="testi-timer" style={{ animationDuration: `${AUTO_MS}ms` }} key={index} />}
            </button>
          ))}
        </div>
      </div>

      {/* Same pose as the partners anchor: the blob stays away until Contact arrives. */}
      <div aria-hidden data-blob-anchor="partners" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />
    </section>
  )
}
