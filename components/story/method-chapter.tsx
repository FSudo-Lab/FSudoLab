'use client'

// Pinned chapter: the content stays on screen (CSS sticky) while you scroll
// through three steps. Each step is an invisible full-height marker carrying a
// blob pose, so the blob morphs Discover → Design → Deliver.

import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'
import { useScrollProgress } from './use-scroll-progress'

export function MethodChapter() {
  const c = story.method
  const [active, setActive] = useState(0)
  const markers = useRef<(HTMLDivElement | null)[]>([])
  const ref = useRef<HTMLElement>(null)
  useScrollProgress(ref)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step))
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    markers.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      id="about-us"
      data-bg={c.bg}
      data-theme="dark"
      className="relative z-[2] text-white"
      style={{ height: `${c.steps.length * 100}svh` }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {c.steps.map((step, i) => (
          <div
            key={step.name}
            ref={(el) => {
              markers.current[i] = el
            }}
            data-step={i}
            data-blob-anchor={`method-${i}`}
            className="h-svh"
          />
        ))}
      </div>

      <div className="sticky top-0 flex h-svh items-end overflow-hidden px-6 pb-52 pt-28 md:items-center md:pb-0 lg:px-10">
        <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:72px_72px]" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-7xl text-center md:text-left">
          <div className="mx-auto max-w-xl [text-shadow:0_2px_24px_rgba(10,12,40,0.6)] md:mx-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
            <h2 className="mt-5 text-4xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-5xl lg:text-7xl">
              {c.title} <span className="text-[#d65be0]">{c.accent}</span>
            </h2>
            <p className="mt-5 hidden max-w-lg text-lg leading-8 text-white/65 md:block">{c.body}</p>

            <ol className="mt-8 flex flex-wrap justify-center gap-2 md:mt-10 md:flex-nowrap md:flex-col md:justify-start md:gap-0 md:border-l md:border-white/15">
              {c.steps.map((step, i) => {
                const isActive = i === active
                return (
                  <li key={step.name} className={`transition-all duration-500 md:-ml-px md:border-l-2 md:py-3 md:pl-6 ${isActive ? 'md:border-[#d65be0]' : 'md:border-transparent'}`}>
                    <div className={`flex items-baseline gap-2 rounded-full border px-2.5 py-1.5 text-sm min-[360px]:gap-3 min-[360px]:px-3 md:rounded-none md:border-0 md:p-0 md:text-base ${isActive ? 'border-[#d65be0] bg-white/10 text-white' : 'border-white/20 text-white/45'}`}>
                      <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                      <span className="font-semibold md:text-2xl">{step.name}</span>
                    </div>
                    <div className={`hidden overflow-hidden transition-all duration-500 md:grid ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                      <p className="min-h-0 max-w-md pt-2 text-sm leading-6 text-white/65">{step.text}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
            <p className="mt-4 min-h-[3rem] text-sm leading-6 text-white/70 md:hidden" aria-live="polite">{c.steps[active].text}</p>

            <div className="mt-8 hidden items-center justify-between border-t border-white/15 pt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45 md:flex">
              <span>{String(active + 1).padStart(2, '0')} / {String(c.steps.length).padStart(2, '0')}</span>
              <span className="relative mx-6 h-px flex-1 bg-white/15" aria-hidden="true">
                <span className="absolute inset-y-0 left-0 w-full origin-left bg-[#d65be0]" style={{ transform: 'scaleX(var(--p, 0))' }} />
              </span>
              <span>FS / 2026</span>
            </div>
          </div>
          <blockquote className="mt-10 hidden max-w-sm text-xl font-medium leading-snug tracking-[-0.03em] text-white/80 lg:absolute lg:bottom-0 lg:right-0 lg:mt-0 lg:block">“{c.quote}”</blockquote>
        </div>
      </div>
    </section>
  )
}
