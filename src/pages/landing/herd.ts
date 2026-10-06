/* Deterministic herd data for the dot-herd scroll story (ported from the design prototype). */

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
export const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const eOut = (t: number) => 1 - Math.pow(1 - t, 3)

let _s = 9
const rnd = () => (_s = (_s * 16807) % 2147483647) / 2147483647
const gauss = () => {
  let u = 0, v = 0
  while (!u) u = rnd()
  while (!v) v = rnd()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}
const shuffle = <T,>(a: T[]) => {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export const N = 1000
export const ALERT = 42
export const SIG = [104, 198, 164]
export const RED = [236, 48, 19]
// [plural, singular, count, minAgeMonths, maxAgeMonths, weightFactor]
export const STG: [string, string, number, number, number, number][] = [
  ['Calves', 'Calf', 160, 1, 6, 1],
  ['Heifers', 'Heifer', 220, 7, 26, 1],
  ['Cows', 'Cow', 490, 27, 96, 1],
  ['Steers', 'Steer', 100, 8, 30, 1.06],
  ['Bulls', 'Bull', 30, 24, 72, 1.3],
]
const BREEDS = ['Gir', 'Sahiwal', 'Holstein Friesian', 'Jersey', 'Angus', 'Brahman', 'Crossbreed']
const EVENTS = ['Morning milking · 14.2 L', 'FMD vaccination · dose 2', 'Weighed · 412 kg', 'Pregnancy check · positive', 'Moved to paddock B', 'Heat observed · AI booked', 'Calved · heifer calf', 'Deworming · done']
export const NEXT = ['Weaning in 3 weeks', 'First breeding window in 2 months', 'Dry-off in 6 weeks', 'Sale weight in 4 months', 'Breeding soundness check due']
export const baseW = (a: number) => 35 + 560 * (1 - Math.exp(-a / 16))
export const CL = [[-0.24, -0.08], [0.04, 0.1], [0.27, -0.12], [-0.06, -0.26], [0.2, 0.26]]
export const REL = ['Subject', 'Dam', 'Sire', 'Maternal granddam', 'Maternal grandsire', 'Paternal granddam', 'Paternal grandsire']
export const MILK = [14.1, 14.4, 14.0, 14.6, 14.2, 14.5, 14.3, 14.7, 14.4, 14.2, 13.6, 13.1, 12.8, 12.5]
export const VIEWS = ['Home', 'Lifecycle', 'Growth', 'Lineage', 'Today']
export const fmtAge = (a: number) => (a < 12 ? Math.round(a) + ' months' : (a / 12).toFixed(1) + ' years')

export interface Dot {
  i: number; tag: string; st: number; rank: number; age: number; breed: string; ev: string; cl: number
  gx: number; gy: number; ph: number; delay: number; sx: number; sy: number; z: number
  x: number; y: number; vx: number; vy: number; dev: number; slow: boolean; w: number
}

export const DOTS: Dot[] = Array.from({ length: N }, (_, i) => ({ i, tag: 'IN-' + (1000 + i) }) as Dot)
export const BYST: number[][] = [[], [], [], [], []]

{
  const ord = shuffle([...Array(N).keys()])
  let k = 0
  STG.forEach((s, si) => {
    for (let j = 0; j < s[2]; j++) {
      const d = DOTS[ord[k++]]
      d.st = si; d.rank = j; d.age = s[3] + rnd() * (s[4] - s[3])
    }
  })
  const A = DOTS[ALERT]
  if (A.st !== 2) {
    const B = DOTS.find(d => d.st === 2)!;
    [A.st, B.st] = [B.st, A.st];
    [A.rank, B.rank] = [B.rank, A.rank];
    [A.age, B.age] = [B.age, A.age]
  }
  DOTS.forEach(d => {
    const nz = gauss()
    d.breed = BREEDS[Math.floor(rnd() * 7)]; d.ev = EVENTS[Math.floor(rnd() * EVENTS.length)]; d.cl = Math.floor(rnd() * 5)
    d.gx = gauss(); d.gy = gauss(); d.ph = rnd() * 6.283; d.delay = rnd(); d.sx = rnd(); d.sy = rnd(); d.z = 0.6 + rnd() * 0.8
    d.x = 0; d.y = 0; d.vx = 0; d.vy = 0
    d.dev = nz * 7; d.slow = nz < -1.5; d.w = baseW(d.age) * STG[d.st][5] * (1 + d.dev / 100)
    BYST[d.st].push(d.i)
  })
  Object.assign(A, { breed: 'Gir', age: 48, slow: false, dev: -2 })
  A.w = baseW(48) * 0.98
}

export const SLOW = DOTS.filter(d => d.slow).map(d => d.i)
export const PED = (() => {
  const o = shuffle([...Array(N).keys()].filter(i => i !== ALERT))
  o.unshift(ALERT)
  return o
})()
export const PEDSLOT = new Int32Array(N)
PED.forEach((di, s) => { PEDSLOT[di] = s })

export interface Layout {
  L: Float32Array[]
  A: { x: number; y: number; w: number; h: number }
  SQ: number
  SZ: number[]
  lab: {
    sx: number[]; base: number; s2: number; u: number; gL: number; gB: number; gw: number; gh: number
    pcx: number; pcy: number; ring: (k: number) => number; gx0: number; gy0: number; gs: number; gW: number; gH: number
  }
}

export function computeLayout(W: number, H: number): Layout {
  const nar = W < 820
  // Desktop: keep the visual clear of the nav (top), the chapter rail (bottom), the text column (left) and the record card (right).
  const ax = Math.max(W * 0.36, 480), aRight = W - 44 - 250 - 36
  const ay = Math.max(H * 0.17, 112), ah = Math.max(220, Math.min(H * 0.56, H - ay - 120))
  const A = nar ? { x: 16, y: H * 0.5, w: W - 32, h: H * 0.38 } : { x: ax, y: ay, w: Math.max(260, Math.min(W * 0.37, aRight - ax)), h: ah }
  const L = Array.from({ length: 5 }, () => new Float32Array(N * 2))
  const cx = A.x + A.w * 0.55, cy = A.y + A.h * 0.5
  DOTS.forEach((d, i) => {
    const q = CL[d.cl]
    L[0][i * 2] = cx + q[0] * A.w * 1.3 + d.gx * A.w * 0.1
    L[0][i * 2 + 1] = cy + q[1] * A.h + d.gy * A.h * 0.085
  })
  const cw = A.w / 5, u = nar ? 7 : 9
  const s2 = Math.min((cw * 0.82) / u, (A.h - 56) / Math.ceil(490 / u))
  const base = A.y + A.h - 26
  const sx = STG.map((_, si) => A.x + si * cw + (cw - u * s2) / 2)
  DOTS.forEach((d, i) => {
    L[1][i * 2] = sx[d.st] + (d.rank % u) * s2 + s2 / 2
    L[1][i * 2 + 1] = base - Math.floor(d.rank / u) * s2 - s2 / 2
  })
  const gL = A.x + 40, gB = A.y + A.h - 24, gw = A.w - 48, gh = A.h - 36
  DOTS.forEach((d, i) => {
    L[2][i * 2] = gL + (d.age / 96) * gw
    L[2][i * 2 + 1] = gB - (clamp(d.w, 0, 900) / 900) * gh
  })
  const R = Math.min(A.w, A.h) * 0.47, pcx = A.x + A.w / 2, pcy = A.y + A.h / 2
  const ring = (k: number) => (k === 0 ? 0 : R * Math.pow(k / 8, 0.85))
  PED.forEach((di, s) => {
    let x: number, y: number
    const d = DOTS[di]
    if (s < 511) {
      const k = 31 - Math.clz32(s + 1), j = s + 1 - (1 << k), a = ((j + 0.5) / (1 << k)) * Math.PI * 2 - Math.PI / 2
      x = pcx + Math.cos(a) * ring(k); y = pcy + Math.sin(a) * ring(k)
    } else {
      const r = R * (1.08 + Math.abs(d.gx) * 0.06)
      x = pcx + Math.cos(d.ph) * r; y = pcy + Math.sin(d.ph) * r
    }
    L[3][di * 2] = x; L[3][di * 2 + 1] = y
  })
  const side = Math.floor(Math.sqrt(N)), g = { s: Math.min(A.w, A.h) / side, c: side, r: side }
  const SQ = side * side
  const gx0 = A.x + (A.w - g.c * g.s) / 2 + g.s / 2, gy0 = A.y + (A.h - g.r * g.s) / 2 + g.s / 2
  for (let i = 0; i < N; i++) {
    const j = i % SQ
    L[4][i * 2] = gx0 + (j % g.c) * g.s
    L[4][i * 2 + 1] = gy0 + Math.floor(j / g.c) * g.s
  }
  const d0 = nar ? 1.8 : 2.2
  const SZ = [d0, Math.max(2, s2 * 0.7), d0, nar ? 1.8 : 2.2, Math.max(2, g.s * 0.45)]
  return { L, A, SQ, SZ, lab: { sx, base, s2, u, gL, gB, gw, gh, pcx, pcy, ring, gx0, gy0, gs: g.s, gW: g.c * g.s, gH: g.r * g.s } }
}
