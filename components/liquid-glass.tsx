'use client'

import { useEffect } from 'react'

// Liquid glass refraction for elements marked with `data-lg-refract`.
//
// Every glass surface gets the CSS look (see `.lg` in globals.css): a clear tinted pane,
// a soft blur, a bright rim and an inner glow. On top of that, browsers that can run an SVG
// filter inside `backdrop-filter` (Chromium: Chrome, Edge, Opera, Brave) on a desktop-class
// device also bend what is behind the glass near its rounded edges, like a real lens.
// A displacement map is drawn for each element at its own size and redrawn when it resizes.
//
// Safari and Firefox (no SVG filters in backdrop-filter) keep the CSS look only.

const BEZEL = 26 // px from the edge where the glass bends the background
const STRENGTH = 34 // how far (px) the background is pulled at the very edge

function canRefract() {
  if (typeof window === 'undefined') return false
  const brands = (navigator as Navigator & { userAgentData?: { brands?: { brand: string }[] } }).userAgentData?.brands
  const ua = navigator.userAgent
  const chromium = brands ? brands.some((b) => /Chromium/i.test(b.brand)) : /Chrome\//.test(ua) && !/Firefox|FxiOS|CriOS/.test(ua)
  if (!chromium) return false
  if (window.matchMedia('(prefers-reduced-transparency: reduce)').matches) return false
  if (document.documentElement.dataset.blobTier === 'low' && (navigator.hardwareConcurrency || 8) <= 4) return false
  return true
}

/** Displacement map for a rounded rectangle: R/G hold the x/y pull, 128 = none. */
function drawMap(w: number, h: number, r: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const img = ctx.createImageData(w, h)
  const d = img.data
  const hx = w / 2
  const hy = h / 2
  const rad = Math.min(r, hx, hy)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const px = x + 0.5 - hx
      const py = y + 0.5 - hy
      const qx = Math.abs(px) - (hx - rad)
      const qy = Math.abs(py) - (hy - rad)
      let nx = 0
      let ny = 0
      let sd: number
      if (qx > 0 && qy > 0) {
        const l = Math.hypot(qx, qy) || 1
        sd = l - rad
        nx = (qx / l) * Math.sign(px)
        ny = (qy / l) * Math.sign(py)
      } else if (qx > qy) {
        sd = qx - rad
        nx = Math.sign(px)
      } else {
        sd = qy - rad
        ny = Math.sign(py)
      }
      const depth = -sd
      let m = 0
      if (depth < BEZEL) {
        const t = 1 - Math.max(depth, 0) / BEZEL
        m = t * t * (3 - 2 * t)
      }
      // Pull the background in from further inside, so the edge looks curved and magnified.
      const i = (y * w + x) * 4
      d[i] = 128 - nx * m * 127
      d[i + 1] = 128 - ny * m * 127
      d[i + 2] = 128
      d[i + 3] = 255
    }
  }
  ctx.putImageData(img, 0, 0)
  return c.toDataURL()
}

export function LiquidGlass() {
  useEffect(() => {
    if (!canRefract()) return
    const NS = 'http://www.w3.org/2000/svg'
    const svg = document.createElementNS(NS, 'svg')
    svg.setAttribute('aria-hidden', 'true')
    svg.setAttribute('width', '0')
    svg.setAttribute('height', '0')
    svg.style.position = 'absolute'
    svg.style.pointerEvents = 'none'
    const defs = document.createElementNS(NS, 'defs')
    svg.appendChild(defs)
    document.body.appendChild(svg)
    document.documentElement.classList.add('lg-refract')

    let n = 0
    const sizes = new WeakMap<HTMLElement, string>()
    const ids = new WeakMap<HTMLElement, string>()

    const build = (el: HTMLElement) => {
      const w = Math.round(el.offsetWidth)
      const h = Math.round(el.offsetHeight)
      if (w < 8 || h < 8) return
      const key = `${w}x${h}`
      if (sizes.get(el) === key) return
      sizes.set(el, key)
      let id = ids.get(el)
      if (!id) {
        id = `lg-${++n}`
        ids.set(el, id)
      }
      const radius = parseFloat(getComputedStyle(el).borderTopLeftRadius) || h / 2
      defs.querySelector(`#${id}`)?.remove()
      const f = document.createElementNS(NS, 'filter')
      f.id = id
      f.setAttribute('x', '0')
      f.setAttribute('y', '0')
      f.setAttribute('width', String(w))
      f.setAttribute('height', String(h))
      f.setAttribute('filterUnits', 'userSpaceOnUse')
      f.setAttribute('color-interpolation-filters', 'sRGB')
      const fi = document.createElementNS(NS, 'feImage')
      fi.setAttribute('href', drawMap(w, h, radius))
      fi.setAttribute('x', '0')
      fi.setAttribute('y', '0')
      fi.setAttribute('width', String(w))
      fi.setAttribute('height', String(h))
      fi.setAttribute('preserveAspectRatio', 'none')
      fi.setAttribute('result', 'map')
      const dm = document.createElementNS(NS, 'feDisplacementMap')
      dm.setAttribute('in', 'SourceGraphic')
      dm.setAttribute('in2', 'map')
      dm.setAttribute('scale', String(STRENGTH * 2))
      dm.setAttribute('xChannelSelector', 'R')
      dm.setAttribute('yChannelSelector', 'G')
      f.append(fi, dm)
      defs.appendChild(f)
      el.style.setProperty('--lg-refract', `url(#${id})`)
    }

    const ro = new ResizeObserver((entries) => entries.forEach((e) => build(e.target as HTMLElement)))
    const seen = new WeakSet<HTMLElement>()
    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-lg-refract]').forEach((el) => {
        if (seen.has(el)) return
        seen.add(el)
        build(el)
        ro.observe(el)
      })
    }
    scan()
    let queued = 0
    const mo = new MutationObserver(() => {
      if (queued) return
      queued = requestAnimationFrame(() => {
        queued = 0
        scan()
      })
    })
    mo.observe(document.body, { childList: true, subtree: true })

    // The edge-bending filter is the most expensive effect on the page, and it is recomputed
    // every frame while the content behind the glass moves. So it rests while you are actively
    // scrolling (the glass, blur and rim stay) and returns the moment you stop.
    const html = document.documentElement
    let rest = 0
    const onScroll = () => {
      if (!html.classList.contains('lg-scrolling')) html.classList.add('lg-scrolling')
      window.clearTimeout(rest)
      rest = window.setTimeout(() => html.classList.remove('lg-scrolling'), 140)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.clearTimeout(rest)
      html.classList.remove('lg-scrolling')
      mo.disconnect()
      ro.disconnect()
      cancelAnimationFrame(queued)
      svg.remove()
      document.documentElement.classList.remove('lg-refract')
    }
  }, [])

  return null
}
