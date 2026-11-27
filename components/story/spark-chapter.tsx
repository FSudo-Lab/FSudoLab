'use client'

// Chapter 01 is pinned: the screen holds still while the headline writes itself
// word by word as you scroll, and the blob grows from a small unformed lump
// (marker spark-0) into its full shape (marker spark-1).

import { useRef } from 'react'
import { story } from '@/lib/story-content'
import { useScrollProgress } from './use-scroll-progress'

export function SparkChapter() {
  const c = story.spark
  const ref = useRef<HTMLElement>(null)
  useScrollProgress(ref)

  const words = [...c.title.split(' ').map((w) => ({ w, accent: false })), { w: c.accent, accent: true }]

  return (
    <section
      ref={ref}
      id="story"
      data-bg={c.bg}
      data-theme="dark"
      className="scrub relative z-[2] text-white"
      style={{ height: '220svh', ['--n' as string]: words.length }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div data-blob-anchor="spark-0" className="h-[110svh]" />
        <div data-blob-anchor="spark-1" className="h-[110svh]" />
      </div>

      <div className="sticky top-0 flex h-svh items-end px-6 pb-20 pt-28 md:items-center md:pb-0 lg:px-10">
        <div className="mx-auto w-full max-w-7xl">
          <div className="max-w-2xl [text-shadow:0_2px_24px_rgba(10,12,40,0.6)]">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{c.chapter}</p>
            <h2 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-7xl" aria-label={`${c.title} ${c.accent}`}>
              {words.map(({ w, accent }, i) => (
                <span key={i} aria-hidden="true" className={`scrub-word ${accent ? 'text-[#d65be0]' : ''}`} style={{ ['--i' as string]: i }}>
                  {w}{' '}
                </span>
              ))}
            </h2>
            <p className="scrub-late mt-8 max-w-lg text-lg leading-8 text-white/70">{c.body}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
