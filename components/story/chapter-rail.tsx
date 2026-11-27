'use client'

// Scrollytelling guide: on large screens a slim rail on the right lists the six
// chapters and lights up the one you are reading; on phones and tablets a thin
// reading-progress line runs under the navbar. Both follow the navbar's light/dark theme.

import { useEffect, useState } from 'react'
import { readingLine } from '@/components/blob/anchors'

const chapters = [
  { id: 'story', label: 'The spark' },
  { id: 'about-us', label: 'The method' },
  { id: 'projects', label: 'Ideas in motion' },
  { id: 'insights', label: 'The people' },
  { id: 'partners', label: 'The circle' },
  { id: 'contact', label: 'Your turn' },
]

export function ChapterRail() {
  const [active, setActive] = useState(-1)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const line = readingLine(0.5)
      let current = -1
      chapters.forEach((c, i) => {
        const el = document.getElementById(c.id)
        if (el && el.getBoundingClientRect().top <= line) current = i
      })
      setActive(current)
      // The rail takes the colour of the chapter behind it (not the navbar's).
      const mid = window.innerHeight / 2
      const behind = Array.from(document.querySelectorAll<HTMLElement>('[data-bg]')).find((el) => {
        const r = el.getBoundingClientRect()
        return r.top <= mid && r.bottom > mid
      })
      setDark(behind?.dataset.theme === 'dark')
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  return (
    <>
      <div className="chapter-progress pointer-events-none fixed inset-x-0 z-40 h-0.5 lg:hidden" aria-hidden="true">
        <span className="block h-full origin-left bg-[#b23ad6]" style={{ transform: 'scaleX(var(--read, 0))' }} />
      </div>
      <nav aria-label="Chapters" data-tone={dark ? 'dark' : 'light'} className={`chapter-rail fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 transition-opacity duration-500 lg:block ${active < 0 ? 'pointer-events-none opacity-0' : 'opacity-100'}`}>
        <ol className="flex flex-col items-end gap-3.5">
          {chapters.map((c, i) => (
            <li key={c.id}>
              <a href={`#${c.id}`} aria-current={i === active ? 'step' : undefined} className="group flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.16em]">
                <span className={`rail-label transition-all duration-300 ${i === active ? 'opacity-0 min-[1600px]:opacity-100' : 'translate-x-1 opacity-0'} group-hover:translate-x-0 group-hover:opacity-100`}>{c.label}</span>
                <span className={`rail-dot block rounded-full transition-all duration-300 ${i === active ? 'h-6 w-1.5' : 'size-1.5'}`} />
              </a>
            </li>
          ))}
        </ol>
      </nav>
    </>
  )
}
