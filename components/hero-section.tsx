'use client'

import { ArrowUpRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { story } from '@/lib/story-content'

const frameCount = 120
const frameDuration = 1000 / 30

const frameUrl = (frame: number) => {
  const timestamp = ((frame - 1) / 30).toFixed(2)
    return `/FSudoLabBackground/frame_${String(frame).padStart(4, '0')}_${timestamp}s.webp`
}

export function HeroSection() {
  const [frame, setFrame] = useState(1)
  const [allFramesLoaded, setAllFramesLoaded] = useState(false)
  // The original frame animation plays in the hero. When the moving signature blob is
  // running, it sits exactly behind the animated blob; as you scroll, the frames fade
  // out and the moving blob is revealed in the same spot, then travels down the page.
  // Without WebGL / with data saver the frames simply stay.
  const [live, setLive] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const sync = () => setLive(document.documentElement.dataset.blobLive === '1')
    sync()
    window.addEventListener('blob-live', sync)
    return () => window.removeEventListener('blob-live', sync)
  }, [])

  // Scroll-driven hand-over: frames fully visible at the top, gone after ~28% of a screen.
  useEffect(() => {
    const img = imgRef.current
    if (!img || !live) return
    let raf = 0
    const update = () => {
      raf = 0
      // Measured from the hero's own position (the brand intro sits above it).
      const scrolled = -(img.parentElement?.getBoundingClientRect().top ?? 0)
      // Desktop: the artwork melts into the moving blob over the first quarter screen of scroll.
      // Phones/tablets put white text on the artwork, so there the same melt starts a little later
      // (once the text has scrolled up out of the way).
      const small = window.innerWidth < 1024
      const k = small
        ? Math.min(1, Math.max(0, (scrolled / window.innerHeight - 0.35) / 0.45))
        : Math.min(1, Math.max(0, scrolled / (window.innerHeight * 0.24)))
      const e = k * k * (3 - 2 * k)
      // Blur while fading so the two blobs melt together instead of showing a sharp double image.
      img.style.opacity = String(1 - e)
      img.style.filter = e > 0 ? `blur(${e * 18}px)` : ''
      // Tell the moving blob how visible it may be: hidden while the hero artwork shows (so it
      // never peeks through as a second blob), fading in only as it takes over.
      const handoff = e
      ;(window as Window & { __fsHeroHandoff?: number }).__fsHeroHandoff = handoff
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      img.style.opacity = ''
      img.style.filter = ''
      delete (window as Window & { __fsHeroHandoff?: number }).__fsHeroHandoff
    }
  }, [live])

  useEffect(() => {
    let loadedFrames = 0
    let isActive = true
    const countedFrames = new Set<number>()
    const countLoadedFrame = (index: number) => {
      if (countedFrames.has(index)) return
      countedFrames.add(index)
      loadedFrames += 1
      if (isActive && loadedFrames === frameCount) setAllFramesLoaded(true)
    }
    const frames = Array.from({ length: frameCount }, (_, index) => {
      const image = new window.Image()
      image.onload = () => countLoadedFrame(index)

      return image
    })

    frames.forEach((image, index) => {
      image.src = frameUrl(index + 1)
      if (image.complete && image.naturalWidth > 0) countLoadedFrame(index)
    })

    return () => {
      isActive = false
      frames.forEach((image) => {
        image.onload = null
      })
    }
  }, [])

  useEffect(() => {
    if (!allFramesLoaded) return

    let direction = 1
    let currentFrame = 1
    let animation = 0

    const advanceFrame = () => {
      if (currentFrame === frameCount) direction = -1
      if (currentFrame === 1) direction = 1

      currentFrame += direction
      // No need to animate once the hero has scrolled away.
      const top = document.getElementById('top')?.getBoundingClientRect()
      if (top && top.bottom > 0 && top.top < window.innerHeight) setFrame(currentFrame)

      animation = window.setTimeout(advanceFrame, frameDuration)
    }

    animation = window.setTimeout(advanceFrame, frameDuration)

    return () => {
      window.clearTimeout(animation)
    }
  }, [allFramesLoaded])

  return (
    <section id="top" data-bg="#f5f3ef" data-theme="light" data-blob-anchor="hero" className={`relative isolate z-[2] min-h-svh overflow-hidden px-6 pb-20 pt-32 transition-colors duration-700 lg:px-10 lg:py-28 ${live ? 'bg-transparent' : 'bg-[#f5f3ef]'}`}>
      <img ref={imgRef} src={frameUrl(frame)} alt="" aria-hidden="true" className="hero-frames absolute inset-0 h-full w-full object-cover object-left md:object-center" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative hidden min-h-[430px] lg:block" aria-hidden="true" />
        <div className={`relative z-10 max-w-xl p-1 lg:justify-self-end lg:p-0 lg:text-[#11142f] lg:[text-shadow:none] text-white [text-shadow:0_2px_18px_rgba(20,16,64,0.72)]`}>
          <div className={`mb-7 inline-flex rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-lg lg:border-[#e2d9ec] lg:bg-white/75 lg:text-[#6b2a91] border-white/55 bg-white/20 text-white`}>Digital innovation studio</div>
          <h1 className={`text-5xl font-semibold leading-[0.98] tracking-[-0.05em] sm:text-6xl lg:text-7xl lg:text-[#24264f] text-white`}>{story.hero.title} <span className="text-[#f3c6ff] lg:text-[#8b25cf]">{story.hero.accent}</span></h1>
          <p className={`mt-6 max-w-md text-lg leading-8 lg:text-[#34364f] text-white/90`}>{story.hero.body}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#work" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#27275c] shadow-lg shadow-[#14102f]/25 transition hover:bg-[#f1dcff] lg:bg-[#27275c] lg:text-white lg:shadow-[#27275c]/20 lg:hover:bg-[#3b3383]">{story.hero.primary} <ArrowUpRight className="ml-2 inline h-4 w-4" /></a>
            <a href="#contact" className="rounded-full border px-6 py-3.5 text-sm font-semibold transition lg:border-[#d8d1e3] lg:bg-white/70 lg:text-[#27275c] lg:hover:bg-white border-white/50 bg-white/15 text-white backdrop-blur">{story.hero.secondary}</a>
          </div>
          <div className={`mt-12 flex items-center gap-8 border-t pt-6 text-sm lg:border-[#d8d1e3] lg:text-[#55566e] border-white/35 text-white/75`}>
            <div><strong className={`block text-2xl font-semibold lg:text-[#242653] text-white`}>12+</strong> ideas launched</div>
            <div><strong className={`block text-2xl font-semibold lg:text-[#242653] text-white`}>4.9</strong> partner rating</div>
          </div>
        </div>
      </div>
      <a href="#story" className={`scroll-cue absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] lg:text-[#55566e] text-white/85`}>
        {story.hero.scrollCue}
        <span className="scroll-cue-line" aria-hidden="true" />
      </a>
    </section>
  )
}
