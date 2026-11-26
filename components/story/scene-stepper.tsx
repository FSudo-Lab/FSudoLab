'use client'

// Scene-by-scene scrolling for the story part of the site (after the intro), in the same spirit
// as the intro: one scroll / swipe / arrow key glides the page to the next scene, and that scene's
// animations (blob moves and shape changes, headline writing itself, Discover → Design → Deliver)
// play out during the glide, because they are all tied to the scroll position.
//
// Glides:      hero → Chapter 01 (written) → Discover → Design → Deliver → Selected work.
// Free scroll: from Selected work down (Insights, Partners, Contact, footer) the page scrolls
//              normally. Scrolling back up from the top of Selected work glides into the story again.
// A fast trackpad fling moves one scene only; scrolling up goes back one.
// Navbar links, the scrollbar and find-in-page still work normally. Off for reduced motion and
// while the intro is playing.

import { useEffect } from 'react'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const inOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
// Gentler, more even pace for the Selected work beats, so every stage of the morph is seen.
const inOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2

export function SceneStepper() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const html = document.documentElement

    const topOf = (el: Element) => {
      const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
      return el.getBoundingClientRect().top + window.scrollY - margin
    }

    /** While Selected work's Deliver → project handoff is pinned (desktop), its only resting point
     *  is the finished project (p 1): one scroll from Deliver plays the whole transition and lands there. */
    const workStops = (): number[] | null => {
      const el = document.getElementById('projects')
      if (!el || el.dataset.handoff !== 'on') return null
      const top = el.getBoundingClientRect().top + window.scrollY
      const span = Math.max(0, el.offsetHeight - window.innerHeight)
      return [Math.round(top + span)]
    }

    /** Where free scrolling begins: the finished project (or the top of "Selected work"). */
    const freeFrom = () => {
      const w = workStops()
      if (w) return w[w.length - 1]
      const el = document.getElementById('projects')
      return el ? Math.round(topOf(el)) : Infinity
    }

    const stops = (): number[] => {
      const vh = window.innerHeight
      const out: number[] = []
      const hero = document.getElementById('top')
      if (hero && hero.offsetParent !== null) out.push(Math.max(0, Math.round(topOf(hero))))
      // Chapter 01 is pinned: one stop, once the headline has written itself.
      const spark = document.getElementById('story')
      if (spark) out.push(Math.round(topOf(spark) + (spark.offsetHeight - vh) * 0.78))
      // Chapter 02 is pinned with three steps (one screen of scroll each).
      const method = document.getElementById('about-us')
      if (method) {
        const step = method.offsetHeight / 3
        for (let i = 0; i < 3; i++) out.push(Math.round(topOf(method) + i * step))
      }
      // Selected work glides beat by beat (box → code window → project); free scrolling starts after.
      const w = workStops()
      if (w) out.push(...w)
      else out.push(freeFrom())
      return out.filter((v) => Number.isFinite(v)).sort((a, b) => a - b)
    }

    let tween: { from: number; to: number; start: number; dur: number; ease: (t: number) => number; then?: () => void } | null = null
    let raf = 0
    let cooldownUntil = 0

    const glide = (to: number, slow = 0, then?: () => void) => {
      const from = window.scrollY
      const dist = Math.abs(to - from)
      if (dist < 2) { then?.(); return }
      const dur = slow || clamp(650 + dist * 0.4, 900, 1700)
      tween = { from, to, start: performance.now(), dur, ease: slow ? inOutSine : inOut, then }
      html.style.scrollBehavior = 'auto'
      const step = (now: number) => {
        if (!tween) return
        const u = clamp((now - tween.start) / tween.dur)
        window.scrollTo(0, tween.from + (tween.to - tween.from) * tween.ease(u))
        if (u < 1) raf = requestAnimationFrame(step)
        else {
          const next = tween.then
          tween = null
          if (next) { next(); return } // a linked glide continues straight on
          html.style.scrollBehavior = ''
          cooldownUntil = now + 380 // swallow the tail of a trackpad fling
        }
      }
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(step)
    }

    /** Is this gesture ours (glide) or the page's (free scroll)? */
    const inStory = (dir: 1 | -1) => {
      const y = window.scrollY
      const f = freeFrom()
      return dir > 0 ? y < f - 4 : y <= f + 4
    }
    const move = (dir: 1 | -1) => {
      if (tween || performance.now() < cooldownUntil) return
      const y = window.scrollY
      const s = stops()
      const target = dir > 0 ? s.find((v) => v > y + 4) : [...s].reverse().find((v) => v < y - 4)
      if (target === undefined) return
      // Deliver ⇄ finished project in one scroll: a normal glide to the start of Selected work that
      // flows straight into one even 3 s glide through the whole handoff (box turns, widens into the
      // code window, code types, close-up pulls back to the project) — and the same in reverse.
      const w = workStops()
      const pr = document.getElementById('projects')
      if (w && pr) {
        const start = Math.round(pr.getBoundingClientRect().top + window.scrollY)
        if (target === w[0] && y < start - 4) return glide(start, 0, () => glide(w[0], 3000))
        if (target === w[0]) return glide(w[0], 3000)
        if (Math.abs(y - w[0]) < 4 && target < start) return glide(start, 3000, () => glide(target))
      }
      glide(target)
    }

    const active = () => html.dataset.intro !== 'on'
    // Let things that scroll on their own (the mobile menu, video controls…) keep their scrolling.
    const inScrollable = (t: EventTarget | null) => {
      let el = t as HTMLElement | null
      while (el && el !== document.body) {
        if (el.matches?.('video, input, textarea, select, [data-own-scroll]')) return true
        const st = getComputedStyle(el)
        if (/(auto|scroll)/.test(st.overflowY) && el.scrollHeight > el.clientHeight + 2) return true
        el = el.parentElement
      }
      return false
    }

    let acc = 0
    let accReset = 0
    const onWheel = (e: WheelEvent) => {
      if (!active() || e.ctrlKey || inScrollable(e.target)) return
      // Swallow the tail of the gesture that just finished a glide, so it doesn't shoot onward.
      if (!tween && performance.now() < cooldownUntil) {
        e.preventDefault()
        return
      }
      // In the free part, let the page scroll normally.
      if (!tween && !inStory(e.deltaY > 0 ? 1 : -1)) return
      e.preventDefault()
      acc += e.deltaY
      window.clearTimeout(accReset)
      accReset = window.setTimeout(() => (acc = 0), 180)
      if (Math.abs(acc) > 30) {
        move(acc > 0 ? 1 : -1)
        acc = 0
      }
    }
    let touchY: number | null = null
    let touchOwn = false
    const onTouchStart = (e: TouchEvent) => {
      touchOwn = inScrollable(e.target)
      touchFree = false
      touchY = e.touches[0]?.clientY ?? null
    }
    let touchFree = false
    const onTouchMove = (e: TouchEvent) => {
      if (!active() || touchOwn || touchY === null) return
      const dy = touchY - (e.touches[0]?.clientY ?? touchY)
      // Decide once per swipe, from its direction, whether it glides or scrolls freely.
      if (Math.abs(dy) > 6 && !touchFree && !tween && !inStory(dy > 0 ? 1 : -1)) touchFree = true
      if (!touchFree) e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!active() || touchOwn || touchFree || touchY === null) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (dy > 35) move(1)
      else if (dy < -35) move(-1)
    }
    const onKey = (e: KeyboardEvent) => {
      if (!active() || inScrollable(e.target) || (e.target as HTMLElement)?.isContentEditable) return
      const down = e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)
      const up = e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)
      if (down || up) {
        // Space on a focused button/link should still press it.
        if (e.key === ' ' && (e.target as HTMLElement)?.closest?.('a, button')) return
        if (!tween && !inStory(down ? 1 : -1)) return
        e.preventDefault()
        move(down ? 1 : -1)
      }
    }

    // Right after the intro opens onto the hero, ignore the rest of that gesture.
    const mo = new MutationObserver(() => {
      if (html.dataset.intro === 'off') cooldownUntil = performance.now() + 700
    })
    mo.observe(html, { attributes: true, attributeFilter: ['data-intro'] })

    // A jump link (JumpTransition) moves the page itself: drop any glide in progress.
    const onJump = () => {
      cancelAnimationFrame(raf)
      tween = null
      html.style.scrollBehavior = ''
      cooldownUntil = performance.now() + 500
    }
    window.addEventListener('fs:jump', onJump)
    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('keydown', onKey)
    return () => {
      mo.disconnect()
      window.removeEventListener('fs:jump', onJump)
      cancelAnimationFrame(raf)
      html.style.scrollBehavior = ''
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return null
}
