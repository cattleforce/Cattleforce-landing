import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import appDashboard from '../../assets/new/app-dashboard.png'
import appAnimals from '../../assets/new/app-animals.png'
import appPedigree from '../../assets/new/app-pedigree.png'
import logoWhite from '../../assets/new/logo-lockup-white.png'
import { GridBackdrop, RippleLayer } from './Chrome'
import './newsections.css'


/* ── Data (from the design's constants) ─────────────────── */

const MAN =
  'Cattle Force replaces notebooks and spreadsheets with a smart platform that manages your herd, your team and your finances, so your whole farm runs as one.'
const MAN_WORDS = MAN.split(' ').map((w, i, arr) => ({ w, pos: arr.slice(0, i).reduce((n, x) => n + x.length + 1, 0) }))
const MAN_ITAL = new Set(['runs', 'as', 'one.'])

const SCREENS = [
  { src: appDashboard, url: 'app.cattleforce.in/dashboard', title: 'Dashboard' },
  { src: appAnimals, url: 'app.cattleforce.in/animals', title: 'Animals' },
  { src: appPedigree, url: 'app.cattleforce.in/animals/offspring/1234', title: 'Pedigree' },
]

const CMP: Record<string, string[]> = {
  'Herd & Lifecycle': [
    'Animal registry',
    'Automated animal stage tracking',
    'Automated, optimized weaning events',
    'Offspring registry and promotion to adult',
    'Pedigree and lineage',
    'Breed composition tracking',
    'Weight records and growth tracking (ADG)',
    'Groups and locations',
  ],
  'Production & Breeding': [
    'Reproduction tracking (AI/mating, pregnancy checks, calving)',
    'Milk production logging and KPIs',
  ],
  Health: ['Veterinary and health events'],
  Business: [
    'Financial tracking',
    'Inventory ledger with stock guards',
    'Business partners (suppliers, customers, investors)',
  ],
  Operations: ['Task calendar and worker management', 'Resource management', 'File and document attachments'],
  Insight: ['Dashboard with live alerts', 'Analytics', 'Notifications', 'CSV reports and data export'],
  Platform: ['Configurable farm settings (thresholds, dropdowns)'],
}

const U = (id: string, w = 500) => `https://images.unsplash.com/${id}?q=80&w=${w}&auto=format&fit=crop`
const PHOTOS_A = ['photo-1440428099904-c6d459a7e7b5', 'photo-1636998980792-63f27ddea4e3', 'photo-1580570598977-4b2412d01bbc', 'photo-1503190766327-73a7d9e9e844', 'photo-1507103011901-e954d6ec0988'].map(i => U(i))
const PHOTOS_B = ['photo-1567513068697-fca8c2af4528', 'photo-1596733430284-f7437764b1a9', 'photo-1592585897997-584ddf2fed6c', 'photo-1454179083322-198bb4daae41', 'photo-1583364428520-fa6c5013c0c3'].map(i => U(i))
const ROT_A = [-6, 4, -9, 7, -3]
const ROT_B = [5, -8, 3, -5, 9]

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

const SIZES = ['< 100', '100–500', '500+']
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

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#235149" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12.5l5 5L20 6.5" />
    </svg>
  )
}

