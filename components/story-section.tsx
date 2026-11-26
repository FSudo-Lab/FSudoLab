'use client'

import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'

// "Our story": the section holds still while a short paragraph lights up word by word as you
// scroll, with soft blob shapes and glass words drifting past at different depths (some sharp,
// some out of focus). Copy lives in lib/story-content.ts (story.ourStory).

export function StorySection() {
  const c = story.ourStory
  const sectionRef = useRef<HTMLElement>(null)
  const [still, setStill] = useState(false)
  const words = c.text.split(/\s+/)

  useEffect(() => {
    setStill(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section || still) return
    let frame = 0
    const update = () => {
      frame = 0
      const vh = window.innerHeight
      const r = section.getBoundingClientRect()
      const span = Math.max(1, r.height - vh)
      // Starts lighting up as the section arrives, finishes a little before it leaves.
      const p = Math.min(1, Math.max(0, (-r.top + vh * 0.35) / (span + vh * 0.1)))
      section.style.setProperty('--story-p', p.toFixed(4))
      section.style.setProperty('--story-lit', String(p * words.length))
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
  }, [still, words.length])

  return (
    <section ref={sectionRef} id="our-story" data-bg={c.bg} data-theme="light" className={`our-story relative z-[2] ${still ? 'py-28' : 'h-[260vh]'}`}>
      <div className={`${still ? '' : 'sticky top-0 h-svh'} flex items-center justify-center overflow-hidden px-6`}>
        {/* Drifting shapes: --d is depth (how fast it drifts), --b how out of focus it is. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="story-float story-orb" style={{ ['--d' as string]: 1.4, ['--b' as string]: '0px', left: '8%', top: '62%', width: 'clamp(70px,9vw,130px)' }} />
          <span className="story-float story-orb" style={{ ['--d' as string]: 0.6, ['--b' as string]: '14px', left: '74%', top: '12%', width: 'clamp(120px,16vw,240px)' }} />
          <span className="story-float story-orb" style={{ ['--d' as string]: 2.1, ['--b' as string]: '6px', left: '84%', top: '70%', width: 'clamp(50px,6vw,90px)' }} />
          <span className="story-float story-orb" style={{ ['--d' as string]: 0.9, ['--b' as string]: '18px', left: '-4%', top: '6%', width: 'clamp(140px,18vw,260px)' }} />
          {c.chips.map((chip, i) => (
            <span
              key={chip}
              className="story-float story-chip lg"
              style={{ ['--d' as string]: [1.7, 1.1, 2.4][i % 3], ['--b' as string]: ['0px', '3px', '0px'][i % 3], left: ['12%', '70%', '58%'][i % 3], top: ['22%', '58%', '84%'][i % 3] }}
            >
              {chip}
            </span>
          ))}
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#a329c8]">{c.chapter}</p>
          <p className="mt-6 text-[clamp(1.5rem,3.4vw,2.9rem)] font-medium leading-[1.22] tracking-[-0.03em] text-[#11142f]">
            {words.map((w, i) => (
              <span key={i} className="story-word" style={{ ['--i' as string]: i }}>
                {w}{' '}
              </span>
            ))}
          </p>
        </div>
      </div>
    </section>
  )
}
