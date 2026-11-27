// ─────────────────────────────────────────────────────────────────────────────
// FSudoLab signature blob — everything you'd want to tweak lives in this file.
// ─────────────────────────────────────────────────────────────────────────────

export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl'

/** sm < 640px · md 640–1023px · lg 1024–1599px · xl ≥ 1600px */
export const getBreakpoint = (width: number): Breakpoint =>
  width >= 1600 ? 'xl' : width >= 1024 ? 'lg' : width >= 640 ? 'md' : 'sm'

/**
 * A pose the blob glides to while a section is on screen.
 *   x, y  position in viewport units (-1 = left/bottom edge, 0 = centre, 1 = right/top edge)
 *   s     size, relative to min(viewport width, viewport height) — 1 ≈ fills the short side
 *   d     how far the soft lobes push out (0 = sphere, 0.45 = very lumpy)
 *   f     lobe count (lower = fewer, bigger lobes)
 *   v     how fast the shape slowly changes
 *   o     opacity
 *   h     tone (0 = deep violet, 1 = lighter orchid)
 *   r     tilt in radians
 *   m1 m2 m3  how much the blob becomes a Chapter 02 shape (0 = blob, 1 = fully the shape):
 *             m1 = Discover sparkle, m2 = Design gem, m3 = Deliver box
 *   b     teleport (0 = here, 1 = beamed away) — the blob is away from Selected work to Partners
 */
export type Pose = { x: number; y: number; s: number; d: number; f: number; v: number; o: number; h: number; r: number; m1: number; m2: number; m3: number; b: number; i: number }

/**
 * Optional `ey` pins the blob to the section instead of the screen: 0 = section top,
 * 1 = section bottom. It then scrolls with the content (overrides `y`), which keeps it
 * clear of text on short phone screens.
 */
export type AnchorPose = Partial<Pose> & { ey?: number }

/** `lg` is the base. `md` overrides lg, `sm` overrides md, `xl` overrides lg. */
export type Anchor = { lg: AnchorPose; md?: AnchorPose; sm?: AnchorPose; xl?: AnchorPose }

export const DEFAULT_POSE: Pose = { x: 0, y: 0, s: 0.8, d: 0.3, f: 0.8, v: 0.4, o: 1, h: 0, r: 0, m1: 0, m2: 0, m3: 0, b: 0, i: 0 }

/**
 * Anchors are attached to page elements with `data-blob-anchor="<id>"`.
 * Keep the blob away from headlines, buttons and the video on every breakpoint.
 */
