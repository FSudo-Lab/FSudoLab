// Quality tiers, chosen from on-device signals only (no network benchmark lookups),
// plus a runtime FPS monitor that steps the tier down if the device struggles.
// The blob is smooth and low-frequency, so it needs little mesh detail.

export type Tier = 'high' | 'medium' | 'low'

export const TIER_SETTINGS: Record<Tier, { segments: number; dpr: [number, number] }> = {
  high: { segments: 96, dpr: [1, 1.25] }, // a soft blob needs little resolution; more is wasted GPU time
  medium: { segments: 72, dpr: [1, 1.25] },
  low: { segments: 44, dpr: [1, 1] },
}

/** Thresholds for automatic downgrades. */
export const FPS_RULES = { floor: 55, seconds: 2, warmup: 2.5 } // step down if it can't hold ~60 fps

export const lowerTier = (t: Tier): Tier => (t === 'high' ? 'medium' : 'low')

export function detectTier(): Tier {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency || 4
  const memory = nav.deviceMemory ?? 4
  const coarse = window.matchMedia('(pointer: coarse)').matches
  const minSide = Math.min(window.screen.width, window.screen.height)

  let renderer = ''
  try {
    const gl = document.createElement('canvas').getContext('webgl')
    const ext = gl?.getExtension('WEBGL_debug_renderer_info')
    renderer = ext && gl ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : ''
  } catch {
    // ignore
  }
  if (/swiftshader|llvmpipe|software|mali-4|adreno \(tm\) [34]\d\d|powervr sgx/i.test(renderer)) return 'low'

  if (coarse) {
    // Phones and tablets top out at medium.
    if (cores >= 6 && memory >= 4) return 'medium'
    if (minSide >= 700 && cores >= 4) return 'medium'
    return 'low'
  }
  if (cores >= 8 && memory >= 6) return 'high'
  if (cores >= 4) return memory >= 8 ? 'high' : 'medium'
  return 'low'
}

export class FpsMonitor {
  private frames = 0
  private elapsed = 0
  private lowSeconds = 0
  private age = 0
  fps = 60

  reset() {
    this.frames = 0
    this.elapsed = 0
    this.lowSeconds = 0
    this.age = 0
  }

  /** Feed the real frame delta; returns true when the tier should drop. */
  sample(dt: number): boolean {
    this.age += dt
    if (this.age < FPS_RULES.warmup) return false
    this.frames += 1
    this.elapsed += dt
    if (this.elapsed < 1) return false
    this.fps = this.frames / this.elapsed
    this.frames = 0
    this.elapsed = 0
    this.lowSeconds = this.fps < FPS_RULES.floor ? this.lowSeconds + 1 : 0
    return this.lowSeconds >= FPS_RULES.seconds
  }
}
