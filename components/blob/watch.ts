// Tracks the Insights video so the blob can "watch with you".

export const watch = {
  el: null as HTMLVideoElement | null,
  playing: false,
  paused: false, // paused mid-video (not at the start, not ended)
  ended: false,
  inView: false,
  fullscreen: false,
  time: 0,
}

export function attachVideoWatch(id: string, onFullscreen: (isFullscreen: boolean) => void) {
  const el = document.getElementById(id) as HTMLVideoElement | null
  if (!el) return () => {}
  watch.el = el

  const sync = () => {
    watch.time = el.currentTime
    watch.playing = !el.paused && !el.ended
    watch.ended = el.ended
    watch.paused = el.paused && !el.ended && el.currentTime > 0.05
  }
  const fs = (on: boolean) => {
    watch.fullscreen = on
    onFullscreen(on)
  }
  const onFsChange = () => fs(document.fullscreenElement === el || !!document.fullscreenElement?.contains(el))
  const onIosBegin = () => fs(true)
  const onIosEnd = () => fs(false)

  const events = ['play', 'playing', 'pause', 'ended', 'timeupdate', 'seeked', 'emptied'] as const
  events.forEach((ev) => el.addEventListener(ev, sync))
  el.addEventListener('webkitbeginfullscreen', onIosBegin)
  el.addEventListener('webkitendfullscreen', onIosEnd)
  document.addEventListener('fullscreenchange', onFsChange)

  const io = new IntersectionObserver(([entry]) => {
    watch.inView = entry.isIntersecting
  }, { threshold: 0.35 })
  io.observe(el)
  sync()

  return () => {
    events.forEach((ev) => el.removeEventListener(ev, sync))
    el.removeEventListener('webkitbeginfullscreen', onIosBegin)
    el.removeEventListener('webkitendfullscreen', onIosEnd)
    document.removeEventListener('fullscreenchange', onFsChange)
    io.disconnect()
    watch.el = null
  }
}
