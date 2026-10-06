import { useEffect, useRef } from 'react'
import desktopSrc from '../../assets/hero-video/video_desktop.webm'
import mobileSrc from '../../assets/hero-video/video_mobile.webm'

/* Hero background video. Plays once when the site is opened or reloaded, then stays frozen on its last frame (no loop). */
// module-level: a full page load / reload resets it; in-app navigation (e.g. to Privacy and back) does not, so the intro plays once per visit
let played = false

export default function HeroFrames() {
  const ref = useRef<HTMLVideoElement>(null)
  const src = typeof window !== 'undefined' && window.innerWidth <= 768 ? mobileSrc : desktopSrc

  useEffect(() => {
    const v = ref.current!
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    let cancelled = false, objectUrl = ''
    // (these webm files carry no duration, so seeking to a huge time is what lands on the true last frame)
    const announceEnded = () => {
      ;(window as unknown as { __cfHeroEnded?: boolean }).__cfHeroEnded = true
      window.dispatchEvent(new Event('cf:hero-ended'))
    }
    const freeze = () => { v.currentTime = isFinite(v.duration) ? Math.max(0, v.duration - 0.04) : 1e101; v.pause(); announceEnded() }
    const onEnded = () => { played = true; announceEnded() } // a finished video simply stays on its last frame, no extra seek needed
    v.addEventListener('ended', onEnded)

    // Playback starts only once the whole clip is in memory, so it can't stall or stutter on the network mid-way.
    const ready = () => {
      if (cancelled) return
      // tell the rest of the page the hero video is loaded: the heavy dot animation starts only after this
      ;(window as unknown as { __cfHeroReady?: boolean }).__cfHeroReady = true
      window.dispatchEvent(new Event('cf:hero-ready'))
      if (played || reduce) freeze()
      else v.play().catch(() => freeze()) // autoplay blocked: show the last frame instead
    }
    v.addEventListener('canplaythrough', ready, { once: true })
    fetch(src)
      .then(r => r.blob())
      .then(b => { if (cancelled) return; objectUrl = URL.createObjectURL(b); v.src = objectUrl; v.load() })
      .catch(() => { if (!cancelled) { v.src = src; v.load() } })

    return () => { cancelled = true; v.removeEventListener('ended', onEnded); v.removeEventListener('canplaythrough', ready); if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [src])

  return <video ref={ref} className="cf2i-video" muted playsInline preload="auto" aria-hidden="true" />
}
