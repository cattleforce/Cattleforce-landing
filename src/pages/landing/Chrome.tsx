import { useEffect, useRef, useState } from 'react'
import logoWhite from '../../assets/new/logo-lockup-white.png'
import logoBlack from '../../assets/new/logo-lockup-black.png'
import HeroFrames from './HeroFrames'
import { clamp } from './herd'

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.cattleforce.in'
const NAV = [['Product', '#product'], ['Features', '#features'], ['Farms', '#field'], ['Questions', '#faq']]
const SHADOW = '0 0 24px rgba(34,42,53,0.06), 0 1px 1px rgba(0,0,0,0.05), 0 0 0 1px rgba(34,42,53,0.04), 0 0 4px rgba(34,42,53,0.08), 0 16px 68px rgba(47,48,55,0.05), 0 1px 0 rgba(255,255,255,0.1) inset'


/* ── Click ripple: shared state, drawn by background layers only (never over content) ── */
type Rip = { x: number; y: number; fixed: boolean; t: number }
const RIP_S = 35.7, RIP_SPD = 13
// one shared store on globalThis, so every layer sees the same clicks even after a hot reload
const ripStore: { list: Rip[] } = ((globalThis as unknown as { __cfRipples?: { list: Rip[] } }).__cfRipples ??= { list: [] })

/** Draw the live ripples on a canvas whose top-left sits at (ox, oy) in viewport coordinates. */
function paintRipples(ctx: CanvasRenderingContext2D, w: number, h: number, ox: number, oy: number, n: number, rgb: string, maxA: number) {
  const sy = scrollY
  const QY = (q: Rip) => (q.fixed ? q.y + sy : q.y)
  const r0 = Math.floor((sy + oy) / RIP_S), r1 = Math.ceil((sy + oy + h) / RIP_S)
  const c0 = Math.floor(ox / RIP_S), c1 = Math.ceil((ox + w) / RIP_S)
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
    let a = 0
    for (const q of ripStore.list) {
      const dd = Math.hypot(c + 0.5 - q.x / RIP_S, r + 0.5 - QY(q) / RIP_S), fr = (n - q.t) * RIP_SPD
      a = Math.max(a, Math.exp(-((dd - fr) * (dd - fr)) / 1.6))
    }
    if (a > 0.01) { ctx.fillStyle = `rgba(${rgb},${(maxA * a).toFixed(3)})`; ctx.fillRect(c * RIP_S - ox + 1, r * RIP_S - sy - oy + 1, RIP_S - 1, RIP_S - 1) }
  }
}

/** A canvas that paints the click ripple inside a section's own background layer. */
export function RippleLayer({ rgb, maxA }: { rgb: string; maxA: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    let raf = 0, dirty = false
    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop)
      const rc = cv.getBoundingClientRect()
      if (!ripStore.list.length || rc.bottom < 0 || rc.top > innerHeight) {
        if (dirty) { ctx.clearRect(0, 0, cv.width, cv.height); dirty = false }
        return
      }
      const d = Math.min(2, devicePixelRatio || 1)
      if (cv.width !== Math.round(rc.width * d) || cv.height !== Math.round(rc.height * d)) { cv.width = Math.round(rc.width * d); cv.height = Math.round(rc.height * d) }
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, rc.width, rc.height)
      paintRipples(ctx, rc.width, rc.height, rc.left, rc.top, ms / 1000, rgb, maxA); dirty = true
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [rgb, maxA])
  return <canvas ref={ref} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
}

