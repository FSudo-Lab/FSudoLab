'use client'

// The FSudoLab signature blob in one fixed WebGL canvas. It looks like the hero blob
// and simply drifts to each chapter's pose as you scroll. No pointer tricks.
// Everything per-frame happens in <Director/>'s useFrame with refs (no React state).

import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, Mesh, ShaderMaterial, Vector3, Vector4 } from 'three'
import { readAnchorTarget } from './anchors'
import { DEFAULT_POSE, getBreakpoint, type Pose, TUNING } from './config'
import { FpsMonitor, lowerTier, type Tier, TIER_SETTINGS } from './quality'
import { buildIconGeometries } from './icons'
import { fragmentShader, iconVertexShader, vertexShader } from './shaders'

type Rig = { root: Group | null; body: Mesh | null; icons: (Mesh | null)[] }

const damp = (rate: number, dt: number) => 1 - Math.exp(-rate * dt)
const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
/** Contact icons: seconds each icon is shown (question mark → email → send → check → …). */
const ICON_SECONDS = 3
const band = (a: number, b: number, v: number) => {
  const t = clamp01((v - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/**
 * Deliver → Selected work handoff. While the pinned #projects section is on screen (desktop only,
 * marked data-handoff="on"), returns its scroll progress 0..1 and the measured screen bounds of the
 * code-window frame; otherwise null. The section uses the same formula for its HTML layers.
 */
// The section's page position and the frame's on-screen box are measured once and reused
// (the frame does not move while the section is pinned), so the handoff costs no layout reads
// per frame. Re-measured on resize / page size changes, or once scrolling pauses.
let hand: { top: number; height: number; frame: DOMRect | null } | null = null
let handWatch = false
function readHandoff(H: number): { p: number; frame: DOMRect } | null {
  const sec = document.getElementById('projects')
  if (!sec || sec.dataset.handoff !== 'on') return null
  if (!handWatch) {
    handWatch = true
    const reset = () => { hand = null }
    window.addEventListener('resize', reset)
    new ResizeObserver(reset).observe(document.body)
    let idle = 0
    window.addEventListener('scroll', () => { window.clearTimeout(idle); idle = window.setTimeout(reset, 500) }, { passive: true })
  }
  if (!hand) {
    const r = sec.getBoundingClientRect()
    hand = { top: r.top + window.scrollY, height: r.height, frame: null }
  }
  const top = hand.top - window.scrollY
  if (top > 2 || top + hand.height < H * 0.5) {
    hand.frame = null
    return null
  }
  if (!hand.frame) {
    const f = sec.querySelector<HTMLElement>('[data-work-frame]')?.getBoundingClientRect()
    if (!f || f.width < 10) return null
    hand.frame = f
  }
  return { p: clamp01(-top / Math.max(1, hand.height - H)), frame: hand.frame }
}

/** Draws the scene only while the blob is visible; skips the GPU work entirely otherwise
 *  (the hero artwork, and the long stretch from What we offer to Testimonials). */
function Renderer({ rig }: { rig: Rig }) {
  const drawn = useRef(false)
  useFrame((state) => {
    if (rig.root?.visible) {
      state.gl.render(state.scene, state.camera)
      drawn.current = true
    } else if (drawn.current) {
      state.gl.clear()
      drawn.current = false
    }
  }, 1)
  return null
}

function BlobBody({ rig, segments }: { rig: Rig; segments: number }) {
  const uniforms = useMemo(
    () => ({
      uTime: { value: Math.random() * 10 },
      uDistort: { value: 0.3 },
      uFreq: { value: 0.8 },
      uOpacity: { value: 1 },
      uHue: { value: 0 },
      uShape: { value: new Vector3() },
      uSpin: { value: 0 },
      uBreak: { value: 0 },
      uFace: { value: 0 },
      uInk: { value: 0 },
      uIcon: { value: new Vector4(1, 0, 0, 0) },
      uIconMix: { value: 0 },
    }),
    [],
  )
  // Contact icons as crisp extruded shapes, each with its own copy of the uniforms (its own icon).
  const iconGeos = useMemo(() => buildIconGeometries(), [])
  const iconUniforms = useMemo(
    () =>
      iconGeos.map((_, j) => ({
        uOpacity: { value: 0 },
        uHue: { value: 0.45 },
        uIcon: { value: new Vector4(j === 0 ? 1 : 0, j === 1 ? 1 : 0, j === 2 ? 1 : 0, j === 3 ? 1 : 0) },
        uIconMix: { value: 1 },
        uInk: { value: 0 },
      })),
    [iconGeos],
  )
  return (
    <group ref={(g) => void (rig.root = g)} visible={false}>
      <mesh ref={(m) => void (rig.body = m)}>
        <sphereGeometry args={[1, segments, segments]} />
        <shaderMaterial vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent />
      </mesh>
      {iconGeos.map((g, j) => (
        <mesh key={j} ref={(m) => void (rig.icons[j] = m)} geometry={g} visible={false}>
          <shaderMaterial vertexShader={iconVertexShader} fragmentShader={fragmentShader} uniforms={iconUniforms[j]} transparent />
        </mesh>
      ))}
    </group>
  )
}

function Director({ tier, reduced, rig, onLowFps }: { tier: Tier; reduced: boolean; rig: Rig; onLowFps: () => void }) {
  const setFrameloop = useThree((s) => s.setFrameloop)
  const fps = useMemo(() => new FpsMonitor(), [])
  const s = useRef({
    ready: false,
    live: false,
    frames: 0,
    cur: { ...DEFAULT_POSE } as Pose,
    target: { ...DEFAULT_POSE } as Pose,
    time: 0,
    lastScroll: 0,
    scrollVel: 0,
    squash: 1,
    squashV: 0,
    intro: TUNING.introFrom,
    introV: 0,
    shapeId: -1,
    iconT: 0,
    icon: 0,
    iconW: [1, 0, 0, 0],
    prevIcon: 0,
    swapT: 9,
  })

  useEffect(() => {
    fps.reset()
  }, [tier, fps])

  // Pause rendering while the tab is hidden or something (the video) is fullscreen.
  useEffect(() => {
    const apply = () => setFrameloop(document.hidden || document.fullscreenElement ? 'never' : 'always')
    document.addEventListener('visibilitychange', apply)
    document.addEventListener('fullscreenchange', apply)
    return () => {
      document.removeEventListener('visibilitychange', apply)
      document.removeEventListener('fullscreenchange', apply)
    }
  }, [setFrameloop])

  useFrame((state, delta) => {
    const S = s.current
    const u = (rig.body?.material as ShaderMaterial | undefined)?.uniforms
    if (!rig.root || !rig.body || !u) return
    if (!reduced && fps.sample(delta)) {
      fps.reset()
      if (tier !== 'low') onLowFps()
    }

    const dt = Math.min(delta, 0.05)
    const W = state.size.width
    const H = state.size.height
    const vp = state.viewport.getCurrentViewport(state.camera, [0, 0, 0])

    S.frames++
    // Glide toward the pose of the chapter being read, with a soft lag.
    readAnchorTarget(getBreakpoint(W), S.target)
    const k = !S.ready || reduced ? 1 : damp(TUNING.follow, dt)
    for (const key of Object.keys(S.cur) as (keyof Pose)[]) S.cur[key] += (S.target[key] - S.cur[key]) * k
    S.ready = true

    const c = S.cur
    // Deliver: the package hops up and to the right in a slow rhythm, on its way out.
    const launch = reduced ? 0 : c.m3 * (0.5 - 0.5 * Math.cos(S.time * 2.2)) * Math.min(W, H) * 0.025
    const cx = ((c.x + 1) / 2) * W + launch * 0.8
    const cy = ((1 - c.y) / 2) * H - launch
    const r = (c.s * Math.min(W * 0.95, H)) / 2
    // Shrink the base sphere so the lobes end up at about the intended size.
    const rw = ((r * vp.width) / W) / (1 + c.d * 0.8)
    S.time += dt

    // ── Animations (all off for reduced motion) ──────────────────────────────
    // Pop-in on load: a springy grow to full size.
    S.introV += (60 * (1 - S.intro) - 9 * S.introV) * dt
    S.intro = reduced ? 1 : S.intro + S.introV * dt
    // Breathing.
    const breathe = reduced ? 1 : 1 + Math.sin(S.time * TUNING.breatheSpeed) * TUNING.breathe
    // Stretch with scroll speed, and a jelly wobble whenever it turns into a new shape.
    const y = window.scrollY
    const rawVel = S.frames > 2 ? (y - S.lastScroll) / Math.max(dt, 1e-3) : 0
    S.scrollVel += (rawVel - S.scrollVel) * damp(10, dt)
    S.lastScroll = y
    const shapes = [c.m1, c.m2, c.m3]
    const strongest = Math.max(...shapes)
    const shapeId = strongest > 0.6 ? shapes.indexOf(strongest) : -1
    if (shapeId !== S.shapeId) {
      if (S.frames > 3) S.squashV += TUNING.wobbleKick
      S.shapeId = shapeId
    }
    const stretch = reduced ? 1 : 1 + Math.min(Math.abs(S.scrollVel) * TUNING.stretchPerSpeed, TUNING.maxStretch)
    S.squashV += (TUNING.squashStiffness * (stretch - S.squash) - TUNING.squashDamping * S.squashV) * dt
    S.squash = reduced ? 1 : Math.min(1.35, Math.max(0.75, S.squash + S.squashV * dt))

    // ── Deliver → Selected work handoff (one continuous, reversible scroll timeline) ──
    //  0–20%  face:  the box stops tumbling and turns its broad face to the viewer
    // 20–40%  morph: that face widens onto the code window's measured bounds; ink: it turns navy
    // 38–45%  fade:  the real HTML window (same outline) takes over and the 3D shape bows out
    const hand = reduced ? null : readHandoff(H)
    const hp = hand ? hand.p : -1
    const face = hand ? band(0, 0.2, hp) : 0
    const morph = hand ? band(0.2, 0.4, hp) : 0
    const ink = hand ? band(0.24, 0.4, hp) : 0
    const handFade = hand ? 1 - band(0.38, 0.45, hp) : 1
    const calm = 1 - face // breathing, hop and squash settle so the outline is clean

    const k2 = rw * (1 + (breathe - 1) * calm) * S.intro
    const sq = 1 + (S.squash - 1) * calm
    const bx = ((cx - launch * 0.8 * face) / W - 0.5) * vp.width
    const by = (0.5 - (cy + launch * face) / H) * vp.height
    let px = bx, py = by
    let sx = k2 / Math.sqrt(sq), sy = k2 * sq, sz = k2 / Math.sqrt(sq)
    if (hand && morph > 0) {
      const f = hand.frame
      // The box's half-extent along each axis is 0.9 (see boxR in shaders.ts). Its front face sits
      // a little closer to the camera, so shrink x/y by the perspective factor to land exactly.
      const camZ = 6
      const tz = ((f.height / 2) * vp.height) / H / 0.9 * 0.12
      const persp = (camZ - tz * 0.9) / camZ
      const tx = ((f.width / 2) * vp.width) / W / 0.9 * persp
      const ty = ((f.height / 2) * vp.height) / H / 0.9 * persp
      const fx = ((f.left + f.width / 2) / W - 0.5) * vp.width
      const fy = (0.5 - (f.top + f.height / 2) / H) * vp.height
      px = bx + (fx - bx) * morph
      py = by + (fy - by) * morph
      sx += (tx - sx) * morph
      sy += (ty - sy) * morph
      sz += (tz - sz) * morph
    }
    const visibleNow = c.o * ((window as Window & { __fsHeroHandoff?: number }).__fsHeroHandoff ?? 1) * handFade
    rig.root.visible = visibleNow > 0.01
    rig.root.position.set(px, py, 0)
    rig.root.rotation.z = c.r * calm
    rig.root.scale.set(sx, sy, sz)

    u.uTime.value += reduced ? 0 : dt * c.v
    u.uDistort.value = c.d * (1 - face * 0.85)
    u.uFreq.value = c.f
    u.uHue.value = c.h
    // While the hero artwork is showing, the hero says how visible this blob may be (so the two
    // never show at once). Elsewhere the value is 1.
    const handoff = (window as Window & { __fsHeroHandoff?: number }).__fsHeroHandoff ?? 1
    u.uOpacity.value = c.o * handoff * handFade
    // During the handoff it is always the Deliver box, never mid-teleport.
    if (hand) u.uShape.value.set(0, 0, 1)
    else u.uShape.value.set(c.m1, c.m2, c.m3)
    // Teleport amount: only the middle of the blend twists (25–75%), so the beam is brief.
    u.uBreak.value = hand ? 0 : band(0.25, 0.75, c.b)
    u.uFace.value = face
    u.uInk.value = ink
    // Contact icons: while the blob is (mostly) an icon, step to the next one every ICON_SECONDS,
    // morphing between them with a little jelly wobble. It starts again from the question mark
    // each time you arrive. Reduced motion: it stays the question mark.
    if (c.i > 0.5 && !reduced) S.iconT += dt
    else if (c.i < 0.05) S.iconT = 0
    const icon = Math.floor(S.iconT / ICON_SECONDS) % 4
    if (icon !== S.icon) {
      S.prevIcon = S.icon
      S.icon = icon
      S.swapT = 0
    }
    // The blob itself morphs toward the icon's outline while it arrives (uIconMix = c.i); once it
    // has settled, the crisp extruded icon takes over (exact edges), and the blob steps aside.
    for (let j = 0; j < 4; j++) S.iconW[j] = j === icon ? 1 : 0
    u.uIcon.value.set(S.iconW[0], S.iconW[1], S.iconW[2], S.iconW[3])
    u.uIconMix.value = hand ? 0 : c.i
    const crisp = hand ? 0 : band(0.82, 0.98, c.i)
    u.uOpacity.value *= 1 - crisp
    if (crisp > 0.99) rig.body.visible = false
    else rig.body.visible = true
    // Swap: the old icon squashes flat like jelly, the new one springs up out of it (0.7 s).
    S.swapT += dt
    const sw = reduced ? 1 : Math.min(1, S.swapT / 0.7)
    const showing = sw < 0.5 ? S.prevIcon : icon
    let ix = 1, iy = 1
    if (sw < 0.5) {
      const e = band(0, 1, sw / 0.5)
      ix = 1 + 0.2 * e
      iy = 1 - 0.88 * e
    } else if (sw < 1) {
      const v = (sw - 0.5) / 0.5
      const back = 1 + 2.2 * Math.pow(v - 1, 3) + 1.2 * Math.pow(v - 1, 2) // ease-out with overshoot
      ix = 1.2 - 0.2 * back
      iy = 0.12 + 0.88 * back
    }
    rig.icons.forEach((m, j) => {
      if (!m) return
      const on = j === showing && crisp > 0.001
      m.visible = on
      if (!on) return
      m.scale.set(ix, iy, 1)
      m.rotation.z = (1 - iy) * 0.12
      const mu = (m.material as ShaderMaterial).uniforms
      mu.uOpacity.value = c.o * handoff * handFade * crisp
      mu.uHue.value = c.h
    })
    if (!reduced) u.uSpin.value += dt * TUNING.gemSpin

    // Once the blob is really on screen, tell the hero it can hand over its frame
    // animation: from here on this blob *is* the hero blob, and it travels down the page.
    if (!S.live && S.frames > 3) {
      S.live = true
      document.documentElement.dataset.blobLive = '1'
      window.dispatchEvent(new Event('blob-live'))
    }
  })

  return null
}

export default function BlobScene({ initialTier, lockTier = false, reduced }: { initialTier: Tier; lockTier?: boolean; reduced: boolean }) {
  const [tier, setTier] = useState<Tier>(initialTier)
  const settings = TIER_SETTINGS[tier]
  const rig = useMemo<Rig>(() => ({ root: null, body: null, icons: [] }), [])

  useEffect(() => {
    document.documentElement.dataset.blobTier = tier
  }, [tier])

  return (
    <Canvas
      key={tier}
      dpr={settings.dpr}
      camera={{ position: [0, 0, 6], fov: 35 }}
      gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'default' }}
      style={{ pointerEvents: 'none' }}
      tabIndex={-1}
      aria-hidden="true"
    >
      <BlobBody rig={rig} segments={settings.segments} />
      <Director tier={tier} reduced={reduced} rig={rig} onLowFps={() => !lockTier && setTier((t) => lowerTier(t))} />
      <Renderer rig={rig} />
    </Canvas>
  )
}
