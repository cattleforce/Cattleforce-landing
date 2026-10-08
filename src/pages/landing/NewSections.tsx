import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import appDashboard from '../../assets/new/screen-dashboard.jpg'
import appAnimals from '../../assets/new/screen-animals.jpg'
import appReproduction from '../../assets/new/screen-reproduction.jpg'
import appMilk from '../../assets/new/screen-milk.jpg'
import logoWhite from '../../assets/new/logo-lockup-white.png'
import FeatureCard from './feature-card/FeatureCard'
import { GridBackdrop, LangToggle, RippleLayer } from './Chrome'
import AboutUs from './AboutUs'
import { MAN_ES, MAN_HL_ES } from '../../i18n/es'
import { tx, useLang } from '../../i18n'
import './newsections.css'


/* ── Data (from the design's constants) ─────────────────── */

const MAN =
  'Cattle Force replaces notebooks and spreadsheets with a smart platform that manages your herd, team and finances, all in one place.'
const manWords = (s: string) => s.split(' ').map((w, i, arr) => ({ w, pos: arr.slice(0, i).reduce((n, x) => n + x.length + 1, 0) }))
const MAN_WORDS = manWords(MAN)
const MAN_WORDS_ES = manWords(MAN_ES)
const MAN_HL = new Set(['smart', 'platform'])

// in the same order as the app's own menu
const SCREENS = [
  { src: appDashboard, title: 'Dashboard' },
  { src: appAnimals, title: 'Animals' },
  { src: appReproduction, title: 'Reproduction' },
  { src: appMilk, title: 'Milk Production' },
]