function Card({ title, span, cls = '', children }: { title: string; span: number; cls?: string; children?: React.ReactNode }) {
  const items = CMP[title]
  return (
    <div className={`cf2-card cf2-span${span} ${cls}`}>
      <p className="cf2-card-title">{title}</p>
      <ul className={`cf2-checks${title === 'Herd & Lifecycle' ? ' cf2-checks--wide' : ''}`}>
        {items.map(x => (
          <li key={x}><Check /><span>{x}</span></li>
        ))}
      </ul>
      {children}
    </div>
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
  const ref = useRef<HTMLElement>(null)
  const [typed, setTyped] = useState(0)
  const started = useRef(false)
  const completed = useRef(false)
  const total = MAN.length

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

  const done = typed >= total
  return (
    <section id="manifesto" ref={ref} className="cf2-manifesto">
      <div className="cf2-manifesto-stick">
        <p className="cf2-manifesto-text" aria-label={MAN}>
          {MAN_WORDS.map(({ w, pos }, i) => {
            const a = Math.max(0, Math.min(w.length, typed - pos))
            const hasCursor = !done && typed >= pos && typed <= pos + w.length
            return (
              <span key={i} className={`cf2-mw${MAN_ITAL.has(w) ? ' cf2-mw--em' : ''}`} aria-hidden="true">
                <span>{w.slice(0, a)}</span>
                {hasCursor && <span className="cf2-cursor" />}
                <span style={{ opacity: 0 }}>{w.slice(a)}</span>
              </span>
            )
          })}
        </p>
      </div>
    </section>
  )
}

/* ── Product screens ────────────────────────────────────── */

function Product() {
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

  return (
    <section id="product" data-sec className="cf2-light cf2-pad">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap cf2-stack">
        <div className="cf2-head" data-rv>
          <Label>The product</Label>
          <h2 className="cf2-h2 cf2-h2--xl">Built around the <em>day's work.</em></h2>
          <p className="cf2-mono-cap">Real screens from the Cattle Force app.</p>
        </div>

        <div ref={ref} className="cf2-frame-wrap">
          <div className="cf2-frame">
            <span className="cf2-br cf2-br--tl" /><span className="cf2-br cf2-br--tr" />
            <span className="cf2-br cf2-br--bl" /><span className="cf2-br cf2-br--bb" />
            <div className="cf2-frame-bar">
              <div className="cf2-frame-dots"><i /><i /><i /></div>
              <div className="cf2-frame-url">[ {SCREENS[i].url} ]</div>
            </div>
            <div className="cf2-frame-pad">
              <div className="cf2-screens">
                {SCREENS.map((s, k) => (
                  <img key={s.title} src={s.src} alt={`Cattle Force ${s.title} screen`} className={k === i ? 'on' : ''} />
                ))}
                <div className="cf2-prog" style={{ width: `${locked || prog.i !== i ? 0 : prog.k * 100}%` }} aria-hidden="true" />
              </div>
            </div>
            <div className="cf2-tabs" role="tablist" aria-label="Screens">
              {SCREENS.map((s, k) => (
                <span key={s.title} className="cf2-tab-wrap">
                  {k > 0 && <span className="cf2-tab-sep" aria-hidden="true">//</span>}
                  <button role="tab" aria-selected={k === i} className={k === i ? 'on' : ''} onClick={() => { setI(k); setLocked(true) }}>
                    {s.title}
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
  return (
    <section id="features" data-sec className="cf2-light cf2-pad cf2-pad--feat">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap">
        <div className="cf2-head" data-rv>
          <Label>Feature index</Label>
          <h2 className="cf2-h2 cf2-h2--lg">Everything the <em>farm</em> runs on.</h2>
        </div>
        <div className="cf2-bento">
          <Card title="Herd & Lifecycle" span={4} cls="cf2-r">
            <div className="cf2-media cf2-media--tall">
              <img src={U('photo-1500595046743-cd271d694d30', 1400)} alt="Herd of cows on a green pasture" />
            </div>
          </Card>
          <Card title="Production & Breeding" span={2}>
            <div className="cf2-media cf2-media--tiles">
              <div className="cf2-tiles cf2-tiles--a">
                {PHOTOS_A.map((s, k) => (
                  <div key={s} className="cf2-tile" style={{ ['--r' as string]: `${ROT_A[k]}deg` }}><img src={s} alt="" /></div>
                ))}
              </div>
              <div className="cf2-tiles">
                {PHOTOS_B.map((s, k) => (
                  <div key={s} className="cf2-tile" style={{ ['--r' as string]: `${ROT_B[k]}deg` }}><img src={s} alt="" /></div>
                ))}
              </div>
            </div>
          </Card>
          <Card title="Insight" span={3} cls="cf2-r">
            <div className="cf2-media cf2-media--short">
              <img src={U('photo-1558152761-aee570eb5cb0', 1200)} alt="Herd of cows in a green pasture" style={{ objectPosition: 'center top' }} />
            </div>
          </Card>
          <Card title="Operations" span={3}>
            <div className="cf2-media cf2-media--short">
              <img src={U('photo-1705849441027-e366643921b3', 1200)} alt="Ranch hands rounding up cattle" />
            </div>
          </Card>
          <Card title="Health" span={2} cls="cf2-r cf2-last-row" />
          <Card title="Business" span={2} cls="cf2-r cf2-last-row" />
          <Card title="Platform" span={2} cls="cf2-last-row cf2-last" />
        </div>
      </div>
    </section>
  )
}

/* ── Testimonials ───────────────────────────────────────── */

function Field() {
  const [ref, vis] = useVisible<HTMLElement>()
  const [i, setI] = useState(0)
  const [locked, setLocked] = useState(false)
  const [hover, setHover] = useState(false)

  useEffect(() => {
    if (!vis || locked || hover) return
    const t = window.setTimeout(() => setI(v => (v + 1) % TESTI.length), 8000)
    return () => clearTimeout(t)
  }, [i, vis, locked, hover])

  const go = (n: number) => { setI((n + TESTI.length) % TESTI.length); setLocked(true) }

  return (
    <section id="field" data-sec ref={ref} className="cf2-dark cf2-pad" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className="cf2-wrap cf2-stack cf2-stack--tight">
        <div className="cf2-head cf2-head--left" data-rv>
          <Label dark>From the field</Label>
          <h2 className="cf2-h2 cf2-h2--field">Built for serious <em>cattle operations.</em></h2>
          <p className="cf2-field-sub">Used by ranchers managing hundreds to thousands of animals, every day.</p>
        </div>
        <div className="cf2-field-grid">
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
                      <span>{t.role}, {t.farm}</span>
                      <span className="cf2-place">{t.place}, {t.country}</span>
                    </figcaption>
                    <blockquote>
                      {t.quote.split(' ').map((w, j) => (
                        <span key={j} style={{ transitionDelay: on ? `${(0.15 + j * 0.02).toFixed(2)}s` : '0s' }}>{w}</span>
                      ))}
                    </blockquote>
                  </figure>
                )
              })}
            </div>
            <div className="cf2-field-nav">
              <button aria-label="Previous testimonial" onClick={() => go(i - 1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="square"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
              </button>
              <button aria-label="Next testimonial" onClick={() => go(i + 1)}>
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
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" data-sec className="cf2-light cf2-pad">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap cf2-faq-grid">
        <div className="cf2-head cf2-head--left" data-rv>
          <Label>Questions</Label>
          <h2 className="cf2-h2 cf2-h2--field">Asked and <em>answered.</em></h2>
        </div>
        <div className="cf2-faq-list">
          {FAQS.map((f, k) => {
            const on = open === k
            return (
              <div key={f.q} className="cf2-faq-item">
                <button aria-expanded={on} onClick={() => setOpen(on ? -1 : k)}>
                  <span className="cf2-faq-n">0{k + 1}</span>
                  <span className="cf2-faq-q">{f.q}</span>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true" style={{ transform: on ? 'rotate(45deg)' : 'none' }}>
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                </button>
                <div className="cf2-faq-a" style={{ gridTemplateRows: on ? '1fr' : '0fr' }}>
                  <div><p>{f.a}</p></div>
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
          <span key={k} aria-hidden={k === list.length - 1 || undefined}>{w}<b>.</b></span>
        ))}
      </span>
    </span>
  )
}

type Status = 'idle' | 'loading' | 'success' | 'error' | 'activate'

function Demo() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [size, setSize] = useState('100–500')
  const [err, setErr] = useState('')
  const [bad, setBad] = useState({ name: false, email: false })
  const [status, setStatus] = useState<Status>('idle')
  const [sentTo, setSentTo] = useState({ first: '', email: '' })

  const submit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    const b = { name: !name.trim(), email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) }
    setBad(b)
    if (b.name || b.email) {
      setErr(b.name && b.email ? 'Add your name and a valid email.' : b.name ? 'Add your name.' : 'Add a valid email.')
      return
    }
    setErr('')
    setStatus('loading')
    try {
      const res = await fetch('https://formsubmit.co/ajax/cattleeforcee@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          herd_size: size,
          subject: 'Book a demo',
          _subject: '[Cattle Force] Book a demo',
          _captcha: 'false',
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
  }, [name, email, size])

  return (
    <section id="demo" data-sec className="cf2-demo">
      <div data-bg="1" aria-hidden="true" className="cf2-demo-bg"><RippleLayer rgb="159,230,204" maxA={0.3} /></div>
      <div className="cf2-wrap cf2-demo-grid">
        <div className="cf2-demo-l" data-rv>
          <h2 className="cf2-demo-h" aria-label="Run the whole farm.">
            <span>Run the whole</span>
            <WordRoll />
          </h2>
          <p>See your own herd in Cattle Force. A 30-minute walkthrough, mapped to how your farm already works.</p>
        </div>
        <div className="cf2-demo-card" data-rv>
          <strong className="cf2-demo-title">Talk to us about <em>your herd.</em></strong>
          {status === 'success' ? (
            <div role="status" className="cf2-thanks">
              <strong>Thanks, {sentTo.first}. We’ll be in touch within a working day.</strong>
              <span>We’ll send a few times for a 30-minute walkthrough to {sentTo.email}.</span>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <label>Name
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" autoComplete="name" style={{ borderColor: bad.name ? '#ff7a5c' : undefined }} />
              </label>
              <label>Email
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@farm.com" autoComplete="email" style={{ borderColor: bad.email ? '#ff7a5c' : undefined }} />
              </label>
              <div className="cf2-size">
                <span>Herd size</span>
                <div role="radiogroup" aria-label="Herd size">
                  {SIZES.map(z => (
                    <button key={z} type="button" role="radio" aria-checked={size === z} className={size === z ? 'on' : ''} onClick={() => setSize(z)}>{z}</button>
                  ))}
                </div>
              </div>
              <button type="submit" className="cf2-submit" disabled={status === 'loading'}>
                <span>{status === 'loading' ? 'Sending…' : status === 'activate' ? 'Try again' : 'Book a demo'}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></svg>
              </button>
              {err && <p role="alert" className="cf2-err">{err}</p>}
              {status === 'activate' && (
                <p role="alert" className="cf2-err">One more step: we just sent an activation email to our inbox. Please click the confirmation link in it, then submit again.</p>
              )}
              {status === 'error' && (
                <p role="alert" className="cf2-err">Something went wrong. Please try again or email <a href="mailto:cattleeforcee@gmail.com">cattleeforcee@gmail.com</a>.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

/* ── Footer ─────────────────────────────────────────────── */

function Footer() {
  return (
    <footer className="cf2-footer">
      <div className="cf2-wrap">
        <div className="cf2-footer-row">
          <img src={logoWhite} alt="Cattle Force" />
          <span className="cf2-footer-contact">Contact Us: <a href="mailto:cattleeforcee@gmail.com">cattleeforcee@gmail.com</a></span>
          <div className="cf2-footer-end">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms">Terms &amp; Conditions</Link>
            <span>© {new Date().getFullYear()} Cattle Force</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default function NewSections() {
  useReveal()
  return (
    <div className="cf2">
      <Manifesto />
      <Product />
      <Features />
      <Field />
      <Faq />
      <Demo />
      <Footer />
    </div>
  )
}
