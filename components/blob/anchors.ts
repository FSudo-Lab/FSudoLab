// Turns the scroll position into a target pose by blending the anchors
// (elements with data-blob-anchor) nearest a "reading line" just below the navbar.

import { ANCHORS, type Breakpoint, DEFAULT_POSE, type Pose, resolvePose } from './config'

// Measured positions, reused every frame (no layout reads while scrolling). Re-measured only when
// the layout can have changed: a resize, the page changing size (pinned sections settling, images
// loading), or once scrolling pauses as a safety net.
type Spot = { el: HTMLElement; top: number; height: number }
let spots: Spot[] | null = null
let navBottom = -1
let watching = false
const invalidate = () => {
  spots = null
  navBottom = -1
}
function watch() {
  if (watching || typeof window === 'undefined') return
  watching = true
  window.addEventListener('resize', invalidate)
  new ResizeObserver(invalidate).observe(document.body)
  new MutationObserver(invalidate).observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-blob-anchor'] })
  let idle = 0
  window.addEventListener('scroll', () => {
    window.clearTimeout(idle)
    idle = window.setTimeout(invalidate, 500)
  }, { passive: true })
}
function anchorSpots(): Spot[] {
  watch()
  if (!spots) {
    const sy = window.scrollY
    spots = Array.from(document.querySelectorAll<HTMLElement>('[data-blob-anchor]')).map((el) => {
      const r = el.getBoundingClientRect()
      return { el, top: r.top + sy, height: r.height }
    })
  }
  return spots
}

/** Space taken by the fixed navbar (its bottom edge, including the safe-area inset). */
export const navSpace = () => {
  watch()
  if (navBottom < 0) {
    const nav = document.querySelector('nav')
    navBottom = nav ? nav.getBoundingClientRect().bottom + 4 : 96
  }
  return navBottom
}

/** Vertical line (px from viewport top) used to decide which section is "current". */
export const readingLine = (ratio = 0.5) => {
  const top = navSpace()
  return top + (window.innerHeight - top) * ratio
}

const smooth = (t: number) => {
  const c = Math.min(1, Math.max(0, (t - 0.2) / 0.6))
  return c * c * (3 - 2 * c)
}

const keys = Object.keys(DEFAULT_POSE) as (keyof Pose)[]

export function readAnchorTarget(bp: Breakpoint, out: Pose): Pose {
  const list = anchorSpots()
  const sy = window.scrollY
  const line = readingLine(0.5)
  let before: Spot | null = null
  let beforeD = -Infinity
  let after: Spot | null = null
  let afterD = Infinity
  for (const sp of list) {
    const d = sp.top - sy + sp.height / 2 - line
    if (d <= 0 && d > beforeD) {
      before = sp
      beforeD = d
    } else if (d > 0 && d < afterD) {
      after = sp
      afterD = d
    }
  }
  const H = window.innerHeight
  const pose = (sp: Spot | null): Pose => {
    const a = sp ? ANCHORS[sp.el.dataset.blobAnchor ?? ''] : undefined
    if (!a || !sp) return DEFAULT_POSE
    const { ey, ...p } = resolvePose(a, bp)
    if (ey !== undefined) {
      // Section-pinned: convert the point inside the section to viewport units.
      p.y = 1 - (2 * (sp.top - sy + ey * sp.height)) / H
    }
    return p
  }
  if (!before && !after) return Object.assign(out, DEFAULT_POSE)
  if (!before) return Object.assign(out, pose(after))
  if (!after) return Object.assign(out, pose(before))
  const a = pose(before)
  const b = pose(after)
  const t = smooth(-beforeD / (afterD - beforeD))
  for (const k of keys) out[k] = a[k] + (b[k] - a[k]) * t
  return out
}
