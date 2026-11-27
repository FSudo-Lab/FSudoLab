'use client'

// Step-by-step brand intro, shown as a full-screen layer over the site on page load.
// Each scroll (or swipe up, or ↓ / Space / Enter) plays the next beat as a smooth animation;
// scrolling up goes back one beat. The page itself doesn't move while the intro is on.
//   1  the F logo shines (waits here)            2  it becomes the name "FSudoLab"
//   3  the name folds back into the F            4  the circuit dots fly in, the F melts into a glowing blob
//   5  the blob swells until it swallows the screen, then opens: a hole with a glowing rim tears
//      open from the centre and the hero comes into focus through it, as if you pass through
//      the blob into the site. Then normal scrolling begins.
// Everything is drawn from one progress value p (0 → 1) that is tweened between the beats.
// The navbar is hidden while the intro plays; "Skip intro" plays the ending straight away.
// Plays once per page load (a refresh brings it back); links to a section (e.g. #partners) and
// reduced-motion users skip it.

import { useEffect, useRef } from 'react'

const LETTERS = ['F', 'S', 'u', 'd', 'o', 'L', 'a', 'b']
/** Where each beat comes to rest. The last step (→ 1) swallows the screen and opens up. */
const STOPS = [0, 0.29, 0.44, 0.645]
/** How long each beat's animation takes (ms), indexed by the stop it travels to. */
const BEAT_MS = [900, 1500, 1200, 1700]
const SWALLOW_MS = 1100

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const inOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t)
const out = (t: number) => 1 - Math.pow(1 - t, 3)
const back = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// ── The living blob's outline ───────────────────────────────────────────────────────────
// It drifts between "forms" every few seconds while it waits for the next scroll, on top of a
// constant flowing wobble. Radii are in units of the blob's resting radius (1).
type Form = { k: number; a: number; spin: number; bud: number }
const FORMS: Form[] = [
  { k: 3, a: 0.11, spin: 0.35, bud: 0 }, // three soft lobes
  { k: 2, a: 0.15, spin: 0.2, bud: 0 }, // stretched egg
  { k: 4, a: 0.09, spin: -0.3, bud: 0 }, // four lobes
  { k: 5, a: 0.065, spin: 0.25, bud: 0 }, // five-petal ripple
  { k: 2, a: 0.05, spin: 0.1, bud: 0.34 }, // a droplet buds out of one side and pulls back
]
const FORM_HOLD = 3.4 // seconds per form
const FORM_BLEND = 1.4 // seconds to ease into the next one
const smooth = (x: number) => x * x * (3 - 2 * x)

function blobPath(t: number, calm: number) {
  // Which two forms we are between right now, and how far.
  const cycle = t / FORM_HOLD
  const i = Math.floor(cycle) % FORMS.length
  const f0 = FORMS[i]
  const f1 = FORMS[(i + 1) % FORMS.length]
  const into = smooth(clamp((cycle % 1) * FORM_HOLD - (FORM_HOLD - FORM_BLEND), 0, FORM_BLEND) / FORM_BLEND)
  const live = 1 - calm * 0.8 // when it swallows the screen it calms down
  const budAngle = t * 0.45
  // The bud swells and retracts once while its form is showing.
  const budPulse = Math.sin(clamp(((cycle % 1) * FORM_HOLD) / FORM_HOLD) * Math.PI)
  const N = 64
  const pts: [number, number][] = []
  for (let n = 0; n < N; n++) {
    const th = (n / N) * Math.PI * 2
    // Constant flowing wobble (incommensurate speeds, so it never visibly repeats).
    let r =
      1 +
      0.045 * Math.sin(3 * th + t * 1.3) +
      0.035 * Math.sin(5 * th - t * 0.9 + 1) +
      0.03 * Math.sin(2 * th + t * 0.6 + 2)
    // The current form, eased into the next.
    const form = (f: Form, w: number, pulse: number) => {
      let d = f.a * Math.sin(f.k * th + t * f.spin)
      if (f.bud) {
        const da = Math.atan2(Math.sin(th - budAngle), Math.cos(th - budAngle))
        d += f.bud * pulse * Math.exp(-(da * da) / 0.09)
      }
      return d * w
    }
    r += form(f0, 1 - into, f0.bud ? budPulse : 0) + form(f1, into, 0)
    r = 1 + (r - 1) * live
    pts.push([Math.cos(th) * r, Math.sin(th) * r])
  }
  // Smooth closed curve through the midpoints.
  const mid = (a: [number, number], b: [number, number]) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
  const m0 = mid(pts[N - 1], pts[0])
  let d = `M${m0[0].toFixed(4)} ${m0[1].toFixed(4)}`
  for (let n = 0; n < N; n++) {
    const m = mid(pts[n], pts[(n + 1) % N])
    d += `Q${pts[n][0].toFixed(4)} ${pts[n][1].toFixed(4)} ${m[0].toFixed(4)} ${m[1].toFixed(4)}`
  }
  return d + 'Z'
}