const U = (id: string, w = 500) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`

const TESTI = [
  { name: 'Rosa Salgado', src: U('photo-1438761681033-6461ffad8d80', 1200), farm: 'Rancho Santa Elena', place: 'Jalisco', country: 'Mexico', role: 'Operations manager', quote: 'We used to reconcile three notebooks every Friday. Now the herd record is the same for the foreman, the vet and me, and it is right on the day it happens.' },
  { name: 'Hannes Brenner', src: U('photo-1535713875002-d1d0cf377fde', 1200), farm: 'Hofgut Brenner', place: 'Bavaria', country: 'Germany', role: 'Herd manager', quote: 'Breeding and calving dates finally live next to the milk numbers. The weaning reminders alone changed how we plan the month.' },
  { name: 'Sunil Gohil', src: U('photo-1623582854588-d60de57fa33f', 1200), farm: 'Shree Gau Dairy', place: 'Gujarat', country: 'India', role: 'Farm owner', quote: 'Our staff log treatments and yields from their phones in the shed. I see every animal’s history before I walk the lines in the morning.' },
]
const T_ROT = [-8, 6, -4]

const FAQS = [
  { q: 'Who is Cattle Force for?', a: 'Dairy and cattle farms of any size that want one reliable record of their animals, the work done on them and the results.' },
  { q: 'Can we bring in our existing records?', a: 'Yes. Existing registers and spreadsheets can be imported, so the herd history starts complete from the first day.' },
  { q: 'Who on the farm can use it?', a: 'Owners, managers, vets and farm staff each get their own login and see the parts of the farm that matter to their work.' },
  { q: 'How do we get started?', a: 'Book a demo. We walk through your farm’s current setup and show how it maps onto Cattle Force.' },
]

const WORDS = ['herd', 'dairy', 'finance', 'planning', 'farm']

/* ── Small pieces ───────────────────────────────────────── */

function Label({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <span className={`cf2-label${dark ? ' cf2-label--dark' : ''}`}>
      <span aria-hidden="true" />
      {children}
    </span>
  )
}

/** Reveal-on-scroll for [data-rv] blocks; returns a ref to toggle auto-rotation visibility. */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('cf2-in'); io.unobserve(e.target) } }),
      { threshold: 0.12 },
    )
    document.querySelectorAll('.cf2 [data-rv]').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

function useVisible<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [vis, setVis] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVis(e.isIntersecting), { threshold: 0.25 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return [ref, vis] as const
}

/* ── Manifesto (typewriter) ─────────────────────────────── */

function Manifesto() {
  const lang = useLang()
  const es = lang === 'es'
  const ref = useRef<HTMLElement>(null)
  const [typed, setTyped] = useState(0)
  const started = useRef(false)
  const completed = useRef(false)
  const text = es ? MAN_ES : MAN
  const words = es ? MAN_WORDS_ES : MAN_WORDS
  const hl = es ? MAN_HL_ES : MAN_HL
  const total = text.length

  useEffect(() => {
    let raf = 0
    const start = (instant: boolean) => {
      if (started.current) return
      started.current = true
      if (instant) { setTyped(total); return }
      const t0 = performance.now()
      const dur = 3000
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / dur)
        setTyped(Math.floor(k * total))
        if (k < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      // already scrolled well past the section (e.g. page reloaded further down): show the full text, don't animate off-screen
      if (r.top < -window.innerHeight * 0.5) start(true)
      else if (r.top < window.innerHeight * 0.5) start(false)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
      // an animation cancelled mid-way (dev double-mount) must be allowed to start again
      if (!completed.current) started.current = false
    }
  }, [total])

  useEffect(() => { if (typed >= total) completed.current = true }, [typed, total])
  // switching language after the text has finished typing: show the new text in full straight away
  useEffect(() => { if (completed.current) setTyped(total) }, [total])

  const done = typed >= total
  return (
    <section id="manifesto" ref={ref} className="cf2-manifesto">
      <div className="cf2-manifesto-stick">
        <p className="cf2-manifesto-text" aria-label={text}>
          {words.map(({ w, pos }, i) => {
            const a = Math.max(0, Math.min(w.length, typed - pos))
            const hasCursor = !done && typed >= pos && typed <= pos + w.length
            return (
              <span key={i} className={`cf2-mw${hl.has(w) ? ' cf2-mw--hl' : ''}`} aria-hidden="true">
                <span>{w.slice(0, a)}</span>
                {hasCursor && <span className="cf2-cursor" />}
                <span style={{ opacity: 0 }}>{w.slice(a)}</span>
              </span>
            )
          })}
        </p>
        <a href="#product" className={`cf2-mdown${done ? ' on' : ''}`} aria-label={tx('Scroll to the next section')} tabIndex={done ? 0 : -1}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg>
        </a>
      </div>
    </section>
  )
}

/* ── Product screens ────────────────────────────────────── */

function Product() {
  useLang()
  const [ref, vis] = useVisible<HTMLDivElement>()
  const [i, setI] = useState(0)
  const [locked, setLocked] = useState(false)
  const [prog, setProg] = useState({ i: 0, k: 0 })

  useEffect(() => {
    if (!vis || locked) return
    const t0 = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const k = (now - t0) / 6000
      if (k >= 1) { setI(v => (v + 1) % SCREENS.length); return }
      setProg({ i, k })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i, vis, locked])

  // phones: swipe the screenshot left for the next screen, right for the previous one (vertical swipes still scroll the page)
  const touch = useRef({ x: 0, y: 0 })
  const onTouchStart = (e: React.TouchEvent) => { touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touch.current.x, dy = e.changedTouches[0].clientY - touch.current.y
    if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy) * 1.4) return
    setI(v => (v + (dx < 0 ? 1 : SCREENS.length - 1)) % SCREENS.length)
    setLocked(true)
  }

  return (
    <section id="product" data-sec className="cf2-light cf2-pad">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap cf2-stack">
        <div className="cf2-head" data-rv>
          <Label>{tx('The product')}</Label>
          <h2 className="cf2-h2 cf2-h2--xl">{tx('Built around the')} <em>{tx("day's work.")}</em></h2>
        </div>

        <div ref={ref} className="cf2-frame-wrap">
          <div aria-hidden="true" className="cf2-fglow" />
          <div className="cf2-frame">
            <div className="cf2-frame-bar">
              <div className="cf2-frame-dots"><i /><i /><i /></div>
              <div className="cf2-frame-url">{tx('Real screens from the Cattle Force app.')}</div>
            </div>
            <div className="cf2-frame-pad">
              <div className="cf2-screens" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
                {SCREENS.map((s, k) => (
                  <img key={s.title} src={s.src} alt={tx(`Cattle Force ${s.title} screen`)} className={k === i ? 'on' : ''} />
                ))}
                <div className="cf2-prog" style={{ width: `${locked || prog.i !== i ? 0 : prog.k * 100}%` }} aria-hidden="true" />
              </div>
            </div>
            <div className="cf2-tabs" role="tablist" aria-label={tx('Screens')}>
              {SCREENS.map((s, k) => (
                <span key={s.title} className="cf2-tab-wrap">
                  {k > 0 && <span className="cf2-tab-sep" aria-hidden="true"><span className="cf2-sep-d">//</span><span className="cf2-sep-m">/</span></span>}
                  <button role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => { setI(k); setLocked(true) }}>
                    {tx(s.title)}
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Feature index ──────────────────────────────────────── */

function Features() {
  useLang()
  return (
    <section id="features" data-sec className="cf2-dark cf2-pad cf2-pad--feat cf2-feat-black">
      <div className="cf2-wrap">
        <div className="cf2-head" data-rv>
          <Label dark>{tx('Feature index')}</Label>
          <h2 className="cf2-h2 cf2-h2--lg">{tx('Everything the')} <em>{tx('farm', 'granja.')}</em>{tx(' runs on.')}</h2>
        </div>
        <div className="cf2-fwrap">
          <FeatureCard />
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ───────────────────────────────────────── */

function Field() {
  useLang()
  const [ref, vis] = useVisible<HTMLElement>()
  const [i, setI] = useState(0)
  const [hover, setHover] = useState(false) // true only while the cursor is on the testimonial itself
  const [tick, setTick] = useState(0) // bumped by the arrows to restart the countdown

  useEffect(() => {
    if (!vis || hover) return
    const t = window.setTimeout(() => setI(v => (v + 1) % TESTI.length), 6000)
    return () => clearTimeout(t)
  }, [i, vis, hover, tick])

  const go = (n: number) => { setI((n + TESTI.length) % TESTI.length); setTick(t => t + 1) }

  // phones: the testimonials are a row of cards you swipe through (native scroll-snap); keep the dots in sync
  const rail = useRef<HTMLDivElement>(null)
  const [ci, setCi] = useState(0)
  const onRail = () => {
    const el = rail.current
    if (!el || !el.firstElementChild) return
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12
    setCi(Math.max(0, Math.min(TESTI.length - 1, Math.round(el.scrollLeft / w))))
  }
  // phones: with no swipe for a few seconds, the next card slides in by itself (no timer or loader shown); it loops.
  // A finger on the cards pauses it, and every swipe restarts the countdown.
  const touching = useRef(false)
  const [bump, setBump] = useState(0)
  useEffect(() => {
    if (!vis || !matchMedia('(max-width: 760px)').matches) return
    const t = window.setTimeout(() => {
      if (touching.current) return
      const el = rail.current
      if (!el || !el.firstElementChild) return
      const next = (ci + 1) % TESTI.length
      el.scrollTo({ left: next * ((el.firstElementChild as HTMLElement).offsetWidth + 12), behavior: 'smooth' })
    }, 5000)
    return () => clearTimeout(t)
  }, [ci, vis, bump])
  const toCard = (n: number) => {
    const el = rail.current
    if (!el || !el.firstElementChild) return
    el.scrollTo({ left: n * ((el.firstElementChild as HTMLElement).offsetWidth + 12), behavior: 'smooth' })
  }

  // phones: swipe left / right to change testimonial (vertical swipes still scroll the page)
  const swipe = useRef({ x: 0, y: 0 })
  const onSwipeStart = (e: React.TouchEvent) => { swipe.current = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
  const onSwipeEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - swipe.current.x, dy = e.changedTouches[0].clientY - swipe.current.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? i + 1 : i - 1)
  }

  return (
    <section id="field" data-sec ref={ref} className="cf2-dark cf2-pad">
      <div className="cf2-wrap cf2-stack cf2-stack--tight">
        <div className="cf2-head cf2-head--left" data-rv>
          <Label dark>{tx('Testimonials')}</Label>
          <h2 className="cf2-h2 cf2-h2--field">{tx('Built for serious')} <em>{tx('cattle operations.')}</em></h2>
          <p className="cf2-field-sub">{tx('Used by ranchers managing hundreds to thousands of animals, every day.')}</p>
        </div>
        <div className="cf2-tcards" ref={rail} onScroll={onRail} onTouchStart={() => { touching.current = true }} onTouchEnd={() => { touching.current = false; setBump(b => b + 1) }} onTouchCancel={() => { touching.current = false; setBump(b => b + 1) }}>
          {TESTI.map(t => (
            <article key={t.name} className="cf2-tcard">
              <img src={t.src} alt={t.name} draggable={false} />
              <div className="cf2-tcard-body">
                <strong>{t.name}</strong>
                <span>{tx(t.role)}, {t.farm}</span>
                <span className="cf2-place">{tx(t.place)}, {tx(t.country)}</span>
                <p>{tx(t.quote)}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="cf2-tdots" role="tablist" aria-label={tx('Testimonials')}>
          {TESTI.map((t, n) => (
            <button key={t.name} role="tab" aria-selected={n === ci} aria-label={tx('Show ') + t.name} className={n === ci ? 'on' : ''} onClick={() => toCard(n)} />
          ))}
        </div>
        <div className="cf2-field-grid" onTouchStart={onSwipeStart} onTouchEnd={onSwipeEnd} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
          <div className="cf2-stackimgs">
            {TESTI.map((t, k) => {
              const on = k === i
              return (
                <div
                  key={t.name}
                  className="cf2-simg"
                  style={{
                    zIndex: on ? 20 : TESTI.length - k,
                    opacity: on ? 1 : 0.6,
                    transform: on ? 'rotate(0deg) scale(1)' : `rotate(${T_ROT[k]}deg) scale(0.94)`,
                  }}
                >
                  <img className={on ? 'cf2-lift' : ''} src={t.src} alt={t.name} draggable={false} />
                </div>
              )
            })}
          </div>
          <div className="cf2-field-right">
            <div className="cf2-quotes">
              {TESTI.map((t, k) => {
                const on = k === i
                return (
                  <figure key={t.name} className={`cf2-quote${on ? ' on' : ''}`}>
                    <figcaption>
                      <strong>{t.name}</strong>
                      <span>{tx(t.role)}, {t.farm}</span>
                      <span className="cf2-place">{tx(t.place)}, {tx(t.country)}</span>
                    </figcaption>
                    <blockquote>
                      {tx(t.quote).split(' ').map((w, j) => (
                        <span key={j} style={{ transitionDelay: on ? `${(0.15 + j * 0.02).toFixed(2)}s` : '0s' }}>{w}</span>
                      ))}
                    </blockquote>
                  </figure>
                )
              })}
            </div>
            <div className="cf2-field-nav">
              <button aria-label={tx('Previous testimonial')} onClick={() => go(i - 1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              </button>
              <button aria-label={tx('Next testimonial')} onClick={() => go(i + 1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </button>
              <span>0{i + 1} / 0{TESTI.length}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── FAQ ────────────────────────────────────────────────── */

function Faq() {
  useLang()
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" data-sec className="cf2-light cf2-pad">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap cf2-faq-grid">
        <div className="cf2-head cf2-head--left" data-rv>
          <Label>{tx('Questions')}</Label>
          <h2 className="cf2-h2 cf2-h2--field">{tx('Asked and')} <em>{tx('answered.')}</em></h2>
        </div>
        <div className="cf2-faq-list">
          {FAQS.map((f, k) => {
            const on = open === k
            return (
              <div key={f.q} className="cf2-faq-item">
                <button aria-expanded={on} onClick={() => setOpen(on ? -1 : k)}>
                  <span className="cf2-faq-n">0{k + 1}</span>
                  <span className="cf2-faq-q">{tx(f.q)}</span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true" style={{ transform: on ? 'rotate(45deg)' : 'none' }}>
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                </button>
                <div className="cf2-faq-a" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                  <div><p>{tx(f.a)}</p></div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

/* ── Demo / contact ─────────────────────────────────────── */

function WordRoll() {
  useLang()
  const [idx, setIdx] = useState(0)
  const [anim, setAnim] = useState(true)

  useEffect(() => {
    const t = window.setInterval(() => { setAnim(true); setIdx(v => v + 1) }, 2400)
    return () => clearInterval(t)
  }, [])

  // Landed on the cloned first word: after the slide, snap back to the real one with no transition.
  useEffect(() => {
    if (idx !== WORDS.length) return
    const t = window.setTimeout(() => { setAnim(false); setIdx(0) }, 720)
    return () => clearTimeout(t)
  }, [idx])

  const list = [...WORDS, WORDS[0]]
  return (
    <span className="cf2-roll">
      <span className="cf2-roll-col" style={{ transform: `translateY(-${(idx * 1.12).toFixed(2)}em)`, transition: anim ? 'transform .7s cubic-bezier(.7,0,.2,1)' : 'none' }}>
        {list.map((w, k) => (
          <span key={k} aria-hidden={k === list.length - 1 || undefined}>{tx(w, w === 'farm' ? 'la granja' : undefined)}<b>.</b></span>
        ))}
      </span>
    </span>
  )
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'activate'

function Demo() {
  useLang()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [err, setErr] = useState('')
  const [bad, setBad] = useState({ name: false, email: false })
  const [status, setStatus] = useState<Status>('idle')
  const [sentTo, setSentTo] = useState({ first: '', email: '' })
  // Spam traps: two fields people never see (bots that fill every input fall for them) and a minimum fill-in time (bots submit instantly).
  const [honey, setHoney] = useState('')
  const [site, setSite] = useState('')
  const shownAt = useRef(Date.now())

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const b = { name: !name.trim(), email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) }
    setBad(b)
    if (b.name || b.email) {
      setErr(b.name && b.email ? 'Add your name and a valid email.' : b.name ? 'Add your name.' : 'Add a valid email.') // kept in English; translated when rendered
      return
    }
    setErr('')
    if (honey || site || Date.now() - shownAt.current < 2500) {
      // looks like a bot: pretend it worked, send nothing
      setSentTo({ first: name.trim().split(/\s+/)[0], email: email.trim() })
      setStatus('success')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('https://formsubmit.co/ajax/cattleeforcee@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim() || 'N/A',
          subject: 'Book a demo',
          _subject: '[Cattle Force] Book a demo',
          _captcha: 'false',
          _honey: honey, // FormSubmit also drops any submission where this is filled
          _template: 'table',
        }),
      })
      const data = await res.json()
      if (data.success === 'true' || data.success === true) {
        setSentTo({ first: name.trim().split(/\s+/)[0], email: email.trim() })
        setStatus('success')
      } else if (typeof data.message === 'string' && data.message.toLowerCase().includes('activat')) {
        setStatus('activate')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }, [name, email, message, honey, site])

  return (
    <section id="demo" data-sec className="cf2-demo">
      <div data-bg="1" aria-hidden="true" className="cf2-demo-bg"><RippleLayer rgb="159,230,204" maxA={0.1} /></div>
      <div className="cf2-wrap cf2-demo-grid">
        <div className="cf2-demo-l" data-rv>
          <h2 className="cf2-demo-h" aria-label={tx('Run the whole farm.')}>
            <span>{tx('Run the whole')}</span>
            <WordRoll />
          </h2>
          <p>{tx('See your own herd in Cattle Force. A 30-minute walkthrough, mapped to how your farm already works.')}</p>
        </div>
        <div className="cf2-demo-card" data-rv>
          <div aria-hidden="true" className="cf2-dc-glow" />
          <div className="cf2-dc-in">
          <div className="cf2-dc-head">
            <strong className="cf2-demo-title">{tx('Talk to us about')} <em>{tx('your herd.')}</em></strong>
          </div>
          <div className="cf2-dc-body">
          {status === 'success' ? (
            <div role="status" className="cf2-thanks">
              <strong>{tx('Thanks, ')}{sentTo.first}{tx('. We’ll be in touch within a working day.')}</strong>
              <span>{tx('We’ll send a few times for a 30-minute walkthrough to ')}{sentTo.email}.</span>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <div className="cf2-hp" aria-hidden="true">
                <label>Website<input type="text" name="website" value={site} onChange={e => setSite(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
                <label>Leave this empty<input type="text" name="_honey" value={honey} onChange={e => setHoney(e.target.value)} tabIndex={-1} autoComplete="off" /></label>
              </div>
              <label>{tx('Name')}
                <input value={name} onChange={e => setName(e.target.value)} placeholder={tx('Your name')} autoComplete="name" style={{ borderColor: bad.name ? '#ff7a5c' : undefined }} />
              </label>
              <label>{tx('Email')}
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={tx('you@farm.com')} autoComplete="email" style={{ borderColor: bad.email ? '#ff7a5c' : undefined }} />
              </label>
              <label>{tx('Message')}
                <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={tx('Tell us about your herd and what you need')} rows={4} />
              </label>
              <button type="submit" className="cf2-submit" disabled={status === 'loading'}>
                <span>{tx(status === 'loading' ? 'Sending…' : status === 'activate' ? 'Try again' : 'Book a demo')}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
              </button>
              {err && <p role="alert" className="cf2-err">{tx(err)}</p>}
              {status === 'activate' && (
                <p role="alert" className="cf2-err">{tx('One more step: we just sent an activation email to our inbox. Please click the confirmation link in it, then submit again.')}</p>
              )}
              {status === 'error' && (
                <p role="alert" className="cf2-err">{tx('Something went wrong. Please try again or email ')}<a href="mailto:cattleeforcee@gmail.com">cattleeforcee@gmail.com</a>.</p>
              )}
            </form>
          )}
          </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────── */

function Footer() {
  useLang()
  return (
    <footer className="cf2-footer">
      <div className="cf2-wrap">
        <div className="cf2-footer-row">
          <img src={logoWhite} alt="Cattle Force" />
          <span className="cf2-footer-contact">{tx('Contact Us: ')}<a href="mailto:cattleeforcee@gmail.com">cattleeforcee@gmail.com</a></span>
          <div className="cf2-footer-end">
            <Link to="/privacy-policy">{tx('Privacy Policy')}</Link>
            <Link to="/terms">{tx('Terms & Conditions')}</Link>
            <span>© {new Date().getFullYear()} Cattle Force</span>
            <LangToggle />
          </div>
        </div>
      </div>
    </footer>
  )
}

// Temporarily hidden until the real testimonials are ready: set to true to bring the section (and its nav link in Chrome.tsx) back.
const SHOW_TESTIMONIALS = false

export default function NewSections() {
  useReveal()
  return (
    <div className="cf2">
      <Manifesto />
      <Product />
      <Features />
      {SHOW_TESTIMONIALS && <Field />}
      <AboutUs />
      <Faq />
      <Demo />
      <Footer />
    </div>
  )
}