export const ANCHORS: Record<string, Anchor> = {
    // The hero blob. Pinned to the hero (ey) so it sits exactly behind the animated hero
  // blob and scrolls with it; the frames fade out as you scroll and reveal this blob,
  // which then travels down into the chapters.
  hero: {
    lg: { x: -0.6, ey: 0.34, s: 1.05, d: 0.55, f: 0.55, v: 0.35, h: 0.15 },
    md: { x: -0.45, ey: 0.4, s: 1.0 },
    sm: { x: -0.35, ey: 0.36, s: 1.0 },
  },
  // Chapter 01 is pinned and told in two beats: a small unformed lump, then it grows.
  'spark-0': {
    lg: { x: 0.5, y: 0.05, s: 0.4, d: 0.4, f: 0.6, v: 0.5, h: 0 },
    md: { x: 0.55, y: 0.4, s: 0.3 },
    sm: { x: 0.35, y: 0.5, s: 0.32 },
  },
  'spark-1': {
    lg: { x: 0.45, y: 0, s: 0.72, d: 0.52, f: 0.55, v: 0.4, h: 0.2 },
    md: { x: 0.5, y: 0.38, s: 0.55 },
    sm: { x: 0.2, y: 0.48, s: 0.55 },
    xl: { s: 0.6 },
  },
  // Chapter 02: the blob becomes each word's shape as you scroll —
  // Discover = sparkle, Design = cut gem, Deliver = a package (rounded box) — and melts back into
  // the blob when you leave the chapter (every other anchor has m1–m3 at 0).
  'method-0': {
    lg: { x: 0.45, y: -0.02, s: 0.4, d: 0.3, f: 0.7, v: 0.45, h: 0.25, m1: 1 },
    md: { x: 0.55, y: 0.6, s: 0.26 },
    sm: { x: 0, y: 0.5, s: 0.42, o: 0.95 },
  },
  'method-1': {
    lg: { x: 0.45, y: -0.02, s: 0.4, d: 0.3, f: 0.7, v: 0.35, h: 0.4, m2: 1 },
    md: { x: 0.55, y: 0.6, s: 0.26 },
    sm: { x: 0, y: 0.5, s: 0.42, o: 0.95 },
  },
  'method-2': {
    lg: { x: 0.45, y: -0.02, s: 0.42, d: 0.3, f: 0.7, v: 0.35, h: 0.55, m3: 1 },
    md: { x: 0.55, y: 0.6, s: 0.28 },
    sm: { x: 0, y: 0.5, s: 0.44, o: 0.95 },
  },
  // After Deliver the blob teleports away: it beams out right where it was (same pose as
  // method-2, b: 1), stays away through Selected work, Insights and Partners, and beams back in
  // at the contact section: it appears small where contact's blob sits and grows to full size as it untwists.
  work: {
    lg: { x: 0.45, y: -0.02, s: 0.42, d: 0.3, f: 0.7, v: 0.35, h: 0.55, m3: 1, b: 1 },
    md: { x: 0.55, y: 0.6, s: 0.28 },
    sm: { x: 0, y: 0.5, s: 0.44, o: 0.95 },
  },
  insights: {
    lg: { x: 0, y: -0.02, s: 0.3, d: 0.44, f: 0.55, v: 0.3, h: 0.45, b: 1 },
    sm: { s: 0.3 },
    xl: { s: 0.3 },
  },
  partners: {
    lg: { x: 0, y: -0.02, s: 0.3, d: 0.44, f: 0.55, v: 0.3, h: 0.45, b: 1 },
    sm: { s: 0.3 },
    xl: { s: 0.3 },
  },
  // Big, behind the closing headline.
  // Contact: the blob cycles through icons every few seconds (question mark → email → send → check),
  // see ICON_SECONDS in BlobScene.tsx. i = how much it is an icon (0 = blob, 1 = icon).
  contact: {
    lg: { x: 0, ey: 0.5, s: 0.66, d: 0.44, f: 0.55, v: 0.3, h: 0.45, i: 1 },
    sm: { s: 0.5, ey: 0.5 },
    xl: { s: 0.6 },
  },
}

export function resolvePose(anchor: Anchor, bp: Breakpoint): Pose & { ey?: number } {
  if (bp === 'xl') return { ...DEFAULT_POSE, ...anchor.lg, ...anchor.xl }
  if (bp === 'md') return { ...DEFAULT_POSE, ...anchor.lg, ...anchor.md }
  if (bp === 'sm') return { ...DEFAULT_POSE, ...anchor.lg, ...anchor.md, ...anchor.sm }
  return { ...DEFAULT_POSE, ...anchor.lg }
}

/** Motion tuning. */
export const TUNING = {
  follow: 3, // how quickly the blob catches up with its chapter pose (higher = less lag)
  breathe: 0.022, // gentle size pulse (fraction of size)
  breatheSpeed: 1.7,
  gemSpin: 0.5, // radians per second the Design gem turns
  stretchPerSpeed: 1 / 3500, // stretch per px/s of scroll speed
  maxStretch: 0.12,
  wobbleKick: 2.6, // jelly wobble when it changes into a new shape
  squashStiffness: 110, // spring that settles stretch and wobble (lower = wobblier)
  squashDamping: 7,
  introFrom: 0.55, // pop-in on load starts at this size
}
