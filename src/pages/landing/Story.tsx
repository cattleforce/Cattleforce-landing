import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ALERT, BYST, DOTS, MILK, N, NEXT, PED, PEDSLOT, RED, REL, SIG, SLOW, STG, VIEWS,
  baseW, clamp, computeLayout, eIO, fmtAge, type Layout,
} from './herd'
import { tx, useLang } from '../../i18n'

const Label = ({ children, color = '#68c6a4' }: { children: React.ReactNode; color?: string }) => (
  <span className="cf2s-label"><span aria-hidden="true" style={{ background: color }} />{children}</span>
)

interface Rec {
  tag: string; acc: string; bd: string; badge: string; footC: string; spark: boolean
  bars: { h: string; c: string }[]; prog: string; mode: string; f: { k: string; v: string }[]; foot: string
}

interface UI { ready: boolean; narrow: boolean; p: number; now: number; sel: number; hov: boolean; stg: number; selT: number }

export default function Story() {
  useLang()
  const secRef = useRef<HTMLElement>(null)
  const cvRef = useRef<HTMLCanvasElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const miniRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLElement>(null)
  const [ui, setUi] = useState<UI>({ ready: false, narrow: false, p: 0, now: 0, sel: 0, hov: false, stg: 0, selT: 0 })
  const selT = useRef(0)
  useEffect(() => {
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

    const touchOnly = matchMedia('(pointer: coarse), (max-width: 1023px)').matches
    const onMove = (e: MouseEvent) => { if (touchOnly) return; const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top }
    const onOut = () => { mx = my = -9999 }

    // phones: tap a dot to show that animal (the pointer-hover pick used on desktop doesn't exist on touch screens)
    let tap = { i: -1, stg: -1, until: 0 }
    let tx0 = 0, ty0 = 0, tt0 = 0
    const onTapStart = (e: TouchEvent) => { const t = e.touches[0]; tx0 = t.clientX; ty0 = t.clientY; tt0 = performance.now() }
    const onTapEnd = (e: TouchEvent) => {
      if (!touchOnly || !lay) return
      const t = e.changedTouches[0]
      if (Math.hypot(t.clientX - tx0, t.clientY - ty0) > 10 || performance.now() - tt0 > 450) return // a swipe or long press, not a tap
      if ((e.target as Element).closest?.('.cf2s-rail, .cf2s-mini, a, button')) return
      const sec = secRef.current
      const r = sec?.getBoundingClientRect(), sh = stickRef.current?.offsetHeight ?? innerHeight
      if (!r || r.top > 1 || r.bottom < sh - 1) return // story not on screen
      const cr = cv.getBoundingClientRect(), x = t.clientX - cr.left, y = t.clientY - cr.top
      const stgNow = Math.round(p * 4)
      let best = -1, bd = 30 * 30 // finger-sized hit area
      for (let i = 0; i < N; i++) {
        if (lay.half && (i & 1) && stgNow !== 3) continue // only dots that are actually drawn
        const dx = cur[i * 2] - x, dy = cur[i * 2 + 1] - y, dd = dx * dx + dy * dy
        if (dd < bd) { bd = dd; best = i }
      }
      if (best >= 0) tap = { i: best, stg: stgNow, until: performance.now() / 1000 + 8 }
    }

    const go = () => { t0 = performance.now() / 1000; selT.current = t0 + 2.2; ready = true; push({ ready: true }) }
    const goMaybe = () => {
      if (ready || !fontsOK || goQ) return
      const el = secRef.current
      if (el && el.getBoundingClientRect().top < innerHeight * 0.5) { goQ = true; requestAnimationFrame(go) }
    }
    const onScroll = () => {
      const el = secRef.current
      if (!el) return
      p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - (stickRef.current?.offsetHeight ?? innerHeight)))
      goMaybe()
      push({ p })
    }
    ;(document.fonts?.ready ?? Promise.resolve()).then(() => {
      fontsOK = true; goMaybe()
      // tell the page loader the story animation is prepared (fonts in, canvas laid out)
      ;(window as unknown as { __cfStoryReady?: boolean }).__cfStoryReady = true
      window.dispatchEvent(new Event('cf:story-ready'))
    })

    const pick = (stg: number): number => {
      const one = (): number => {
        cyc++
        if (stg === 1) { const l = BYST[cyc % 5]; return l[Math.floor(Math.random() * l.length)] }
        if (stg === 2) return SLOW[cyc % SLOW.length]
        if (stg === 3) return PED[cyc % 7]
        if (stg === 4) return ALERT
        return Math.floor(Math.random() * N)
      }
      // on phones only every other dot is drawn (except in the lineage view), so only pick drawn ones
      for (let t = 0; t < 12; t++) { const i = one(); if (!lay?.half || stg === 3 || i % 2 === 0) return i }
      return ALERT
    }

    const frame = (ms: number) => {
      raf = requestAnimationFrame(frame)
      const n = ms / 1000
      const sec = secRef.current
      if (!lay || !sec) return
      const sr = sec.getBoundingClientRect()
      if (sr.bottom < 0 || sr.top > innerHeight) return // off-screen: don't spend the main thread (keeps the hero video smooth)
      const { L, lab: lb, SQ, SZ, rankOf, counts, half } = lay
      const s = p * 4, a = Math.min(3, Math.floor(s)), t = clamp((s - a - 0.15) / 0.7)
      const wk = (k: number) => clamp(1 - Math.abs(s - k) * 2.2)
      const w1 = wk(1), w2 = wk(2), w3 = wk(3), w4 = wk(4)
      const stiff = 0.014 + 0.07 * clamp(s), damp = 0.9 - 0.12 * clamp(s)
      ctx.clearRect(0, 0, W, H)
      const mono = '500 10px "Geist Mono", monospace'

      if (w1 > 0.01) {
        STG.forEach((g, si) => {
          const x = lb.sx[si], top = lb.base - Math.ceil(counts[si] / lb.u) * lb.s2
          ctx.fillStyle = `rgba(243,242,242,${0.6 * w1})`; ctx.font = mono; ctx.fillText(tx(g[0]).toUpperCase(), x, lb.base + 18)
          ctx.fillStyle = `rgba(243,242,242,${w1})`; ctx.font = '400 26px "Instrument Serif", serif'
          ctx.fillText(String(Math.round(counts[si] * clamp(w1 * 1.4))), x, top - 10)
        })
      }
      if (w2 > 0.01) {
        const X = (m: number) => lb.gL + (m / 96) * lb.gw, Y = (kg: number) => lb.gB - (kg / 900) * lb.gh
        ctx.strokeStyle = `rgba(243,242,242,${0.07 * w2})`; ctx.lineWidth = 1; ctx.beginPath()
        ;[300, 600, 900].forEach(kg => { ctx.moveTo(lb.gL, Y(kg)); ctx.lineTo(lb.gL + lb.gw, Y(kg)) }); ctx.stroke()
        ctx.strokeStyle = `rgba(243,242,242,${0.35 * w2})`; ctx.beginPath()
        ctx.moveTo(lb.gL, lb.gB - lb.gh); ctx.lineTo(lb.gL, lb.gB); ctx.lineTo(lb.gL + lb.gw, lb.gB); ctx.stroke()
        ctx.fillStyle = `rgba(243,242,242,${0.55 * w2})`; ctx.font = mono; ctx.textAlign = 'center'
        ;[0, 2, 4, 6, 8].forEach(y => ctx.fillText(y + tx('Y'), X(y * 12), lb.gB + 16))
        ctx.textAlign = 'right'
        ;[0, 300, 600, 900].forEach(kg => ctx.fillText(kg + '', lb.gL - 8, Y(kg) + 3)); ctx.textAlign = 'left'
        const mm = 96 * clamp(w2 * 1.3 - 0.15)
        ctx.strokeStyle = `rgba(104,198,164,${0.9 * w2})`; ctx.lineWidth = 1.5; ctx.beginPath()
        for (let m = 0; m <= mm; m++) { const yy = Y(baseW(m)); if (m) ctx.lineTo(X(m), yy); else ctx.moveTo(X(m), yy) }
        ctx.stroke()
        ctx.fillStyle = `rgba(104,198,164,${w2})`; const egl = tx('EXPECTED GROWTH'); ctx.fillText(egl, X(mm) - Math.max(110, ctx.measureText(egl).width + 20), Y(baseW(mm)) - 12)
        ctx.textAlign = 'left'
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
        d.vx = (d.vx + ax) * damp; d.vy = (d.vy + ay) * damp; d.x += d.vx; d.y += d.vy
        cur[i * 2] = d.x; cur[i * 2 + 1] = d.y
      }

      if (w3 > 0.01) {
        ctx.strokeStyle = `rgba(243,242,242,${0.06 * w3})`; ctx.lineWidth = 1
        for (let k = 1; k <= 8; k++) { ctx.beginPath(); ctx.arc(lb.pcx, lb.pcy, lb.ring(k), 0, Math.PI * 2); ctx.stroke() }
        ctx.fillStyle = `rgba(243,242,242,${0.5 * w3})`; ctx.font = mono; ctx.textAlign = 'center'
        ;['PARENTS', 'GRANDPARENTS', 'GREAT-GRANDPARENTS'].forEach((l, k) => ctx.fillText(tx(l), lb.pcx, lb.pcy - lb.ring(k + 1) - 5))
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
          if (rankOf[i] >= SQ || rankOf[i] < 0) al *= 1 - w4
        }
        if (half && (i & 1)) al *= w3 // phones: every other dot only appears in the lineage view
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
      if (tap.i >= 0 && n < tap.until && stg === tap.stg) { sel = tap.i; selT.current = tap.until; if (sel !== selNow) selStart = n }
      else if (hov) { sel = near; selT.current = n + 1.2; if (near !== selNow) selStart = n }
      else if (n > selT.current && n > t0 + 2) { sel = pick(stg); selT.current = n + (stg === 4 ? 1e6 : 2.8); selStart = n }
      const d = DOTS[sel]
      if (d && n > t0 + 1.8) {
        const red = sel === ALERT && w4 > 0.5, col = red ? '236,48,19' : '104,198,164'
        const x = cur[sel * 2], y = cur[sel * 2 + 1], pulse = (n * 0.9) % 1, rr = 7 + pulse * 18
        if (!red) { ctx.strokeStyle = `rgba(${col},${0.9 * (1 - pulse)})`; ctx.lineWidth = 1; ctx.strokeRect(x - rr, y - rr, rr * 2, rr * 2) }
        ctx.strokeStyle = `rgb(${col})`; ctx.lineWidth = 1.5; ctx.strokeRect(x - 7, y - 7, 14, 14)
        const card = state.narrow ? miniRef.current : cardRef.current
        if (card) {
          const cr = cv.getBoundingClientRect(), bb = card.getBoundingClientRect()
          const k = eIO(clamp((n - selStart) / 0.6))
          ctx.strokeStyle = `rgba(${col},0.6)`; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.beginPath()
          if (!state.narrow) {
            const ex = bb.left - cr.left, ey = bb.top - cr.top + 44
            ctx.moveTo(x + 7, y)
            const mxp = x + 7 + (ex - x - 7) * k
            ctx.lineTo(mxp, y); ctx.lineTo(mxp, y + (ey - y) * k)
          } else {
            // phones: dotted line runs down from the animal to the info card at the bottom
            const ey = bb.top - cr.top, tx = Math.min(bb.right - cr.left - 18, Math.max(bb.left - cr.left + 18, x))
            if (ey > y + 24) {
              const pts = [[x, y + 7], [x, ey - 14], [tx, ey - 14], [tx, ey]]
              const seg = pts.slice(1).map((q, j) => Math.hypot(q[0] - pts[j][0], q[1] - pts[j][1]))
              let left = seg.reduce((a, b2) => a + b2, 0) * k
              ctx.moveTo(pts[0][0], pts[0][1])
              for (let j = 0; j < seg.length && left > 0; j++) {
                const f = Math.min(1, left / (seg[j] || 1))
                ctx.lineTo(pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f)
                left -= seg[j]
              }
            }
          }
          ctx.stroke(); ctx.setLineDash([])
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
    window.addEventListener('touchstart', onTapStart, { passive: true })
    window.addEventListener('touchend', onTapEnd, { passive: true })
    document.addEventListener('mouseleave', onOut)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => {
      cancelAnimationFrame(raf); ro.disconnect()
      window.removeEventListener('mousemove', onMove); document.removeEventListener('mouseleave', onOut)
      window.removeEventListener('touchstart', onTapStart); window.removeEventListener('touchend', onTapEnd)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  // ── stepped scrolling: one scroll / swipe moves exactly one chapter, then the view holds ──
  const step = useRef<{ raf: number; lockUntil: number; busy: boolean; unlock: number; setHold?: (y: number) => void }>({ raf: 0, lockUntil: 0, busy: false, unlock: 0 })

  const chapterY = (c: number) => {
    const el = secRef.current!
    return el.getBoundingClientRect().top + scrollY + (c / 4) * (el.offsetHeight - (stickRef.current?.offsetHeight ?? innerHeight)) + 1
  }

  // animate the page scroll to a scroll position (px). soft = the gentle ease-out used when the page settles after normal scrolling.
  const goY = useCallback((to: number, soft = false, fast = false) => {
    const el = secRef.current
    if (!el) return
    cancelAnimationFrame(step.current.raf)
    const from = scrollY, dist = Math.abs(to - from)
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const dur = reduce ? 1 : fast ? Math.max(300, Math.min(520, (dist / innerHeight) * 280)) : soft ? Math.max(300, Math.min(600, (dist / innerHeight) * 500)) : Math.max(380, Math.min(650, (dist / innerHeight) * 520))
    const t0 = performance.now()
    step.current.busy = true
    // touch screens: freeze native scrolling (and any fling momentum) while the step animates and holds, so it can't carry past the target
    if (matchMedia('(pointer: coarse)').matches) {
      document.documentElement.style.overflow = 'hidden'
      clearTimeout(step.current.unlock)
      step.current.unlock = window.setTimeout(() => { document.documentElement.style.overflow = '' }, dur)
    }
    step.current.lockUntil = t0 + dur // no hold after arriving: the next scroll can move on straight away
    const ease = soft ? (t: number) => -(Math.cos(Math.PI * t) - 1) / 2 : (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / dur)
      window.scrollTo({ top: from + (to - from) * ease(k), behavior: 'instant' as ScrollBehavior })
      if (k < 1) step.current.raf = requestAnimationFrame(tick)
      else { step.current.busy = false; step.current.setHold?.(to) }
    }
    step.current.raf = requestAnimationFrame(tick)
  }, [])

  const goCh = useCallback((c: number, soft = false, fast = false) => {
    if (!secRef.current) return
    goY(chapterY(c), soft, fast)
  }, [goY])

  useEffect(() => {
    const stepState = step.current
    const pinned = () => {
      const el = secRef.current
      if (!el) return false
      const r = el.getBoundingClientRect()
      return r.top <= 1 && r.bottom >= (stickRef.current?.offsetHeight ?? innerHeight) - 1
    }
    const current = () => {
      const el = secRef.current!
      const p = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - (stickRef.current?.offsetHeight ?? innerHeight)))
      return Math.round(p * 4)
    }
    let wasPinned = false
    const locked = () => performance.now() < step.current.lockUntil
    const navigating = () => (window as unknown as { __cfNav?: boolean }).__cfNav === true // an anchor jump (e.g. Book a demo) is in flight

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
      if (navigating() || !pinned() || step.current.busy || locked()) return
      const el = secRef.current!
      const sPos = clamp(-el.getBoundingClientRect().top / Math.max(1, el.offsetHeight - (stickRef.current?.offsetHeight ?? innerHeight))) * 4
      const delta = sPos - rest
      // one scroll moves exactly one chapter in that direction, however hard the flick
      const moved = Math.abs(delta) > 0.04 ? (delta > 0 ? rest + 1 : rest - 1) : rest
      const target = Math.max(0, Math.min(4, moved))
      rest = target
      if (Math.abs(scrollY - chapterY(target)) > 2) goCh(target, true)
    }
    const onScrollIdle = () => {
      if (navigating()) { clearTimeout(idle); return }
      if (!pinned()) { wasPinned = false; return }
      if (!wasPinned) { wasPinned = true; rest = current() }
      if (step.current.busy) return
      clearTimeout(idle)
      idle = window.setTimeout(settle, 90)
    }

    // touch: one swipe = one chapter
    let y0 = 0, stepped = false, claim = false, tStart = 0, lastDy = 0
    const onTouchStart = (e: TouchEvent) => { y0 = e.touches[0].clientY; stepped = false; claim = false; tStart = performance.now(); lastDy = 0 }
    // true while the last chapter (or the story's tail) is on screen and the typed text has not been reached yet
    const beforeManifesto = () => {
      const st = secRef.current?.getBoundingClientRect(), man = document.getElementById('manifesto')?.getBoundingClientRect()
      const sh = stickRef.current?.offsetHeight ?? innerHeight
      return !!st && !!man && st.top <= 1 && st.bottom <= sh + 2 && man.top > 24
    }
    // true while the typed text is on screen and the product section has not been reached yet
    const inManifesto = () => {
      const man = document.getElementById('manifesto')?.getBoundingClientRect(), prod = document.getElementById('product')?.getBoundingClientRect()
      return !!man && !!prod && man.top <= 24 && man.bottom > 0 && prod.top > 24
    }
    const onTouchMove = (e: TouchEvent) => {
      if (inManifesto() && y0 - e.touches[0].clientY > 0) {
        // swiping down past the typed text: land exactly on the product section, then scrolling is normal again
        e.preventDefault()
        if (!stepped && !locked() && y0 - e.touches[0].clientY >= 22) {
          stepped = true; claim = true
          const prod = document.getElementById('product')!
          goY(prod.getBoundingClientRect().top + scrollY, false)
        }
        return
      }
      if (beforeManifesto() && y0 - e.touches[0].clientY > 0) {
        // swiping down out of the story: stop exactly on the typed text instead of flinging past it
        e.preventDefault()
        if (!stepped && !locked() && y0 - e.touches[0].clientY >= 22) {
          stepped = true; claim = true
          const man = document.getElementById('manifesto')!
          goY(man.getBoundingClientRect().top + scrollY, false)
        }
        return
      }
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
      lastDy = dy
      if (stepped || locked() || Math.abs(dy) < 22) return
      // give a flick a moment to show how fast it is before choosing how far to go
      if (performance.now() - tStart < 120 && Math.abs(dy) < 150) return
      fire(dy)
    }
    // one swipe = one chapter, however hard the flick
    const fire = (dy: number) => {
      if (stepped) return
      stepped = true
      const dir = dy > 0 ? 1 : -1
      const d = decide(dir)
      if (!d) return
      goCh(d.settle)
    }
    const onTouchEnd = () => { if (claim && !stepped && !locked() && Math.abs(lastDy) >= 22) fire(lastDy) }
    const onScrollState = () => { if (!pinned()) wasPinned = false }

    window.addEventListener('scroll', onScrollIdle, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    // One scroll never carries past the section it was heading for: once a step (or the arrival from the hero) lands, the page is pinned there
    // until the scroll input (wheel / finger, including its momentum) has stopped for a moment. The next fresh scroll then moves one step on.
    let holdY: number | null = null, holdTimer = 0, prevY = scrollY
    const coarse = matchMedia('(pointer: coarse)').matches
    const armHold = () => { clearTimeout(holdTimer); holdTimer = window.setTimeout(() => { holdY = null }, coarse ? 380 : 170) }
    step.current.setHold = (y: number) => { holdY = y; armHold() }
    const onEntry = () => {
      const y = scrollY, c0 = chapterY(0)
      if (navigating()) { holdY = null; prevY = y; return }
      // arriving from the hero: land on the first chapter, never beyond it
      if (holdY === null && !step.current.busy && prevY < c0 - 2 && y >= c0 - 2 && y > prevY) { wasPinned = true; rest = 0; holdY = c0; armHold() }
      prevY = y
      if (holdY !== null && !step.current.busy && Math.abs(y - holdY) > 1) window.scrollTo({ top: holdY, behavior: 'instant' as ScrollBehavior })
    }
    const onInput = () => { if (holdY !== null) armHold() }
    window.addEventListener('scroll', onEntry, { passive: true })
    window.addEventListener('wheel', onInput, { passive: true })
    window.addEventListener('touchmove', onInput, { passive: true })

    // the user is never held: a fresh wheel gesture or a new touch during a step takes over straight away
    let lastWheel = 0
    const interrupt = (e: Event) => {
      if (e.type === 'wheel') { const now = performance.now(), gap = now - lastWheel; lastWheel = now; if (gap < 170) return } // wheel events in quick succession are the same gesture (momentum), not a new one
      if (!step.current.busy && !locked()) return
      cancelAnimationFrame(step.current.raf); clearTimeout(step.current.unlock)
      step.current.busy = false; step.current.lockUntil = 0
      document.documentElement.style.overflow = ''
    }
    window.addEventListener('wheel', interrupt, { passive: true })
    window.addEventListener('cf:nav', interrupt)
    window.addEventListener('touchstart', interrupt, { passive: true })
    window.addEventListener('scroll', onScrollState, { passive: true })
    return () => {
      window.removeEventListener('wheel', interrupt); window.removeEventListener('touchstart', interrupt); window.removeEventListener('cf:nav', interrupt)
      window.removeEventListener('scroll', onEntry); window.removeEventListener('wheel', onInput); window.removeEventListener('touchmove', onInput); clearTimeout(holdTimer); step.current.setHold = undefined
      window.removeEventListener('scroll', onScrollIdle); clearTimeout(idle)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('scroll', onScrollState)
      cancelAnimationFrame(stepState.raf)
      clearTimeout(stepState.unlock)
      document.documentElement.style.overflow = ''
    }
  }, [goCh, goY])

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
    const d = DOTS[sel], red = '#ec3013', T = tx
    const prog = hov ? '100%' : (clamp(1 - (selTime - now) / 2.8) * 100).toFixed(1) + '%'
    const base = { tag: d.tag, acc: '#68c6a4', bd: 'rgba(243,242,242,0.16)', badge: T('Live'), footC: '#adcfc5', spark: false, bars: [] as { h: string; c: string }[], prog }
    const adg = ((d.w - 35) / Math.max(1, d.age * 30.4)).toFixed(2)
    if (stg === 4 && sel === ALERT && !hov) {
      return { ...base, mode: T('Alert · 06:10'), badge: T('Watch'), acc: red, bd: 'rgba(236,48,19,0.6)', prog: '100%', spark: true,
        f: [{ k: T('Yield today'), v: '12.5 L' }, { k: T('7-day average'), v: '14.2 L' }, { k: T('Lactation'), v: T('3rd') }, { k: T('Group'), v: T('3 · Paddock B') }],
        bars: MILK.map((m, i) => ({ h: (((m - 11.5) / 3.4) * 100).toFixed(0) + '%', c: i >= 10 ? red : 'rgba(243,242,242,0.6)' })),
        foot: T('Milk yield down 12%. Check before evening milking.'), footC: '#ff9a80' }
    }
    if (stg === 2 && !hov) {
      return { ...base, mode: T('Growth'), badge: d.slow ? T('Below curve') : T('On track'),
        f: [{ k: T('Age'), v: fmtAge(d.age) }, { k: T('Weight'), v: Math.round(d.w) + ' kg' }, { k: T('Daily gain'), v: adg + ' kg' }, { k: T('vs curve'), v: (d.dev > 0 ? '+' : '') + d.dev.toFixed(0) + '%' }],
        foot: d.slow ? T('Flagged for a feed and health check.') : T('Growing in line with the herd.') }
    }
    if (stg === 3 && !hov) {
      const sl = PEDSLOT[sel]
      return { ...base, mode: T('Lineage · ') + (sl < 7 ? T(REL[sl]) : T('Ancestor')),
        f: [{ k: T('Breed'), v: T(d.breed) }, { k: T('Generation'), v: sl === 0 ? T('Subject') : String(31 - Math.clz32(sl + 1)) }, { k: T('Sex'), v: T(sl === 0 || sl % 2 === 1 ? 'Female' : 'Male') }, { k: T('Age'), v: fmtAge(d.age) }],
        foot: sl === 0 ? T('Dam') + ' IN-' + (1000 + PED[1]) + ' · ' + T('Sire') + ' IN-' + (1000 + PED[2]) : T(REL[Math.min(sl, 6)]) + T(' of IN-1042') }
    }
    if (stg === 1 && !hov) {
      return { ...base, mode: T('Lifecycle · ') + T(STG[d.st][0]),
        f: [{ k: T('Breed'), v: T(d.breed) }, { k: T('Stage'), v: T(STG[d.st][1]) }, { k: T('Age'), v: fmtAge(d.age) }, { k: T('Weight'), v: Math.round(d.w) + ' kg' }],
        foot: T('Next: ') + T(NEXT[d.st]) }
    }
    return { ...base, mode: hov ? T('Under cursor') : T('Tagging'),
      f: [{ k: T('Breed'), v: T(d.breed) }, { k: T('Stage'), v: T(STG[d.st][1]) }, { k: T('Age'), v: fmtAge(d.age) }, { k: T('Weight'), v: Math.round(d.w) + ' kg' }],
      foot: T('Last: ') + T(d.ev) }
  })()

  const c0 = ch(0)
  const rail = VIEWS.map((l, c) => {
    const on = c === act, k = clamp(1 - Math.abs(s - c)), L = (a: number, b: number) => Math.round(a + (b - a) * k)
    return { n: '0' + c, label: tx(l), cur: on ? 'step' as const : undefined, color: `rgba(${L(243, 15)},${L(242, 14)},${L(242, 13)},${(0.62 + 0.38 * k).toFixed(3)})`, fw: k > 0.5 ? 700 : 500, no: (0.5 + 0.1 * k).toFixed(2), c }
  })

  return (
    <section id="top" ref={secRef} className="cf2s" style={{ height: '600vh' }}>
      <div ref={stickRef} className="cf2s-stick">
        <canvas ref={cvRef} className="cf2s-canvas" aria-hidden="true" />
        <div className="cf2s-vignette" aria-hidden="true" />

        <div className="cf2s-text" style={{ top: narrow ? '72px' : '0px', height: narrow ? '44vh' : '100vh', width: narrow ? 'calc(100% - 32px)' : 'min(440px, 31vw)' }}>
          <div className="cf2s-c0" style={{ width: narrow ? '100%' : 'min(760px, 52vw)', ...c0, opacity: (Number(c0.opacity) * inO).toFixed(3) }}>
            <h1>{tx("Here's how we make a")}<br /><em>{tx('difference')}</em></h1>
            <p>{tx('For representational purpose, each dot')}<br />{tx('represents an animal in your herd.')}</p>
          </div>

          <div className="cf2s-ch" style={ch(1)}>
            <Label>{tx('01 — Lifecycle')}</Label>
            <h2>{tx('The herd')} <em>{tx('sorts itself.')}</em></h2>
            <p>{tx('Calves become heifers, heifers become cows, on their own as they age and calve. Weaning comes due on schedule, without anyone keeping count.')}</p>
          </div>
          <div className="cf2s-ch" style={ch(2)}>
            <Label>{tx('02 — Growth')}</Label>
            <h2>{tx('Logging weights gives you')} <em>{tx('insights.')}</em></h2>
            <p>{tx('Log a weight and Cattle Force works out daily gain. Animals falling below the expected curve can be given the right care.')}</p>
          </div>
          <div className="cf2s-ch" style={ch(3)}>
            <Label>{tx('03 — Lineage')}</Label>
            <h2>{tx('Lineage', 'Un linaje')} <em>{tx('you can see.')}</em></h2>
            <p>{tx('Dam, sire and every generation behind them, one tap from any animal. Breed with the whole family tree in view.')}</p>
          </div>
          <div className="cf2s-ch" style={ch(4)}>
            <Label color="#ff7a5c">{tx('04 — Today')}</Label>
            <h2>{tx('One of them')} <em style={{ color: '#ff9a80' }}>{tx('needs you.')}</em></h2>
            <p>{tx('Cattle Force reads every record and flags alerts that need to be addressed on priority.')}</p>
            <a href="#demo" className="cf2s-btn">
              <span>{tx('Book a demo')}</span>
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

        <div ref={miniRef} className="cf2s-mini" aria-live="polite" style={{ opacity: inO }}>
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

        <nav ref={railRef} aria-label={tx('Chapters')} className="cf2s-rail" style={{ opacity: inO }}>
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
