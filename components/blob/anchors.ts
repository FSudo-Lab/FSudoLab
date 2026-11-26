// Turns the scroll position into a target pose by blending the anchors
// (elements with data-blob-anchor) nearest a "reading line" just below the navbar.

import { ANCHORS, type Breakpoint, DEFAULT_POSE, type Pose, resolvePose } from './config'

/** Space taken by the fixed navbar (its bottom edge, including the safe-area inset). */
export const navSpace = () => {
  const nav = document.querySelector('nav')
  return nav ? nav.getBoundingClientRect().bottom + 4 : 96
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
  const els = document.querySelectorAll<HTMLElement>('[data-blob-anchor]')
  const line = readingLine(0.5)
  let before: HTMLElement | null = null
  let beforeD = -Infinity
  let after: HTMLElement | null = null
  let afterD = Infinity
  for (const el of Array.from(els)) {
    const r = el.getBoundingClientRect()
    const d = r.top + r.height / 2 - line
    if (d <= 0 && d > beforeD) {
      before = el
      beforeD = d
    } else if (d > 0 && d < afterD) {
      after = el
      afterD = d
    }
  }
  const H = window.innerHeight
  const pose = (el: HTMLElement | null): Pose => {
    const a = el ? ANCHORS[el.dataset.blobAnchor ?? ''] : undefined
    if (!a || !el) return DEFAULT_POSE
    const { ey, ...p } = resolvePose(a, bp)
    if (ey !== undefined) {
      // Section-pinned: convert the point inside the section to viewport units.
      const r = el.getBoundingClientRect()
      p.y = 1 - (2 * (r.top + ey * r.height)) / H
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
