import { useEffect, useId, useRef, useState } from 'react'
import { tx, useLang } from '../../i18n'
import { GridBackdrop } from './Chrome'
import './about.css'

const PEOPLE = [
  {
    kind: 'a', name: 'Nikhil Naresh', role: 'Co-founder and Technology',
    bio: 'Nikhil leads the engineering and builds the platform that turns the realities of herd management into a system farmers can rely on.',
  },
  {
    kind: 'b', name: 'Ashrith Nanjappa', role: 'Co-founder and Product',
    bio: 'Ashrith shapes the product around what farmers need and leads operations and growth.',
  },
  {
    kind: 'c', name: 'Manuel Perez', role: 'Field Growth & Partnership',
    bio: 'Our pioneering farm partner and field lead. He uses real-world feedback to guide product development and spearheads our South American expansion.',
  },
]

/** Animated placeholder portrait in a hand-inked editorial style (bold outlines, halftone shading); it bobs and blinks.
 *  Swap the <Avatar> in the card for an <img> once the real photos are in. */
const FACE = 'M57 98 C57 62 76 46 100 46 C124 46 143 62 143 98 C143 134 125 155 100 155 C75 155 57 134 57 98 Z'
const INK = '#111'

export function Avatar({ kind }: { kind: string }) {
  const u = useId().replace(/:/g, '')
  const skin = `sk${u}`, shade = `sh${u}`, light = `lt${u}`, clip = `cl${u}`
  const line = { stroke: INK, strokeWidth: 4, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  const thin = { stroke: INK, strokeWidth: 2.5, strokeLinecap: 'round' as const, fill: 'none' }

  return (
    <svg className="cf-av" viewBox="0 0 200 200" aria-hidden="true" role="presentation">
      <defs>
        {/* halftone: light skin with fine dots, a denser dot screen for the shadow side, and a sparse screen for light fills */}
        <pattern id={skin} width="4.5" height="4.5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="4.5" height="4.5" fill="#ececea" /><circle cx="2.25" cy="2.25" r=".75" fill={INK} opacity=".28" />
        </pattern>
        <pattern id={shade} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <circle cx="2" cy="2" r="1.25" fill={INK} opacity=".55" />
        </pattern>
        <pattern id={light} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="5" height="5" fill="#fafaf8" /><circle cx="2.5" cy="2.5" r=".7" fill={INK} opacity=".22" />
        </pattern>
        <clipPath id={clip}><path d={FACE} /></clipPath>
      </defs>

      <g className="cf-av-bob">
        {/* shirt with an open collar */}
        <path d="M34 200 C38 170 64 157 100 157 C136 157 162 170 166 200 Z" fill={`url(#${light})`} {...line} />
        <path d="M84 158 L100 180 L116 158" fill="none" {...line} />
        {/* neck */}
        <path d="M84 138 L84 160 C92 167 108 167 116 160 L116 138" fill={`url(#${skin})`} {...line} />
        <path d="M84 150 C94 156 106 156 116 150 L116 160 C108 167 92 167 84 160 Z" fill={`url(#${shade})`} />
        {/* ears */}
        <path d="M59 100 C48 96 46 114 54 120 C57 122 60 121 61 119" fill={`url(#${skin})`} {...line} />
        <path d="M141 100 C152 96 154 114 146 120 C143 122 140 121 139 119" fill={`url(#${skin})`} {...line} />
        {/* face + shadow side */}
        <path d={FACE} fill={`url(#${skin})`} />
        <g clipPath={`url(#${clip})`}>
          <path d="M122 40 C140 70 142 120 112 160 L170 160 L170 40 Z" fill={`url(#${shade})`} />
          <path d="M60 128 C78 152 122 152 140 128 L140 160 L60 160 Z" fill={`url(#${shade})`} opacity=".6" />
        </g>
        <path d={FACE} fill="none" {...line} />

        {/* hair / hat */}
        {kind === 'a' && (
          <g>
            {/* voluminous, messy black hair: layered spiky locks across the top, a fringe dipping over the forehead, short sides */}
            <path d="M59 106 L56 86 L46 79 L54 71 L42 59 L58 55 L50 39 L68 41 L66 25 L84 33 L92 17 L104 29 L120 19 L124 33 L142 29 L140 43 L158 47 L148 57 L160 67 L146 71 L143 105 L140 81 L130 73 L124 88 L116 71 L104 92 L98 71 L84 88 L82 73 L70 83 L64 77 Z" fill="#1c1c1b" {...line} />
            <g stroke="#9a9a96" strokeLinecap="round" fill="none">
              <path d="M60 52 C76 38 98 32 122 34" strokeWidth="2.5" opacity=".75" />
              <path d="M66 64 C84 50 108 44 136 46" strokeWidth="2.5" opacity=".6" />
              <path d="M84 30 C96 36 106 46 112 58" strokeWidth="2" opacity=".55" />
              <path d="M118 26 C126 36 132 48 134 62" strokeWidth="2" opacity=".5" />
              <path d="M74 74 C86 64 100 60 112 62" strokeWidth="2" opacity=".45" />
              <path d="M50 66 C56 62 62 60 70 60" strokeWidth="2" opacity=".45" />
            </g>
          </g>
        )}
        {kind === 'b' && (
          <g>
            {/* classic swept-up quiff: volume rolling up off the forehead and back to one side, short sides */}
            <path d="M58 104 L56 84 C50 80 44 70 48 60 C54 44 76 32 104 31 C130 30 148 44 149 66 C150 80 147 93 144 104 L141 84 C137 77 129 73 119 72 C101 71 84 72 70 76 C64 77 59 73 59 68 C59 63 64 61 69 63 C64 66 64 70 68 70" fill="#3a3a37" {...line} />
            <path d="M120 34 C138 40 148 54 149 68 C150 80 147 93 144 104 L141 84 C138 70 132 54 120 34 Z" fill={`url(#${shade})`} />
            <g stroke="#a3a39f" strokeLinecap="round" fill="none">
              <path d="M54 58 C70 42 100 36 128 42" strokeWidth="2.5" opacity=".75" />
              <path d="M60 66 C80 52 108 47 136 54" strokeWidth="2.5" opacity=".6" />
              <path d="M76 70 C94 62 116 60 138 66" strokeWidth="2" opacity=".45" />
            </g>
          </g>
        )}
        {kind === 'c' && (
          <g>
            {/* sideburns under the hat */}
            <path d="M58 86 L58 104 L64 102 L64 84 Z" fill={INK} />
            <path d="M142 86 L142 104 L136 102 L136 84 Z" fill={INK} />
            {/* crown with a pinched top */}
            <path d="M64 80 C60 50 72 30 100 32 C128 30 140 50 136 80 Z" fill={`url(#${light})`} {...line} />
            <path d="M84 36 C90 48 110 48 116 36" {...thin} strokeWidth={3} />
            <path d="M118 38 C126 50 128 64 126 78" fill="none" stroke={INK} strokeWidth="9" opacity=".18" strokeLinecap="round" />
            {/* band */}
            <path d="M63 70 C80 74 120 74 137 70 L136 80 C120 83 80 83 64 80 Z" fill={INK} />
            {/* brim, curling up at the sides */}
            <path d="M22 66 C30 62 54 80 100 80 C146 80 170 62 178 66 C172 92 136 94 100 94 C64 94 28 92 22 66 Z" fill={`url(#${light})`} {...line} />
            <path d="M38 80 C66 90 134 90 162 80" {...thin} opacity=".6" />
          </g>
        )}

        {/* brows, eyes (blink), nose, mouth */}
        <path d={kind === 'c' ? 'M72 96 Q82 91 92 95' : 'M72 92 Q82 86 92 90'} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <path d={kind === 'c' ? 'M108 95 Q118 91 128 96' : 'M108 90 Q118 86 128 92'} fill="none" stroke={INK} strokeWidth="4.5" strokeLinecap="round" />
        <ellipse className="cf-eye" cx="83" cy="106" rx="4" ry="5.5" fill={INK} />
        <ellipse className="cf-eye" cx="117" cy="106" rx="4" ry="5.5" fill={INK} />
        <path d="M101 108 C98 118 95 124 100 127 C102 128 105 127 106 126" {...thin} strokeWidth={3} />
        <path d="M88 137 Q100 145 113 136" {...thin} strokeWidth={3.5} />
        <path d="M113 136 q3 -1 4 -4" {...thin} strokeWidth={2.5} />

      </g>
    </svg>
  )
}

export default function AboutUs() {
  useLang()
  const [active, setActive] = useState(1) // pile: whose card is on top (the shuffle advances this)
  const [spread, setSpread] = useState(false) // hover (or tap) fans the pile out
  const [focus, setFocus] = useState(1) // fan: the card that is lifted, in its own place
  const pinned = useRef(false) // a click pins that person and stops the shuffling for good
  const spreadRef = useRef(false)
  const touching = useRef(false) // a finger on the pile holds the shuffle; a swipe takes over for good
  const sx = useRef(0)
  const sy = useRef(0)
  const ref = useRef<HTMLDivElement>(null)

  const isPhone = () => matchMedia('(max-width: 760px)').matches
  const open = () => { if (isPhone()) return; clearTimeout(closeTimer.current); if (!spreadRef.current) { spreadRef.current = true; setFocus(active); setSpread(true) } }
  // a short grace period on leaving, so the cards moving apart under a resting pointer can't make them flicker open and shut
  const closeTimer = useRef(0)
  const close = () => {
    clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => { if (spreadRef.current) { spreadRef.current = false; setActive(focus); setSpread(false) } }, 160) // the pile keeps the last-focused person on top
  }

  // shuffle: while piled, every few seconds the next person comes to the top. It holds still while the cards are spread, once someone has clicked,
  // off-screen, on phones and with reduced motion.
  const seen = useRef(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { seen.current = e.isIntersecting }, { threshold: 0.4 })
    io.observe(el)
    const t = window.setInterval(() => {
      if (pinned.current || touching.current || spreadRef.current || !seen.current || matchMedia('(prefers-reduced-motion: reduce)').matches) return
      setActive(a => (a + 1) % PEOPLE.length)
    }, 3200)
    return () => { io.disconnect(); clearInterval(t) }
  }, [])

  return (
    <section id="about" data-sec className="cf2-light cf2-pad cf-about">
      <GridBackdrop mask="ellipse 85% 75% at 50% 45%" bg="#f3f2f2" />
      <div className="cf2-wrap">
        <div className="cf-about-copy" data-rv>
          <h2 className="cf2-h2 cf2-h2--lg">{tx('About')} <em>{tx('Us')}</em></h2>
          <p>{tx('We come from farming families. We’ve seen how hard life on the farm can be, and how much the right technology can change it. Our vision is to make farmers smarter, with tools that work as hard as they do.')}</p>
          <p>{tx('Cattle Force isn’t a subscription you buy online and then figure out alone. We build it alongside farmers, with trust at the center. We commit to each farm we work with and solve the real, practical problems that come up in daily operations, from tracking every animal to alerting you when your cattle need attention.')}</p>
          <p className="cf-about-line">{tx('Built with farmers, for farmers, by farmers.')}</p>
        </div>

        <div ref={ref} className={`cf-team${spread ? ' spread' : ''}`} role="list" onMouseEnter={open} onMouseLeave={close}
          onTouchStart={e => { touching.current = true; sx.current = e.touches[0].clientX; sy.current = e.touches[0].clientY }}
          onTouchEnd={e => {
            touching.current = false
            const dx = e.changedTouches[0].clientX - sx.current, dy = e.changedTouches[0].clientY - sy.current
            if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3) { pinned.current = true; setActive(a => (a + (dx < 0 ? 1 : PEOPLE.length - 1)) % PEOPLE.length) } // swipe left = next person, right = previous
          }}
          onTouchCancel={() => { touching.current = false }}
          onBlur={e => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close() }}>
          {PEOPLE.map((p, i) => {
            // pile: advancing `active` rotates every card one place round, which reads as a shuffle (slot 0 = top, 1 = right, 2 = left)
            // fan: every card keeps its own place (left / centre / right) and only the hovered or clicked one lifts, so nothing moves under the pointer
            const slot = ((i - active) % PEOPLE.length + PEOPLE.length) % PEOPLE.length
            const s0 = spread ? i - 1 : slot === 0 ? 0 : slot === 1 ? 1 : -1
            const front = spread ? focus === i : slot === 0 // on top, fully exposed, keeping its own tilt
            const light = spread ? i === 1 : slot === 0 // the centre card is the light one; a hovered side card comes forward but stays dark
            return (
              <article key={p.name} role="listitem" tabIndex={0} className={`cf-card${light ? ' light' : ''}${front ? ' front' : ''}`}
                style={{ ['--s0' as string]: s0, ['--r0' as string]: `${s0 * 8}deg`, ['--d' as string]: `${i * 0.7}s`, zIndex: front ? 10 : 6 - Math.abs(s0) }}
                onMouseEnter={() => { open(); setFocus(i) }}
                onFocus={() => { if (isPhone()) return; pinned.current = true; open(); setFocus(i); setActive(i) }}
                onClick={() => { if (isPhone()) return; pinned.current = true; open(); setFocus(i); setActive(i) }}>
                <div className="cf-photo"><Avatar kind={p.kind} /></div>
                <p className="cf-role">{tx(p.role)}</p>
                <h3 className="cf-name">{p.name}</h3>
                <p className="cf-bio">{tx(p.bio)}</p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