/* ── Navbar (resizable pill) ────────────────────────────── */

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [hov, setHov] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [desk, setDesk] = useState(() => innerWidth >= 1024)

  useEffect(() => {
    let last = scrollY
    // the "hero" is the whole video intro: inside it the nav stays the regular full-width bar
    const heroEnd = () => Math.max(100, (document.getElementById('intro')?.offsetHeight ?? 0) - 90)
    const onScroll = () => {
      const y = scrollY
      const inHero = y <= heroEnd()
      setScrolled(!inHero)
      if (inHero) setHidden(false) // in the hero the nav is always shown
      else if (y > last + 4) setHidden(true) // scrolling down: hide
      else if (y < last - 4) setHidden(false) // scrolling up: show the short pill
      last = y
    }
    const onResize = () => setDesk(innerWidth >= 1024)
    onScroll()
    addEventListener('scroll', onScroll, { passive: true })
    addEventListener('resize', onResize)
    return () => { removeEventListener('scroll', onScroll); removeEventListener('resize', onResize) }
  }, [])

  const light = false // the intro is now a dark video hero, so the nav always uses its light-on-dark variant
  const mo = open && !desk
  const logo = (h: number) => (
    <a href="#intro" aria-label="Cattle Force home" className="cf2n-logo">
      <span style={{ position: 'relative', display: 'block' }}>
        <img src={logoWhite} alt="Cattle Force" style={{ height: h, opacity: light ? 0 : 1 }} />
        <img src={logoBlack} alt="" aria-hidden="true" style={{ height: h, opacity: light ? 1 : 0, position: 'absolute', left: 0, top: 0 }} />
      </span>
    </a>
  )

  const bar = {
    background: scrolled ? 'rgba(10,10,10,0.8)' : 'rgba(10,10,10,0)',
    backdropFilter: scrolled ? 'blur(10px)' : 'none',
    WebkitBackdropFilter: scrolled ? 'blur(10px)' : 'none',
    boxShadow: scrolled ? SHADOW : 'none',
    transform: scrolled ? 'translateY(20px)' : 'translateY(0px)',
  }

  return (
    <header className="cf2n" style={{ transform: hidden && !open ? 'translateY(-140%)' : 'none', transition: 'transform .45s cubic-bezier(.22,.8,.3,1)' }}>
      {desk ? (
        <div className="cf2n-bar" style={{ ...bar, width: scrolled ? '52%' : '100%' }}>
          <span className={`cf2n-aurora${scrolled ? ' on' : ''}`} aria-hidden="true" />
          {logo(35.7)}
          <div className="cf2n-links" onMouseLeave={() => setHov(null)}>
            {NAV.map(([label, href], i) => (
              <a key={href} href={href} onMouseEnter={() => setHov(i)} style={{ color: light ? '#262524' : '#d4d4d4' }}>
                <span aria-hidden="true" style={{ background: light ? 'rgba(15,14,13,0.06)' : '#262626', opacity: hov === i ? 1 : 0 }} />
                <span style={{ position: 'relative', zIndex: 20 }}>{label}</span>
              </a>
            ))}
          </div>
          <div className="cf2n-actions">
            <a href={`${APP_URL}/login?fresh=1`} className="cf2n-login" style={{ color: light ? '#0f0e0d' : '#ffffff' }}>Login</a>
            <a href="#demo" className="cf2n-cta" style={{ background: light ? '#0f0e0d' : '#ffffff', color: light ? '#ffffff' : '#000000' }}>Contact Us</a>
          </div>
        </div>
      ) : (
        <div className="cf2n-mbar" style={{ ...bar, width: scrolled ? '90%' : '100%', padding: `12px ${scrolled ? '12px' : '0px'}`, borderRadius: scrolled ? '4px' : '2rem' }}>
          <span className={`cf2n-aurora${scrolled ? ' on' : ''}`} aria-hidden="true" />
          <div className="cf2n-mrow">
            {logo(31.5)}
            <button aria-label={mo ? 'Close menu' : 'Open menu'} aria-expanded={mo} onClick={() => setOpen(v => !v)} style={{ color: light ? '#0f0e0d' : '#ffffff' }}>
              {mo
                ? <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
                : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>}
            </button>
          </div>
          <div className="cf2n-panel" style={{ opacity: mo ? 1 : 0, pointerEvents: mo ? 'auto' : 'none' }}>
            {NAV.map(([label, href]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
            <div>
              <a href={`${APP_URL}/login?fresh=1`} onClick={() => setOpen(false)}>Login</a>
              <a href="#demo" onClick={() => setOpen(false)}>Contact Us</a>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

/* ── White intro with the two CTAs ──────────────────────── */

const mag = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget, b = el.getBoundingClientRect()
  el.style.transform = `translate(${((e.clientX - b.left - b.width / 2) * 0.22).toFixed(1)}px, ${((e.clientY - b.top - b.height / 2) * 0.3).toFixed(1)}px)`
}
const magOut = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.transform = 'translate(0,0)' }

export function Intro() {
  // after the video has played and frozen on its last frame, a soft blurred tint fades in so the copy stays readable
  const [tinted, setTinted] = useState(() => !!(window as unknown as { __cfHeroEnded?: boolean }).__cfHeroEnded)
  useEffect(() => {
    const on = () => setTinted(true)
    window.addEventListener('cf:hero-ended', on)
    return () => window.removeEventListener('cf:hero-ended', on)
  }, [])
  return (
    <section id="intro" className="cf2i">
      <HeroFrames />
      <div className="cf2i-shade" aria-hidden="true" />
      <div className={`cf2i-tint${tinted ? ' on' : ''}`} aria-hidden="true" />
      <RippleLayer rgb="104,198,164" maxA={0.38} />
      <div className="cf2i-content">
        <h1 className="cf2i-h1">The operating system for<br /><em>modern cattle farms.</em></h1>
        <p className="cf2i-sub">A complete cattle management system built to track every animal,<br />every event, and every outcome.</p>
        <div className="cf2i-row">
          <a href="#demo" className="cf2i-primary" onMouseMove={mag} onMouseLeave={magOut}>
            <span>Book a demo</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
          </a>
          <button className="cf2i-secondary" onMouseMove={mag} onMouseLeave={magOut} onClick={() => window.dispatchEvent(new Event('cf:story'))}>
            <span>See how it works</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
          </button>
        </div>
        <div className="cf2i-trust">
          <p className="cf2i-trust-label">Trusted by high-volume cattle operations across the Americas, Europe, and Asia</p>
          <div className="cf2i-logos">
            {[['◆', 'Alta Terra'], ['⊕', 'Pampa Group'], ['✸', 'Hacienda la Esmeralda'], ['◎', 'Lakewood Farms']].map(([icon, name]) => (
              <span key={name}><i aria-hidden="true">{icon}</i>{name}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── 56px grid paper with a hover-cell highlight ────────── */

export function GridBackdrop({ mask, bg }: { mask: string; bg: string }) {
  const cvRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = cvRef.current!, ctx = cv.getContext('2d')!, sec = cv.closest('section')!
    const S = 35.7
    let cx: number | null = null, cy: number | null = null, raf = 0, dirty = true
    const size = () => {
      const r = cv.getBoundingClientRect(), d = Math.min(2, devicePixelRatio || 1)
      cv.width = Math.round(r.width * d); cv.height = Math.round(r.height * d)
      ctx.setTransform(d, 0, 0, d, 0, 0); dirty = true
    }
    const draw = () => {
      raf = requestAnimationFrame(draw)
      if (!dirty) return
      dirty = false
      const rc = cv.getBoundingClientRect()
      if (rc.bottom < 0 || rc.top > innerHeight) { dirty = true; return }
      const w = rc.width, h = rc.height
      ctx.clearRect(0, 0, w, h)
      const oy = (((rc.top + scrollY) % S) + S) % S, ox = (((rc.left + scrollX) % S) + S) % S
      const y0 = -oy, x0 = -ox
      const inR = cx != null && cy != null && cx >= rc.left && cx <= rc.right && cy >= rc.top && cy <= rc.bottom
      if (inR) {
        const hc = Math.floor((cx! - rc.left - x0) / S), hr = Math.floor((cy! - rc.top - y0) / S)
        ctx.fillStyle = 'rgba(0,81,72,0.16)'; ctx.fillRect(x0 + hc * S + 1, y0 + hr * S + 1, S - 1, S - 1)
      }
      ctx.strokeStyle = 'rgba(32,30,29,0.08)'; ctx.lineWidth = 1; ctx.beginPath()
      for (let x = x0; x <= w + S; x += S) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h) }
      for (let y = y0; y <= h + S; y += S) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5) }
      ctx.stroke()
    }
    const mark = () => { dirty = true }
    const onMove = (e: MouseEvent) => { cx = e.clientX; cy = e.clientY; dirty = true }
    const onLeave = () => { cx = cy = null; dirty = true }
    size()
    const ro = new ResizeObserver(size); ro.observe(cv)
    sec.addEventListener('mousemove', onMove); sec.addEventListener('mouseleave', onLeave)
    addEventListener('scroll', mark, { passive: true })
    raf = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); sec.removeEventListener('mousemove', onMove); sec.removeEventListener('mouseleave', onLeave); removeEventListener('scroll', mark) }
  }, [])
  const m = `radial-gradient(${mask}, #000 35%, transparent 100%)`
  return (
    <div data-bg="1" aria-hidden="true" className="cf2-bg" style={{ background: bg }}>
      <canvas ref={cvRef} style={{ WebkitMaskImage: m, maskImage: m }} />
      <RippleLayer rgb="0,81,72" maxA={0.45} />
    </div>
  )
}

/* ── Page-wide effects: ripple, glows ── */

export function Effects() {
  const glowRef = useRef<HTMLDivElement>(null)
  const dgRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element).closest?.('a[href^="#"]')
      if (!a || e.metaKey || e.ctrlKey) return
      const id = a.getAttribute('href')!.slice(1)
      const t = id && document.getElementById(id)
      if (!t) return
      e.preventDefault()
      // plain smooth scroll, landing exactly on the section's top edge (so its full background is in view)
      window.scrollTo({ top: Math.max(0, t.getBoundingClientRect().top + scrollY), behavior: 'smooth' })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    let raf = 0, dirty = true, gB: { a: number[]; p: number[]; ph: number }[] | null = null
    let gAY = 0, gLY = 0
    const g = glowRef.current!, cv = dgRef.current!

    const onDown = (e: PointerEvent) => {
      const t = e.target as Element
      if (t.closest?.('input,textarea,select,a,button,[role="button"],[role="tab"],[role="radio"],label')) return
      const fx = !!t.closest?.('#top, header')
      ripStore.list.push({ x: e.clientX, y: fx ? e.clientY : e.clientY + scrollY, fixed: fx, t: performance.now() / 1000 })
    }
    document.addEventListener('pointerdown', onDown)

    const drawRipple = (n: number) => {
      const W = innerWidth, H = innerHeight, d = Math.min(2, devicePixelRatio || 1), sy = scrollY
      const reach = (q: Rip) => Math.hypot(Math.max(q.x, W - q.x), Math.max(Math.abs((q.fixed ? q.y + sy : q.y) - sy), Math.abs((q.fixed ? q.y + sy : q.y) - sy - H))) / RIP_S + 3
      ripStore.list = ripStore.list.filter(q => (n - q.t) * RIP_SPD < reach(q))
      if (!ripStore.list.length) { if (dirty) { cv.getContext('2d')!.clearRect(0, 0, cv.width, cv.height); dirty = false } return }
      if (cv.width !== Math.round(W * d) || cv.height !== Math.round(H * d)) { cv.width = Math.round(W * d); cv.height = Math.round(H * d) }
      const ctx = cv.getContext('2d')!
      ctx.setTransform(d, 0, 0, d, 0, 0); ctx.clearRect(0, 0, W, H); dirty = true
      paintRipples(ctx, W, H, 0, 0, n, '104,198,164', 0.38)
    }

    const glow = (n: number) => {
      const m = document.getElementById('manifesto')
      if (!m) return
      const W = innerWidth, H = innerHeight, sy = scrollY
      const vis = clamp((H * 0.7 - m.getBoundingClientRect().top) / (H * 0.5))
      g.style.opacity = vis.toFixed(3)
      if (vis <= 0 && gB) return
      if (!gB) {
        gB = [[0.28, 0.35], [0.7, 0.62]].map((a, k) => ({ a, p: [a[0] * W, a[1] * H], ph: k * 2.1 }))
        gAY = sy; gLY = sy
      }
      const dy = sy - gLY; gLY = sy
      if (Math.abs(sy - gAY) > H * 0.45) {
        gAY = sy
        gB.forEach(b => {
          let nx: number, ny: number
          do { nx = 0.1 + Math.random() * 0.8; ny = 0.12 + Math.random() * 0.76 } while (Math.hypot(nx - b.a[0], ny - b.a[1]) < 0.25)
          b.a = [nx, ny]
        })
      }
      gB.forEach((b, k) => {
        const tx = (b.a[0] + Math.sin(n * (0.21 + k * 0.04) + b.ph) * 0.1 + Math.sin(n * 0.11 + b.ph * 1.7) * 0.05) * W
        const ty = (b.a[1] + Math.cos(n * (0.17 + k * 0.05) + b.ph) * 0.09 + Math.cos(n * 0.07 + b.ph) * 0.04) * H
        b.p[1] -= dy * (0.18 + k * 0.06)
        b.p[0] += (tx - b.p[0]) * (0.02 + k * 0.004); b.p[1] += (ty - b.p[1]) * (0.02 + k * 0.004)
        b.p[0] = clamp(b.p[0], 0, W); b.p[1] = clamp(b.p[1], 0, H)
        const el = g.children[k] as HTMLElement | undefined
        if (el) el.style.transform = `translate(${b.p[0].toFixed(1)}px,${b.p[1].toFixed(1)}px) translate(-50%,-50%)`
      })
    }

    const loop = (ms: number) => {
      raf = requestAnimationFrame(loop)
      // while the hero video is still playing, keep the main thread free for it (nothing to draw yet anyway)
      if (!(window as unknown as { __cfHeroEnded?: boolean }).__cfHeroEnded && !ripStore.list.length && scrollY < 4) return
      const n = ms / 1000; glow(n); drawRipple(n)
    }
    raf = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('pointerdown', onDown) }
  }, [])

  return (
    <>
      <div ref={glowRef} aria-hidden="true" className="cf2g">
        <div /><div />
      </div>
      <canvas ref={dgRef} aria-hidden="true" className="cf2r" />
    </>
  )
}
