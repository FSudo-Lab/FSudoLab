'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'
import { usePinnedTrack } from '@/components/story/use-pinned-track'

// Partners: the section holds still while the strip of partner names and logo tiles glides
// sideways as you scroll (on every screen size); the partner in the middle lights up. With
// reduced motion it is a strip you swipe. Every partner opens a glass pop-up.
// Partner details live in lib/story-content.ts (story.partners.items).

type Partner = (typeof story.partners.items)[number]

export function PartnersSection() {
  const c = story.partners
  const sectionRef = useRef<HTMLElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<Partner | null>(null)
  const { active, pinned } = usePinnedTrack(sectionRef, trackRef, { pace: 1.1, itemSelector: '[data-partner]' })

  return (
    <section ref={sectionRef} id="partners" data-bg={c.bg} data-theme="dark" className={`partners-dark relative z-[2] ${pinned ? 'h-[260svh]' : 'py-24'}`}>
      <div className={pinned ? 'sticky top-0 flex h-svh flex-col justify-center overflow-hidden pt-[calc(env(safe-area-inset-top)+6rem)] pb-10' : ''}>
        <div className="mx-auto mb-10 w-full max-w-7xl px-6 lg:mb-16 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">{c.title}</h2>
          <p className="mt-4 max-w-md text-lg leading-7 text-white/65">{c.body}</p>
        </div>

        {/* A violet glow sits behind whichever partner is in the middle of the strip. */}
        <div aria-hidden className="partner-glow" />
        <div className={`relative ${pinned ? '' : 'partner-viewport overflow-x-auto snap-x snap-mandatory'}`}>
          <div ref={trackRef} className="partner-track flex w-max items-center gap-8 will-change-transform sm:gap-12 lg:gap-16">
            {c.items.map((p, i) => (
              <button
                key={p.name}
                type="button"
                data-partner
                onClick={() => setOpen(p)}
                aria-haspopup="dialog"
                aria-label={`About ${p.name}`}
                className={`partner-item group flex shrink-0 snap-center flex-col items-center gap-3 text-center sm:flex-row sm:gap-7 sm:text-left ${i === active ? 'is-active' : ''}`}
              >
                <span className="partner-tile">
                  <Image src={p.logo} alt="" width={190} height={96} className={`partner-logo h-12 w-auto max-w-[78%] object-contain sm:h-14 ${p.name === 'CWM' ? 'partner-logo-light' : ''}`} />
                </span>
                <span className="flex flex-col items-center sm:items-start">
                  <span className="partner-name text-2xl font-medium tracking-[-0.03em] sm:text-3xl lg:text-4xl">{p.name}</span>
                  <span className="mt-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#e782f5]">
                    {p.kind}
                    <span aria-hidden className="partner-more">View <span className="inline-block transition-transform group-hover:translate-x-0.5">→</span></span>
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* The blob's "partners" anchor sits at the very end of this tall section, so the blob stays
          away while the strip plays and only beams back in as the contact section arrives. */}
      <div aria-hidden data-blob-anchor="partners" className="pointer-events-none absolute inset-x-0 bottom-0 h-px" />
      {open && <PartnerDialog partner={open} onClose={() => setOpen(null)} />}
    </section>
  )
}

function PartnerDialog({ partner, onClose }: { partner: Partner; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      prev?.focus?.()
    }
  }, [onClose])

  return (
    <div className="partner-overlay fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-dialog-title"
        data-lg-refract
        onClick={(e) => e.stopPropagation()}
        className="partner-dialog lg relative w-full max-w-md rounded-[2rem] p-6 sm:p-8"
      >
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="lg-chip absolute right-4 top-4 grid size-10 place-items-center rounded-full text-[#11142f]">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <div className="grid h-24 w-36 place-items-center">
          <Image src={partner.logo} alt={`${partner.name} logo`} width={190} height={96} className="h-14 w-auto max-w-[80%] object-contain" />
        </div>
        <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#a329c8]">{partner.kind}</p>
        <h3 id="partner-dialog-title" className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#11142f]">{partner.name}</h3>
        {partner.about ? (
          <p className="mt-4 text-[15px] leading-7 text-[#3a3c57]">{partner.about}</p>
        ) : (
          <p className="mt-4 text-[15px] leading-7 text-[#3a3c57]">A valued member of the FSudoLab circle. More about this collaboration soon.</p>
        )}
        {partner.together && (
          <div className="mt-5 rounded-2xl bg-white/60 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a3fb8]">What we built together</p>
            <p className="mt-1.5 text-sm leading-6 text-[#3a3c57]">{partner.together}</p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {partner.link && (
            <a href={partner.link} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#11142f] px-5 py-2.5 text-sm font-semibold text-white">Visit site ↗</a>
          )}
          <a href="#contact" onClick={onClose} className="lg-chip rounded-full px-5 py-2.5 text-sm font-semibold text-[#11142f]">Work with us</a>
        </div>
      </div>
    </div>
  )
}
