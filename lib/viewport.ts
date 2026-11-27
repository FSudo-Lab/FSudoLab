// Stable viewport height for scroll maths.
//
// On phones and tablets window.innerHeight changes while the browser toolbar slides in and out,
// which made pinned sections re-measure mid-scroll (progress drift, layout jumps). The sticky
// frames are sized in `svh` (the small, never-changing viewport), so the scroll maths must use
// the very same number. A hidden 100svh probe reads it back in pixels. On desktop svh equals
// innerHeight, so nothing changes there. Falls back to innerHeight if svh is unsupported.

let probe: HTMLElement | null = null

export function stableVh(): number {
  if (typeof document === 'undefined') return 0
  if (!probe || !probe.isConnected) {
    probe = document.createElement('div')
    probe.setAttribute('aria-hidden', 'true')
    probe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none'
    document.body.appendChild(probe)
  }
  return probe.offsetHeight || window.innerHeight
}
