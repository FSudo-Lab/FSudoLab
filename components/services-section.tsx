'use client'

import { useRef } from 'react'
import { story } from '@/lib/story-content'
import { usePinnedTrack } from '@/components/story/use-pinned-track'

// "What we offer", told like a slow film strip: the section holds still and, as you scroll, the
// service cards glide sideways. The card in the middle is lit, the others wait dimmed.
// Copy lives in lib/story-content.ts (story.services).
export function ServicesSection() {
  const c = story.services
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const { active, pinned } = usePinnedTrack(sectionRef, trackRef, { pace: 1.35 })
  const n = c.items.length

  return (
    <section ref={sectionRef} id="services" data-bg={c.bg} data-theme="dark" className={`services services-dark relative z-[2] ${pinned ? 'h-[320vh]' : 'py-24'}`}>
      <div className={pinned ? 'sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-[calc(env(safe-area-inset-top)+6rem)] pb-8' : ''}>
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
          <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 className="max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
              {c.title} <span className="text-[#e782f5]">{c.accent}</span>
            </h2>
            <p className="hidden max-w-sm text-lg leading-7 text-white/65 sm:block">{c.body}</p>
          </div>
        </div>

        <div className="mt-8 lg:mt-12">
          <ol ref={trackRef} className={pinned ? 'services-track flex w-max items-stretch gap-5 will-change-transform sm:gap-8' : 'mx-auto grid max-w-7xl gap-4 px-6 sm:grid-cols-2 lg:grid-cols-4 lg:px-10'}>
            {c.items.map((item, i) => (
              <li key={item.name} data-track-item className={`service-slide ${!pinned || i === active ? 'is-active' : ''}`}>
                <div className="service-card lg relative flex h-full min-h-[min(52svh,440px)] flex-col rounded-[2rem] p-6 sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className="text-5xl font-semibold tracking-[-0.06em] text-white/15 sm:text-7xl">{String(i + 1).padStart(2, '0')}</span>
                    <span aria-hidden className="service-orb size-10 rounded-full sm:size-12" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.03em] text-white sm:mt-8 sm:text-3xl">{item.name}</h3>
                  <p className="mt-3 text-[15px] leading-6 text-white/70 sm:text-base sm:leading-7">{item.text}</p>
                  <div className="mt-auto pt-6">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#e782f5]">Example</p>
                      <p className="mt-1.5 text-sm leading-6 text-white/80">{item.example}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {pinned && (
          <div className="mx-auto mt-8 flex w-full max-w-7xl items-center gap-4 px-6 text-xs font-semibold tracking-[0.2em] text-white/45 lg:mt-10 lg:px-10" aria-hidden>
            <span className="tabular-nums text-white">{String(active + 1).padStart(2, '0')}</span>
            <span className="relative h-px flex-1 overflow-hidden bg-white/15">
              <span className="absolute inset-y-0 left-0 w-full origin-left bg-[#e782f5]" style={{ transform: 'scaleX(var(--pin-p, 0))' }} />
            </span>
            <span className="tabular-nums">{String(n).padStart(2, '0')}</span>
          </div>
        )}
      </div>
    </section>
  )
}
