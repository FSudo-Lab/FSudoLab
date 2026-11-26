'use client'

import { useRef } from 'react'
import { story } from '@/lib/story-content'
import { usePinnedTrack } from '@/components/story/use-pinned-track'

// "Meet our team", told the same way as "What we offer": the section holds still and, as you
// scroll, the cards glide sideways on a dark stage. The card in the middle is lit and in colour,
// the others wait dimmed.
// The team film has its own scene just before this one (components/video-section.tsx).
// Copy and members live in lib/story-content.ts (story.insights).

type Card = { kind: 'member'; name: string; role: string; photo: string }

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('')
}

export function TeamSection() {
  const c = story.insights
  const cards: Card[] = c.members.map((m) => ({ kind: 'member' as const, ...m }))
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLOListElement>(null)
  const { active, pinned } = usePinnedTrack(sectionRef, trackRef, { pace: 1.35 })
  const n = cards.length

  return (
    <section
      ref={sectionRef}
      id="insights"
      data-bg={c.bg}
      data-theme="dark"
      data-blob-anchor="insights"
      className={`team-dark relative z-[2] ${pinned ? 'h-[360vh]' : 'py-24'}`}
    >
      <div className={pinned ? 'sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-[calc(env(safe-area-inset-top)+6rem)] pb-8' : ''}>
        <div className="mx-auto w-full max-w-7xl px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
          <div className="mt-4 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <h2 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{c.title}</h2>
            <p className="hidden max-w-sm text-lg leading-7 text-white/65 sm:block">{c.body}</p>
          </div>
        </div>

        <div className="mt-8 lg:mt-12">
          <ol ref={trackRef} className={pinned ? 'team-track flex w-max items-stretch gap-5 will-change-transform sm:gap-8' : 'mx-auto grid max-w-7xl gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:px-10'}>
            {cards.map((card, i) => (
              <li
                key={i}
                data-track-item
                className={`team-slide ${!pinned || i === active ? 'is-active' : ''}`}
                aria-label={`${card.name}, ${card.role}`}
              >
                <div className="team-frame lg relative overflow-hidden rounded-[1.75rem]">
                  <div className="team-media">
                    {card.photo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={card.photo} alt="" loading="lazy" className="size-full object-cover" />
                    ) : (
                      <div className="team-placeholder">
                        <span className="team-blob" aria-hidden />
                        <span className="relative text-5xl font-semibold tracking-[-0.04em] text-white/95 sm:text-6xl">{initials(card.name) || 'FS'}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-3 px-5 py-4 text-[13px]">
                    <span className="truncate text-white/60">{card.role}</span>
                    <span className="flex min-w-0 items-center gap-2 font-semibold uppercase tracking-[0.08em] text-white">
                      <span aria-hidden className="h-px w-6 shrink-0 bg-white/30" />
                      <span className="truncate">{card.name}</span>
                    </span>
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
