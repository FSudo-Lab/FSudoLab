'use client'

import { ArrowUpRight } from 'lucide-react'
import { useEffect, useState } from 'react'

const frameCount = 120
const frameDuration = 1000 / 30

const frameUrl = (frame: number) => {
  const timestamp = ((frame - 1) / 30).toFixed(2)
    return `/FSudoLabBackground/frame_${String(frame).padStart(4, '0')}_${timestamp}s.webp`
}

export function HeroSection() {
  const [frame, setFrame] = useState(1)
  const [allFramesLoaded, setAllFramesLoaded] = useState(false)

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
      setFrame(currentFrame)

      animation = window.setTimeout(advanceFrame, frameDuration)
    }

    animation = window.setTimeout(advanceFrame, frameDuration)

    return () => {
      window.clearTimeout(animation)
    }
  }, [allFramesLoaded])

  return (
    <section id="top" className="relative isolate min-h-screen overflow-hidden border-y border-[#e5e1ec] bg-[#fbfafc] px-6 pb-20 pt-32 lg:px-10 lg:py-28">
      <img src={frameUrl(frame)} alt="Abstract navy, violet, and magenta organic gradient" className="absolute inset-0 h-full w-full object-cover object-left md:object-center" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.05fr]">
        <div className="relative hidden min-h-[430px] lg:block" aria-hidden="true" />
        <div className="relative z-10 max-w-xl p-1 text-white [text-shadow:0_2px_18px_rgba(20,16,64,0.72)] lg:justify-self-end lg:p-0 lg:text-[#11142f] lg:[text-shadow:none]">
          <div className="mb-7 inline-flex rounded-full border border-white/55 bg-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-lg lg:border-[#e2d9ec] lg:bg-white/75 lg:text-[#6b2a91]">Digital innovation studio</div>
          <h1 className="hero-wordmark text-5xl leading-[0.94] text-white sm:text-6xl lg:text-7xl lg:text-[#343653]">FSudo<span className="text-[#8b25cf]">Lab</span></h1>
          <p className="mt-7 text-sm font-bold uppercase tracking-[0.22em] text-[#f0b7ff] lg:text-[#8b25cf]">Innovation conquers limits.</p>
          <p className="mt-4 max-w-md text-lg leading-8 text-white/90 lg:text-[#34364f]">FSudoLab partners with ambitious teams to turn complex challenges into clear, useful, and beautifully engineered digital experiences.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#contact" className="rounded-full bg-[#27275c] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#27275c]/20 transition hover:bg-[#3b3383]">Start a project <ArrowUpRight className="ml-2 inline h-4 w-4" /></a>
          </div>
          <div className="mt-12 flex items-center gap-8 border-t border-white/35 pt-6 text-sm text-white/75 lg:border-[#d8d1e3] lg:text-[#55566e]">
            <div><strong className="block text-2xl font-semibold text-white lg:text-[#242653]">12+</strong> ideas launched</div>
            <div><strong className="block text-2xl font-semibold text-white lg:text-[#242653]">4.9</strong> partner rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}