export function IntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const markRef = useRef<HTMLDivElement>(null)
  const wordRef = useRef<HTMLParagraphElement>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const shineRef = useRef<HTMLSpanElement>(null)
  const orbRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<SVGSVGElement>(null)
  const corePathRef = useRef<SVGPathElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const n1Ref = useRef<HTMLElement>(null)
  const n2Ref = useRef<HTMLElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const skipRef = useRef<() => void>(() => {})

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const html = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    // A link to a section goes straight there, without the intro.
    if (window.location.hash) {
      section.style.display = 'none'
      return
    }
    history.scrollRestoration = 'manual'
    window.scrollTo({ top: 0, behavior: 'instant' })
    html.dataset.intro = 'on'
    if (hintRef.current && window.matchMedia('(pointer: coarse)').matches) hintRef.current.textContent = 'Flow through FSudoLab with a slow swipe'

    // How far each letter sits from the word's centre (for folding back into the F).
    let dx: number[] = []
    const measure = () => {
      const w = wordRef.current?.getBoundingClientRect()
      if (!w) return
      const c = w.left + w.width / 2
      dx = letterRefs.current.map((l) => {
        if (!l) return 0
        const saved = l.style.transform
        l.style.transform = 'none'
        const b = l.getBoundingClientRect()
        l.style.transform = saved
        return c - (b.left + b.width / 2)
      })
    }
    measure()
    document.fonts?.ready.then(measure)

    // Scale at which the core (a slightly wobbly circle) covers the whole screen.
    const coverScale = () => (Math.hypot(window.innerWidth, window.innerHeight) * 1.3) / (Math.min(window.innerWidth, window.innerHeight) * 0.42)

    // ── Draw one moment of the intro ────────────────────────────────────────────────────
    const render = (p: number, t: number) => {
      const vh = window.innerHeight
      // A/B/C/D — the logo
      const toName = seg(p, 0.1, 0.18)
      const logoBack = seg(p, 0.34, 0.42)
      const melt = seg(p, 0.46, 0.56)
      let ls: number
      let lo: number
      let blur = 0
      let bright = 1
      if (p < 0.34) {
        ls = lerp(1, 0.55, ease(toName)) + Math.sin(seg(p, 0.07, 0.13) * Math.PI) * 0.08
        lo = 1 - seg(p, 0.13, 0.19)
        bright = 1 + Math.sin(seg(p, 0.07, 0.16) * Math.PI) * 0.9
      } else {
        ls = lerp(0.55, 1, out(logoBack))
        lo = logoBack
        if (p > 0.46) {
          ls = lerp(1, 0.18, ease(melt))
          blur = melt * 10
          bright = 1 + melt * 2.5
          lo = 1 - seg(p, 0.52, 0.57)
        }
      }
      const mark = markRef.current
      if (mark) {
        mark.style.transform = `translate(-50%,-50%) scale(${ls})`
        mark.style.opacity = String(lo)
        mark.style.filter = blur || bright !== 1 ? `blur(${blur}px) brightness(${bright})` : ''
      }

      // The name, letter by letter, then folding back into the F
      const n = LETTERS.length
      letterRefs.current.forEach((l, i) => {
        if (!l) return
        const a = seg(p, 0.14 + i * 0.01, 0.22 + i * 0.01)
        const inT = back(a)
        const c = ease(seg(p, 0.33 + (n - 1 - Math.abs(i - (n - 1) / 2)) * 0.004, 0.41))
        l.style.opacity = String(Math.min(a, 1 - c))
        l.style.transform = `translate(${(dx[i] ?? 0) * c}px,${(1 - inT) * 60}px) scale(${1 - c * 0.6}) rotate(${(1 - inT) * 8}deg)`
      })
      if (shineRef.current) shineRef.current.style.opacity = String(seg(p, 0.23, 0.26) * (1 - seg(p, 0.31, 0.34)))

      // Light flares between the beats
      const fl = Math.max(
        Math.sin(seg(p, 0.11, 0.18) * Math.PI) * 0.55,
        Math.sin(seg(p, 0.35, 0.42) * Math.PI) * 0.5,
        Math.sin(seg(p, 0.47, 0.62) * Math.PI),
      )
      if (orbRef.current) {
        orbRef.current.style.opacity = String(fl)
        orbRef.current.style.transform = `translate(-50%,-50%) scale(${0.4 + fl * 0.8})`
      }

      // The logo's two circuit dots fly into the core
      const nodeT = seg(p, 0.45, 0.54)
      const w = mark?.offsetWidth ?? 200
      ;([
        [n1Ref.current, -0.47, 0.04],
        [n2Ref.current, 0.47, -0.06],
      ] as const).forEach(([node, fx, fy]) => {
        if (!node) return
        const e = ease(nodeT)
        node.style.opacity = String(nodeT > 0 && nodeT < 1 ? Math.sin(nodeT * Math.PI) + 0.2 : 0)
        node.style.transform = `translate(${fx * w * (1 - e)}px,${fy * w * (1 - e)}px) scale(${1 - e * 0.5}) rotate(${e * 180}deg)`
      })

      // E — the glowing core becomes a soft living blob, then swells until it swallows the screen
      const grow = seg(p, 0.5, 0.64)
      const eat = seg(p, 0.66, 1)
      const core = coreRef.current
      if (core) {
        const base = Math.min(window.innerWidth, vh) * 0.42
        const k = (grow > 0 ? back(grow) : 0) * lerp(1, coverScale(), eat * eat * eat)
        // Breathing, a gentle float and a slow turn while it waits; all settle as it swallows the screen.
        const calm = clamp(eat * 1.5)
        const breathe = 1 + Math.sin(t * 1.6) * 0.035 * (1 - calm)
        const floatY = Math.sin(t * 0.9) * base * 0.035 * (1 - calm)
        const turn = Math.sin(t * 0.3) * 8 * (1 - calm)
        core.style.width = core.style.height = `${base * 1.6}px`
        core.style.transform = `translate(-50%,-50%) translateY(${floatY}px) rotate(${turn}deg) scale(${k * breathe})`
        core.style.opacity = String(grow > 0 ? 1 : 0)
        // Filters over a screen-sized element are expensive, so the glow is dropped once the blob
        // starts to swallow the screen (it would fade to nothing there anyway).
        core.style.filter =
          calm < 0.6
            ? `brightness(${1 + (1 - grow) * 1.2}) drop-shadow(0 0 ${base * 0.12}px rgba(139,44,245,${0.45 * (1 - calm / 0.6)}))`
            : 'none'
        // Once it covers the screen the outline is off-screen: stop redrawing it.
        if (grow > 0 && calm < 0.98) corePathRef.current?.setAttribute('d', blobPath(t, calm))
      }

    }

    // ── Beats: tween p between the stops ─────────────────────────────────────────────────
    let p = 0
    let stop = 0
    let tween: { from: number; to: number; start: number; dur: number; done?: () => void } | null = null
    let finished = false
    let running = true
    let raf = 0
    let cooldownUntil = 0

    const go = (to: number, dur: number, done?: () => void) => {
      tween = { from: p, to, start: performance.now(), dur, done }
    }
    const next = () => {
      if (tween || finished || performance.now() < cooldownUntil) return
      if (stop < STOPS.length - 1) {
        stop += 1
        go(STOPS[stop], BEAT_MS[stop])
      } else {
        finished = true
        go(1, SWALLOW_MS, openUp)
      }
    }
    const prev = () => {
      if (tween || finished || stop === 0 || performance.now() < cooldownUntil) return
      stop -= 1
      go(STOPS[stop], BEAT_MS[stop + 1] * 0.8)
    }
    skipRef.current = () => {
      if (finished) return
      finished = true
      go(1, 900, openUp)
    }

    // ── Input: the page doesn't scroll while the intro is on; gestures step the story ───
    let wheelAcc = 0
    let wheelReset = 0
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      wheelAcc += e.deltaY
      window.clearTimeout(wheelReset)
      wheelReset = window.setTimeout(() => (wheelAcc = 0), 180)
      if (Math.abs(wheelAcc) > 30) {
        if (wheelAcc > 0) next()
        else prev()
        wheelAcc = 0
      }
    }
    let touchY: number | null = null
    const onTouchStart = (e: TouchEvent) => (touchY = e.touches[0]?.clientY ?? null)
    const onTouchMove = (e: TouchEvent) => e.preventDefault()
    const onTouchEnd = (e: TouchEvent) => {
      if (touchY === null) return
      const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY)
      touchY = null
      if (dy > 35) next()
      else if (dy < -35) prev()
    }
    const onKey = (e: KeyboardEvent) => {
      if ([' ', 'PageDown', 'ArrowDown', 'Enter'].includes(e.key)) {
        if (e.key !== 'Enter' || document.activeElement === document.body) e.preventDefault()
        if (e.key !== 'Enter' || document.activeElement === document.body) next()
      } else if (['PageUp', 'ArrowUp'].includes(e.key)) {
        e.preventDefault()
        prev()
      } else if (['Home', 'End'].includes(e.key)) e.preventDefault()
    }
    const listen = (on: boolean) => {
      const opts = { passive: false } as AddEventListenerOptions
      if (on) {
        window.addEventListener('wheel', onWheel, opts)
        window.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchmove', onTouchMove, opts)
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('keydown', onKey)
        html.style.overflow = 'hidden'
        document.body.style.overflow = 'hidden'
      } else {
        window.removeEventListener('wheel', onWheel)
        window.removeEventListener('touchstart', onTouchStart)
        window.removeEventListener('touchmove', onTouchMove)
        window.removeEventListener('touchend', onTouchEnd)
        window.removeEventListener('keydown', onKey)
        html.style.overflow = ''
        document.body.style.overflow = ''
      }
    }
    listen(true)

    // ── Ending: the blob that swallowed the screen opens up onto the hero ───────────────
    function openUp() {
      const vh = window.innerHeight
      const W = window.innerWidth
      window.scrollTo({ top: 0, behavior: 'instant' })
      const pin = pinRef.current
      const core = coreRef.current
      const ring = ringRef.current
      const hero = document.getElementById('top')
      if (core) core.style.filter = 'none'
      if (hero) {
        hero.style.transformOrigin = '50% 50%'
        hero.style.willChange = 'transform, filter'
      }
      const maxR = Math.hypot(W, vh) * 0.62
      const start = performance.now()
      const DUR = 1500
      const step = (now: number) => {
        const el = now - start
        // A short gulp before it opens.
        const pulse = Math.sin(clamp(el / 220) * Math.PI)
        if (core) core.style.transform = `translate(-50%,-50%) scale(${coverScale() * (1 + pulse * 0.05)})`
        const u = ease(clamp((el - 180) / (DUR - 180)))
        const R = u * maxR
        const mask = `radial-gradient(circle at 50% 50%, transparent ${R}px, #000 ${R + 90}px)`
        if (pin) {
          pin.style.webkitMaskImage = mask
          pin.style.maskImage = mask
        }
        if (ring) {
          ring.style.width = ring.style.height = `${(R + 70) * 2}px`
          ring.style.opacity = String(u > 0 ? 1 - Math.pow(u, 3) : 0)
        }
        if (hero) {
          hero.style.transform = `scale(${lerp(1.14, 1, u)})`
          hero.style.filter = u < 1 ? `blur(${lerp(10, 0, u)}px)` : ''
        }
        if (el < DUR) {
          requestAnimationFrame(step)
          return
        }
        // Done: remove the intro and hand scrolling back to the page.
        if (hero) {
          hero.style.transform = ''
          hero.style.filter = ''
          hero.style.willChange = ''
        }
        if (sectionRef.current) sectionRef.current.style.display = 'none'
        html.dataset.intro = 'off'
        running = false
        cancelAnimationFrame(raf)
        listen(false)
      }
      requestAnimationFrame(step)
    }

    // ── Loop: advance the tween and draw ─────────────────────────────────────────────────
    const frame = (ms: number) => {
      if (!running) return
      raf = requestAnimationFrame(frame)
      if (tween) {
        const u = clamp((ms - tween.start) / tween.dur)
        p = lerp(tween.from, tween.to, inOut(u))
        if (u >= 1) {
          const done = tween.done
          tween = null
          cooldownUntil = ms + 350 // ignore the tail of a trackpad fling
          done?.()
        }
      }
      if (p < 1 || !finished) render(p, ms / 1000)
      // The hint shows only while the intro is resting on a beat.
      if (hintRef.current) hintRef.current.style.opacity = tween || finished ? '0' : '1'
    }
    raf = requestAnimationFrame(frame)
    window.addEventListener('resize', measure)
    return () => {
      running = false
      cancelAnimationFrame(raf)
      listen(false)
      window.removeEventListener('resize', measure)
      delete html.dataset.intro
    }
  }, [])

  return (
    <section ref={sectionRef} id="intro" aria-label="FSudoLab intro" className="intro">
      <div ref={pinRef} className="intro-pin">
        <div ref={orbRef} className="intro-orb" aria-hidden="true" />
        <svg ref={coreRef} className="intro-core" viewBox="-1.6 -1.6 3.2 3.2" aria-hidden="true">
          <defs>
            {/* The hero blob's colours: mauve highlight upper right, violet body, plum shadow. */}
            <radialGradient id="intro-core-fill" cx="0.66" cy="0.3" r="0.85">
              <stop offset="0" stopColor="#b588b7" />
              <stop offset="0.2" stopColor="#8d569e" />
              <stop offset="0.5" stopColor="#58357d" />
              <stop offset="0.75" stopColor="#3c2357" />
              <stop offset="1" stopColor="#2b1b47" />
            </radialGradient>
          </defs>
          <path ref={corePathRef} fill="url(#intro-core-fill)" d="M1 0A1 1 0 1 1 -1 0A1 1 0 1 1 1 0Z" />
        </svg>
        <div ref={ringRef} className="intro-ring" aria-hidden="true" />
        <i ref={n1Ref} className="intro-node" aria-hidden="true" />
        <i ref={n2Ref} className="intro-node" aria-hidden="true" />
        <div ref={markRef} className="intro-mark" role="img" aria-label="FSudoLab logo">
          <div className="intro-mark-img" />
          <div className="intro-mark-shine" />
          <div className="intro-mark-glint" />
        </div>
        <p ref={wordRef} className="intro-word hero-wordmark" aria-hidden="true">
          {LETTERS.map((ch, i) => (
            <span key={i} ref={(el) => void (letterRefs.current[i] = el)} className={i >= 5 ? 'text-[#c447f0]' : ''}>
              {ch}
            </span>
          ))}
          <span ref={shineRef} className="intro-word-shine">
            FSudoLab
          </span>
        </p>
        <div ref={hintRef} className="intro-hint">Flow through FSudoLab with a slow scroll</div>
      </div>
      <button type="button" onClick={() => skipRef.current()} className="intro-skip">
        Skip intro ↓
      </button>
    </section>
  )
}
