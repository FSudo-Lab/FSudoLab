'use client'

import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'

// The team film, given its own scene (like the full-screen chapter films on thefinestpour.com):
// the section holds still while the video grows from a rounded window in the middle into a
// full-bleed frame, then a short caption settles in bottom-left. It plays muted by itself while
// on screen (sound and play/pause buttons in the corner) and pauses when you scroll away.
// Reduced motion: no growing, just the full-width video.

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const ease = (t: number) => t * t * (3 - 2 * t)

export function VideoSection() {
  const v = story.film
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [pinned, setPinned] = useState(true)
  const [muted, setMuted] = useState(true)
  const [playing, setPlaying] = useState(false)
  const userPaused = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const set = () => setPinned(!mq.matches)
    set()
    mq.addEventListener('change', set)
    return () => mq.removeEventListener('change', set)
  }, [])

  // Scroll-driven growth (eased toward the scroll position so it glides).
  useEffect(() => {
    const sec = sectionRef.current
    if (!sec || !pinned) return
    let frame = 0
    let shown = -1
    const update = () => {
      frame = 0
      const r = sec.getBoundingClientRect()
      const span = Math.max(1, r.height - window.innerHeight)
      const target = clamp01(-r.top / span)
      shown = shown < 0 ? target : shown + (target - shown) * 0.18
      if (Math.abs(target - shown) < 0.0005) shown = target
      sec.style.setProperty('--grow', ease(clamp01(shown / 0.55)).toFixed(4))
      sec.style.setProperty('--cap', ease(clamp01((shown - 0.5) / 0.25)).toFixed(4))
      if (shown !== target) frame = requestAnimationFrame(update)
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
  }, [pinned])

  // Play while on screen, pause when away (unless the visitor paused it themselves).
  useEffect(() => {
    const sec = sectionRef.current
    const vid = videoRef.current
    if (!sec || !vid) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting && e.intersectionRatio > 0.25) {
          if (!userPaused.current) vid.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
        } else {
          vid.pause()
          setPlaying(false)
        }
      },
      { threshold: [0, 0.25, 0.5] },
    )
    io.observe(sec)
    return () => io.disconnect()
  }, [])

  const togglePlay = () => {
    const vid = videoRef.current
    if (!vid) return
    if (vid.paused) {
      userPaused.current = false
      vid.play().then(() => setPlaying(true)).catch(() => {})
    } else {
      userPaused.current = true
      vid.pause()
      setPlaying(false)
    }
  }
  const toggleSound = () => {
    const vid = videoRef.current
    if (!vid) return
    vid.muted = !vid.muted
    setMuted(vid.muted)
    if (!vid.muted && vid.paused) vid.play().then(() => setPlaying(true)).catch(() => {})
  }

  return (
    <section
      ref={sectionRef}
      id="film"
      data-bg={v.bg}
      data-theme="dark"
      className={`film relative z-[2] ${pinned ? 'is-pinned h-[220vh]' : 'px-6 py-20'}`}
    >
      <div className={pinned ? 'sticky top-0 flex h-svh items-center justify-center overflow-hidden' : 'mx-auto max-w-7xl'}>
        <div className="film-frame relative overflow-hidden bg-black">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="metadata"
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            className="size-full object-cover"
            aria-label={v.label}
          >
            <source src={v.src} type="video/mp4" />
          </video>
          {/* soft shade so the caption reads over any frame */}
          <div aria-hidden className="film-shade pointer-events-none absolute inset-0" />

          <div className="film-caption absolute bottom-0 left-0 max-w-xl p-6 text-white sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#e782f5]">{v.chapter}</p>
            <p className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">{v.title}</p>
            <p className="mt-3 max-w-md text-base leading-7 text-white/75 sm:text-lg">{v.body}</p>
          </div>

          <div className="film-controls absolute bottom-6 right-6 flex gap-2 sm:bottom-10 sm:right-10">
            <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause video' : 'Play video'} className="lg-chip grid size-11 place-items-center rounded-full text-white">
              {playing ? (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              ) : (
                <svg viewBox="0 0 24 24" className="size-4" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
              )}
            </button>
            <button type="button" onClick={toggleSound} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} className="lg-chip flex h-11 items-center gap-2 rounded-full px-4 text-xs font-semibold uppercase tracking-[0.14em] text-white">
              <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor" stroke="none" />
                {muted ? <path d="M17 9l4 6M21 9l-4 6" /> : <path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12" />}
              </svg>
              {muted ? 'Sound on' : 'Sound off'}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
