import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALERT, BYST, DOTS, MILK, N, NEXT, PED, PEDSLOT, RED, REL, SIG, SLOW, STG, VIEWS,
  baseW, clamp, computeLayout, eIO, fmtAge, type Layout,
} from './herd'

const Label = ({ children, color = '#68c6a4' }: { children: React.ReactNode; color?: string }) => (
  <span className="cf2s-label"><span aria-hidden="true" style={{ background: color }} />{children}</span>
)

interface Rec {
  tag: string; acc: string; bd: string; badge: string; footC: string; spark: boolean
  bars: { h: string; c: string }[]; prog: string; mode: string; f: { k: string; v: string }[]; foot: string
}

interface UI { ready: boolean; narrow: boolean; p: number; now: number; sel: number; hov: boolean; stg: number; selT: number }

export default function Story() {
  const secRef = useRef<HTMLElement>(null)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const [ui, setUi] = useState<UI>({ ready: false, narrow: false, p: 0, now: 0, sel: 0, hov: false, stg: 0, selT: 0 })
  const selT = useRef(0)
  // the dot animation waits until the hero video has finished playing (and frozen on its last frame), so it can't steal frames from it.
  // A safety timeout means it can never stay blocked.
  const [heroReady, setHeroReady] = useState(() => !!(window as unknown as { __cfHeroEnded?: boolean }).__cfHeroEnded)
  useEffect(() => {
    if (heroReady) return
    const on = () => setHeroReady(true)
    window.addEventListener('cf:hero-ended', on)
    const t = window.setTimeout(on, 9000)
    return () => { window.removeEventListener('cf:hero-ended', on); clearTimeout(t) }
  }, [heroReady])

  useEffect(() => {
    if (!heroReady) return
    const cv = cvRef.current!
    const ctx = cv.getContext('2d')!
    let lay: Layout | null = null
    let W = 0, H = 0
    let p = 0, mx = -9999, my = -9999
    let t0 = 1e9, ready = false, fontsOK = false, goQ = false
    let lastStg = -1, selStart = 0, cyc = 0, lastSet = 0, raf = 0
    let state: UI = { ready: false, narrow: false, p: 0, now: 0, sel: 0, hov: false, stg: 0, selT: 0 }
    const cur = new Float32Array(N * 2)

    const push = (patch: Partial<UI>) => { state = { ...state, ...patch }; setUi(state) }

    const resize = () => {
      W = cv.clientWidth; H = cv.clientHeight
      const dpr = Math.min(2, devicePixelRatio || 1)
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      lay = computeLayout(W, H)
      const nar = W < 820
      if (nar !== state.narrow) push({ narrow: nar })
    }
    resize()
    DOTS.forEach(d => { d.x = d.sx * W; d.y = d.sy * H; d.vx = 0; d.vy = 0 })

    const onMove = (e: MouseEvent) => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top }
    const onOut = () => { mx = my = -9999 }

    const go = () => { t0 = performance.now() / 1000; selT.current = t0 + 2.2; ready = true; push({ ready: true }) }
    const goMaybe = () => {
      if (ready || !fontsOK || goQ) return
      const el = secRef.current
      if (el && el.getBoundingClientRect().top < innerHeight * 0.5) { goQ = true; requestAnimationFrame(go) }
    }
    const onScroll = () => {
      const el = secRef.current
      if (!el) return
      p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight))
      goMaybe()
      push({ p })
    }
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => { fontsOK = true; goMaybe() })

    const pick = (stg: number) => {
      cyc++
      if (stg === 1) { const l = BYST[cyc % 5]; return l[Math.floor(Math.random() * l.length)] }
      if (stg === 2) return SLOW[cyc % SLOW.length]
      if (stg === 3) return PED[cyc % 7]
      if (stg === 4) return ALERT
      return Math.floor(Math.random() * N)
    }

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      const n = ms / 1000
      const sec = secRef.current
      if (!lay || !sec) return
      const sr = sec.getBoundingClientRect()
      if (sr.bottom < 0 || sr.top > innerHeight) return // off-screen: don't spend the main thread (keeps the hero video smooth)
      const { L, lab: lb, SQ, SZ } = lay
      const s = p * 4, a = Math.min(3, Math.floor(s)), t = clamp((s - a - 0.15) / 0.7)
      const wk = (k: number) => clamp(1 - Math.abs(s - k) * 2.2)
      const w1 = wk(1), w2 = wk(2), w3 = wk(3), w4 = wk(4)
      const R = 110, stiff = 0.014 + 0.07 * clamp(s), damp = 0.9 - 0.12 * clamp(s)
      ctx.clearRect(0, 0, W, H)
      const mono = '500 10px "Geist Mono", monospace'

      if (w1 > 0.01) {
        STG.forEach((g, si) => {
          const x = lb.sx[si], top = lb.base - Math.ceil(g[2] / lb.u) * lb.s2
          ctx.fillStyle = `rgba(243,242,242,${0.6 * w1})`; ctx.font = mono; ctx.fillText(g[0].toUpperCase(), x, lb.base + 18)
          ctx.fillStyle = `rgba(243,242,242,${w1})`; ctx.font = '400 26px "Instrument Serif", serif'
          ctx.fillText(String(Math.round(g[2] * clamp(w1 * 1.4))), x, top - 10)
        })
      }
      if (w2 > 0.01) {
        const X = (m: number) => lb.gL + (m / 96) * lb.gw, Y = (kg: number) => lb.gB - (kg / 900) * lb.gh
        ctx.strokeStyle = `rgba(243,242,242,${0.07 * w2})`; ctx.lineWidth = 1; ctx.beginPath()
        ;[300, 600, 900].forEach(kg => { ctx.moveTo(lb.gL, Y(kg)); ctx.lineTo(lb.gL + lb.gw, Y(kg)) }); ctx.stroke()
        ctx.strokeStyle = `rgba(243,242,242,${0.35 * w2})`; ctx.beginPath()
        ctx.moveTo(lb.gL, lb.gB - lb.gh); ctx.lineTo(lb.gL, lb.gB); ctx.lineTo(lb.gL + lb.gw, lb.gB); ctx.stroke()
        ctx.fillStyle = `rgba(243,242,242,${0.55 * w2})`; ctx.font = mono; ctx.textAlign = 'center'
        ;[0, 2, 4, 6, 8].forEach(y => ctx.fillText(y + 'Y', X(y * 12), lb.gB + 16))
        ctx.textAlign = 'right'
        ;[0, 300, 600, 900].forEach(kg => ctx.fillText(kg + '', lb.gL - 8, Y(kg) + 3)); ctx.textAlign = 'left'
        const mm = 96 * clamp(w2 * 1.3 - 0.15)
        ctx.strokeStyle = `rgba(104,198,164,${0.9 * w2})`; ctx.lineWidth = 1.5; ctx.beginPath()
        for (let m = 0; m <= mm; m++) { const yy = Y(baseW(m)); if (m) ctx.lineTo(X(m), yy); else ctx.moveTo(X(m), yy) }
        ctx.stroke()
        ctx.fillStyle = `rgba(104,198,164,${w2})`; ctx.fillText('EXPECTED GROWTH', X(mm) - 110, Y(baseW(mm)) - 12)
        ctx.textAlign = 'right'; ctx.fillStyle = `rgba(243,242,242,${0.8 * w2})`
        ctx.fillText(SLOW.length + ' BELOW THE CURVE', lb.gL + lb.gw, lb.gB - lb.gh + 4); ctx.textAlign = 'left'
      }

      const La = L[a], Lb = L[a + 1], act0 = n - t0
      for (let i = 0; i < N; i++) {
        const d = DOTS[i], k = eIO(clamp(t * 1.7 - d.delay * 0.7))
        let tx = La[i * 2] + (Lb[i * 2] - La[i * 2]) * k, ty = La[i * 2 + 1] + (Lb[i * 2 + 1] - La[i * 2 + 1]) * k
        if (a === 0) {
          const wv = 1 - k
          tx += (Math.sin(n * 0.35 + d.ph) * 6 + Math.sin(n * 0.12 + d.cl * 1.7) * 16) * wv
          ty += (Math.cos(n * 0.27 + d.ph * 1.3) * 4 + Math.cos(n * 0.09 + d.cl) * 8) * wv
        }
        const act = clamp((act0 - d.delay * 1.3) / 1.1)
        let ax = (tx - d.x) * stiff * act, ay = (ty - d.y) * stiff * act
        if (act < 1) { ax += Math.sin(n * 0.5 + d.ph) * 0.02; ay += Math.cos(n * 0.4 + d.ph) * 0.02 }
        const dx = d.x - mx, dy = d.y - my, dd = dx * dx + dy * dy
        if (dd < R * R && dd > 0.01) { const dist = Math.sqrt(dd), f = (1 - dist / R) * 1.5; ax += (dx / dist) * f; ay += (dy / dist) * f }
        d.vx = (d.vx + ax) * damp; d.vy = (d.vy + ay) * damp; d.x += d.vx; d.y += d.vy
        cur[i * 2] = d.x; cur[i * 2 + 1] = d.y
      }

      if (w3 > 0.01) {
        ctx.strokeStyle = `rgba(243,242,242,${0.06 * w3})`; ctx.lineWidth = 1
        for (let k = 1; k <= 8; k++) { ctx.beginPath(); ctx.arc(lb.pcx, lb.pcy, lb.ring(k), 0, Math.PI * 2); ctx.stroke() }
        ctx.fillStyle = `rgba(243,242,242,${0.5 * w3})`; ctx.font = mono; ctx.textAlign = 'center'
        ;['PARENTS', 'GRANDPARENTS', 'GREAT-GRANDPARENTS'].forEach((l, k) => ctx.fillText(l, lb.pcx, lb.pcy - lb.ring(k + 1) - 5))
        ctx.textAlign = 'left'
        ctx.strokeStyle = `rgba(243,242,242,${0.16 * w3})`; ctx.beginPath()
        for (let sl = 1; sl < 255; sl++) {
          const P = PED[(sl - 1) >> 1], C = PED[sl], px = cur[P * 2], py = cur[P * 2 + 1], cx2 = cur[C * 2], cy2 = cur[C * 2 + 1]
          const an = Math.atan2(cy2 - lb.pcy, cx2 - lb.pcx), rp = Math.hypot(px - lb.pcx, py - lb.pcy)
          ctx.moveTo(px, py); ctx.quadraticCurveTo(lb.pcx + Math.cos(an) * rp, lb.pcy + Math.sin(an) * rp, cx2, cy2)
        }
        ctx.stroke()
      }

      const scanY = lb.gy0 - lb.gs / 2 + ((n * 0.3) % 1) * lb.gH
      if (w4 > 0.01) { ctx.fillStyle = `rgba(104,198,164,${0.45 * w4})`; ctx.fillRect(lb.gx0 - lb.gs, scanY, lb.gW + lb.gs, 1) }
      const sz = SZ[a] + (SZ[a + 1] - SZ[a]) * t, selNow = state.sel, selSlot = PEDSLOT[selNow]
      for (let i = 0; i < N; i++) {
        const d = DOTS[i], x = cur[i * 2], y = cur[i * 2 + 1], act = clamp((act0 - d.delay * 1.3) / 1.1)
        const sp = Math.min(1, Math.hypot(d.vx, d.vy) / 3) * act * (1 - clamp(s) * 0.7)
        let r = 243, g = 242, b = 242, al = (0.12 + act * 0.72) * (0.6 + d.z * 0.3)
        const mix = (C: number[], k: number) => { r += (C[0] - r) * k; g += (C[1] - g) * k; b += (C[2] - b) * k }
        mix(SIG, sp)
        if (w2 > 0) { if (d.slow) { mix(SIG, w2); al += (1 - al) * w2 } else al -= 0.35 * w2 }
        if (w3 > 0) { const sl = PEDSLOT[i]; if (sl >= 511) al -= 0.6 * w3; else if (sl < 3) { mix(SIG, w3); al += (1 - al) * w3 } }
        if (w4 > 0) {
          if (i === ALERT) { mix(RED, w4); al += (1 - al) * w4 }
          else { const f = clamp(1 - Math.abs(y - scanY) / (lb.gs * 1.5)); al -= (al - 0.12 - f * 0.4) * w4 }
          if (i >= SQ) al *= 1 - w4
        }
        const z = (i === ALERT ? sz * (1 + w4 * 1.2) : sz) * (0.7 + d.z * 0.4)
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${clamp(al).toFixed(3)})`
        ctx.fillRect(x - z / 2, y - z / 2, z, z)
      }
      if (w3 > 0.01 && selSlot < 511) {
        ctx.strokeStyle = `rgba(104,198,164,${0.9 * w3})`; ctx.lineWidth = 1.5; ctx.beginPath()
        let sl = selSlot
        ctx.moveTo(cur[PED[sl] * 2], cur[PED[sl] * 2 + 1])
        while (sl > 0) { sl = (sl - 1) >> 1; ctx.lineTo(cur[PED[sl] * 2], cur[PED[sl] * 2 + 1]) }
        ctx.stroke()
      }
      if (w4 > 0.01) {
        const x = cur[ALERT * 2], y = cur[ALERT * 2 + 1]
        for (let k = 0; k < 3; k++) {
          const ph = ((n + k * 0.55) % 1.65) / 1.65, rr = 6 + ph * 34
          ctx.strokeStyle = `rgba(236,48,19,${(1 - ph) * 0.9 * w4})`; ctx.lineWidth = 1.2
          ctx.strokeRect(x - rr, y - rr, rr * 2, rr * 2)
        }
      }

      let near = -1, nd = 16 * 16
      if (mx > -999) {
        for (let i = 0; i < N; i++) {
          const dx = cur[i * 2] - mx, dy = cur[i * 2 + 1] - my, dd = dx * dx + dy * dy
          if (dd < nd) { nd = dd; near = i }
        }
      }
      const stg = Math.round(s), hov = near >= 0
      let sel = selNow
      if (stg !== lastStg) { lastStg = stg; selT.current = 0 }
      if (hov) { sel = near; selT.current = n + 1.2; if (near !== selNow) selStart = n }
      else if (n > selT.current && n > t0 + 2) { sel = pick(stg); selT.current = n + (stg === 4 ? 1e6 : 2.8); selStart = n }
      const d = DOTS[sel]
      if (d && n > t0 + 1.8) {
        const red = sel === ALERT && w4 > 0.5, col = red ? '236,48,19' : '104,198,164'
        const x = cur[sel * 2], y = cur[sel * 2 + 1], pulse = (n * 0.9) % 1, rr = 7 + pulse * 18
        if (!red) { ctx.strokeStyle = `rgba(${col},${0.9 * (1 - pulse)})`; ctx.lineWidth = 1; ctx.strokeRect(x - rr, y - rr, rr * 2, rr * 2) }
        ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = 1.5; ctx.strokeRect(x - 7, y - 7, 14, 14)
        const card = cardRef.current
        if (card && !state.narrow) {
          const cr = cv.getBoundingClientRect(), bb = card.getBoundingClientRect()
          const ex = bb.left - cr.left, ey = bb.top - cr.top + 44, k = eIO(clamp((n - selStart) / 0.6))
          ctx.strokeStyle = `rgba(${col},0.6)`; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x + 7, y)
          const mxp = x + 7 + (ex - x - 7) * k
          ctx.lineTo(mxp, y); ctx.lineTo(mxp, y + (ey - y) * k); ctx.stroke(); ctx.setLineDash([])
        }
      }

      // sliding chapter-rail indicator
      const rn = railRef.current
      if (rn) {
        const ind = rn.querySelector<HTMLElement>('[data-rail-ind]'), bs = rn.querySelectorAll<HTMLElement>('button')
        if (ind && bs.length) {
          const ss = clamp(p) * (bs.length - 1), i = Math.min(bs.length - 2, Math.floor(ss)), tt = ss - i
          const A = bs[i], B = bs[i + 1] || A
          const x = A.offsetLeft + (B.offsetLeft - A.offsetLeft) * tt, w = A.offsetWidth + (B.offsetWidth - A.offsetWidth) * tt
          const y = A.offsetTop + (B.offsetTop - A.offsetTop) * tt
          ind.style.transform = `translate(${x.toFixed(1)}px,${(y - 5).toFixed(1)}px)`
          ind.style.width = w.toFixed(1) + 'px'
        }
      }

      if (sel !== selNow || hov !== state.hov || stg !== state.stg || n - lastSet > 0.05) {
        lastSet = n
        push({ sel, hov, stg, now: n, selT: selT.current })
      }
    }
    raf = requestAnimationFrame(frame)

    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    window.addEventListener('mousemove', onMove)
    document.addEventListener('mouseleave', onOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onOut)
      window.removeEventListener('scroll', onScroll)
    }
  }, [heroReady])

  // ── stepped scrolling: one scroll / swipe moves exactly one chapter, then the view holds ──
  const step = useRef({ raf: 0, lockUntil: 0, busy: false })

  const chapterY = (c: number) => {
    const el = secRef.current!
    return el.getBoundingClientRect().top + scrollY + (c / 4) * (el.offsetHeight - innerHeight) + 1
  }

  // animate the page scroll to a chapter. soft = the gentle ease-out used when the page settles after normal scrolling.
  const goCh = useCallback((c: number, soft = false) => {
    const el = secRef.current
    if (!el) return
    cancelAnimationFrame(step.current.raf)
    const from = scrollY, to = chapterY(c), dist = Math.abs(to - from)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduce ? 1 : soft ? Math.max(450, Math.min(950, (dist / innerHeight) * 800)) : Math.max(650, Math.min(1100, (dist / innerHeight) * 850))
    const t0 = performance.now()
    step.current.busy = true
    step.current.lockUntil = t0 + dur + (soft ? 150 : 650) // short hold after arriving so the chapter can be seen before the next move
    const ease = soft ? (t: number) => -(Math.cos(Math.PI * t) - 1) / 2 : (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      window.scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' as ScrollBehavior })
      if (k < 1) step.current.raf = requestAnimationFrame(tick)
      else step.current.busy = false
    }
    step.current.raf = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    const stepState = step.current
    const pinned = () => {
      const el = secRef.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      return r.top <= 1 && r.bottom >= innerHeight - 1
    }
    const current = () => {
      const el = secRef.current!
      const p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight))
      return Math.round(p * 4)
    }
    let wasPinned = false
    const locked = () => performance.now() < step.current.lockUntil

    // returns the chapter to move to for a scroll direction (+1 down / -1 up), or null to let the page scroll normally
    const decide = (dir: number) => {
      if (!pinned()) { wasPinned = false; return null }
      if (!wasPinned) {
        wasPinned = true
        // just arrived (e.g. with scroll momentum) and not resting on a chapter yet: settle on the nearest one first, don't skip any
        if (Math.abs(scrollY - chapterY(current())) > 12) return { settle: current() }
      }
      const t = current() + dir
      return t < 0 || t > 4 ? null : { settle: t }
    }

    // desktop / trackpad: scroll normally. When scrolling stops, ease into the chapter you were heading to and hold there.
    let rest = 0, idle = 0
    const settle = () => {
      if (!pinned() || step.current.busy || locked()) return
      const el = secRef.current!
      const sPos = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - innerHeight)) * 4
      const delta = sPos - rest
      // any real scroll (even one wheel notch) moves at least one chapter in that direction; a long flick lands on the nearest chapter
      const moved = Math.abs(delta) > 0.04 ? (delta > 0 ? Math.max(rest + 1, Math.round(sPos)) : Math.min(rest - 1, Math.round(sPos))) : rest
      const target = Math.max(0, Math.min(4, moved))
      rest = target
      if (Math.abs(scrollY - chapterY(target)) > 2) goCh(target, true)
    }
    const onScrollIdle = () => {
      if (!pinned()) { wasPinned = false; return }
      if (!wasPinned) { wasPinned = true; rest = current() }
      if (step.current.busy) return
      clearTimeout(idle)
      idle = window.setTimeout(settle, 200)
    }

    // touch: one swipe = one chapter
    let y0 = 0, stepped = false, claim = false
    const onTouchStart = (e: TouchEvent) => { y0 = e.touches[0].clientY; stepped = false; claim = false }
    const onTouchMove = (e: TouchEvent) => {
      if (!pinned()) { wasPinned = false; return }
      const dy = y0 - e.touches[0].clientY // > 0: finger moved up = scrolling down
      if (!claim) {
        if (Math.abs(dy) < 4) return
        const dir = dy > 0 ? 1 : -1
        const t = current() + dir
        if (!locked() && (t < 0 || t > 4) && wasPinned) return // at the very start/end: let the page scroll on normally
        claim = true
      }
      e.preventDefault() // we own this gesture: the page must not scroll on its own
      if (stepped || locked() || Math.abs(dy) < 22) return
      const d = decide(dy > 0 ? 1 : -1)
      stepped = true
      if (d) goCh(d.settle)
    }
    const onScrollState = () => { if (!pinned()) wasPinned = false }

    window.addEventListener('scroll', onScrollIdle, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('scroll', onScrollState, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScrollIdle); clearTimeout(idle)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('scroll', onScrollState)
      cancelAnimationFrame(stepState.raf)
    }
  }, [goCh])

  // expose "go to story" for the intro button
  useEffect(() => {
    const h = () => goCh(0)
    window.addEventListener('cf:story', h)
    return () => window.removeEventListener('cf:story', h)
  }, [goCh])

  const { ready, narrow, p, now, sel, hov, stg, selT: selTime } = ui
  const s = p * 4
  const ch = (c: number) => {
    const o = clamp(1 - Math.abs(s - c) * 2.6 + 0.3)
    // phones: text is anchored near the top (no vertical centring) so the animation can sit higher and fully on screen
    return { opacity: o.toFixed(3), transform: narrow ? `translate3d(0, ${((c - s) * 60).toFixed(1)}px, 0)` : `translate3d(0, calc(-50% + ${((c - s) * 90).toFixed(1)}px), 0)`, pointerEvents: (o > 0.5 ? 'auto' : 'none') as 'auto' | 'none' }
  }
  const act = Math.round(s)
  const inO = ready ? 1 : 0

  const rec: Rec = (() => {
    const d = DOTS[sel], red = '#ec3013'
    const prog = hov ? '100%' : (clamp(1 - (selTime - now) / 2.8) * 100).toFixed(1) + '%'
    const base = { tag: d.tag, acc: '#68c6a4', bd: 'rgba(243,242,242,0.16)', badge: 'Live', footC: '#adcfc5', spark: false, bars: [] as { h: string; c: string }[], prog }
    const adg = ((d.w - 35) / Math.max(1, d.age * 30.4)).toFixed(2)
    if (stg === 4 && sel === ALERT && !hov) {
      return { ...base, mode: 'Alert · 06:10', badge: 'Watch', acc: red, bd: 'rgba(236,48,19,0.6)', prog: '100%', spark: true,
        f: [{ k: 'Yield today', v: '12.5 L' }, { k: '7-day average', v: '14.2 L' }, { k: 'Lactation', v: '3rd' }, { k: 'Group', v: '3 · Paddock B' }],
        bars: MILK.map((m, i) => ({ h: (((m - 11.5) / 3.4) * 100).toFixed(0) + '%', c: i >= 10 ? red : 'rgba(243,242,242,0.6)' })),
        foot: 'Milk yield down 12%. Check before evening milking.', footC: '#ff9a80' }
    }
    if (stg === 2 && !hov) {
      return { ...base, mode: 'Growth', badge: d.slow ? 'Below curve' : 'On track',
        f: [{ k: 'Age', v: fmtAge(d.age) }, { k: 'Weight', v: Math.round(d.w) + ' kg' }, { k: 'Daily gain', v: adg + ' kg' }, { k: 'vs curve', v: (d.dev > 0 ? '+' : '') + d.dev.toFixed(0) + '%' }],
        foot: d.slow ? 'Flagged for a feed and health check.' : 'Growing in line with the herd.' }
    }
    if (stg === 3 && !hov) {
      const sl = PEDSLOT[sel]
      return { ...base, mode: 'Lineage · ' + (sl < 7 ? REL[sl] : 'Ancestor'),
        f: [{ k: 'Breed', v: d.breed }, { k: 'Generation', v: sl === 0 ? 'Subject' : String(31 - Math.clz32(sl + 1)) }, { k: 'Sex', v: sl === 0 || sl % 2 === 1 ? 'Female' : 'Male' }, { k: 'Age', v: fmtAge(d.age) }],
        foot: sl === 0 ? 'Dam IN-' + (1000 + PED[1]) + ' · Sire IN-' + (1000 + PED[2]) : REL[Math.min(sl, 6)] + ' of IN-1042' }
    }
    if (stg === 1 && !hov) {
      return { ...base, mode: 'Lifecycle · ' + STG[d.st][0],
        f: [{ k: 'Breed', v: d.breed }, { k: 'Stage', v: STG[d.st][1] }, { k: 'Age', v: fmtAge(d.age) }, { k: 'Weight', v: Math.round(d.w) + ' kg' }],
        foot: 'Next: ' + NEXT[d.st] }
    }
    return { ...base, mode: hov ? 'Under cursor' : 'Tagging',
      f: [{ k: 'Breed', v: d.breed }, { k: 'Stage', v: STG[d.st][1] }, { k: 'Age', v: fmtAge(d.age) }, { k: 'Weight', v: Math.round(d.w) + ' kg' }],
      foot: 'Last: ' + d.ev }
  })()

  const c0 = ch(0)
  const rail = VIEWS.map((l, c) => {
    const on = c === act, k = clamp(1 - Math.abs(s - c)), L = (a: number, b: number) => Math.round(a + (b - a) * k)
    return { n: '0' + c, label: l, cur: on ? 'step' as const : undefined, color: `rgba(${L(243, 15)},${L(242, 14)},${L(242, 13)},${(0.62 + 0.38 * k).toFixed(3)})`, fw: k > 0.5 ? 700 : 500, no: (0.5 + 0.1 * k).toFixed(2), c }
  })

  return (
    <section id="top" ref={secRef} className="cf2s" style={{ height: '600vh' }}>
      <div className="cf2s-stick">
        <canvas ref={cvRef} className="cf2s-canvas" aria-hidden="true" />
        <div className="cf2s-vignette" aria-hidden="true" />

        <div className="cf2s-text" style={{ top: narrow ? '72px' : '0px', height: narrow ? '44vh' : '100vh', width: narrow ? 'calc(100% - 32px)' : 'min(440px, 31vw)' }}>
          <div className="cf2s-c0" style={{ width: narrow ? '100%' : 'min(760px, 52vw)', ...c0, opacity: (Number(c0.opacity) * inO).toFixed(3) }}>
            <h1>Here&apos;s how we make a<br /><em>difference</em></h1>
            <p>For representational purpose, each dot<br />represents a single animal in your herd.</p>
          </div>

          <div className="cf2s-ch" style={ch(1)}>
            <Label>01 — Lifecycle</Label>
            <h2>The herd <em>sorts itself.</em></h2>
            <p>Calves become heifers, heifers become cows, on their own as they age and calve. Weaning comes due on schedule, without anyone keeping count.</p>
          </div>
          <div className="cf2s-ch" style={ch(2)}>
            <Label>02 — Growth</Label>
            <h2>Logging weights gives you <em>insights.</em></h2>
            <p>Log a weight and Cattle Force works out daily gain. Animals falling below the expected curve can be given the right care.</p>
          </div>
          <div className="cf2s-ch" style={ch(3)}>
            <Label>03 — Lineage</Label>
            <h2>Lineage <em>you can see.</em></h2>
            <p>Dam, sire and every generation behind them, one tap from any animal. Breed with the whole family tree in view.</p>
          </div>
          <div className="cf2s-ch" style={ch(4)}>
            <Label color="#ff7a5c">04 — Today</Label>
            <h2>One of them <em style={{ color: '#ff9a80' }}>needs you.</em></h2>
            <p>Cattle Force reads every record and flags alerts that need to be addressed on priority.</p>
            <a href="#demo" className="cf2s-btn">
              <span>Book a demo</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
            </a>
          </div>
        </div>

        <div ref={cardRef} aria-live="polite" className="cf2s-card"
          style={{ borderColor: rec.bd, opacity: inO, transform: ready ? 'none' : 'translateY(30px)' }}>
          <div className="cf2s-card-prog"><span style={{ width: rec.prog, background: rec.acc }} /></div>
          <div className="cf2s-card-body">
            <span className="cf2s-card-top"><span>{rec.mode}</span><span style={{ color: rec.acc }}>● {rec.badge}</span></span>
            <strong>{rec.tag}</strong>
            <div className="cf2s-card-f">
              {rec.f.map(f => <span key={f.k}><span>{f.k}</span><span style={{ color: '#f3f2f2' }}>{f.v}</span></span>)}
            </div>
            {rec.spark && (
              <div className="cf2s-spark">
                {rec.bars.map((b, i) => <span key={i} style={{ height: b.h, background: b.c }} />)}
              </div>
            )}
            <span className="cf2s-card-foot" style={{ color: rec.footC }}>{rec.foot}</span>
          </div>
        </div>

        <div className="cf2s-mini" aria-live="polite" style={{ opacity: inO }}>
          <div className="cf2s-mini-row">
            <strong>{rec.tag}</strong>
            <span style={{ color: rec.acc }}>● {rec.badge}</span>
          </div>
          <p style={{ color: rec.spark ? rec.footC : undefined }}>
            {rec.spark
              ? rec.foot
              : stg === 2
                ? `${rec.f[1].v} · ${rec.f[2].v}/day · ${rec.f[3].v} vs curve`
                : rec.f.slice(1).map(x => x.v).join(' · ')}
          </p>
        </div>

        <nav ref={railRef} aria-label="Chapters" className="cf2s-rail" style={{ opacity: inO }}>
          <span data-rail-ind="1" aria-hidden="true" />
          {rail.map(it => (
            <button key={it.n} aria-current={it.cur} onClick={() => goCh(it.c)} style={{ color: it.color, fontWeight: it.fw }}>
              <span style={{ opacity: it.no }}>{it.n}</span><span>{it.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </section>
  )
}
