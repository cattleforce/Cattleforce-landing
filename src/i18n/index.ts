import { useSyncExternalStore } from 'react'
import { ES } from './es'

export type Lang = 'en' | 'es'
const KEY = 'cf-lang'
const EN_TITLE = 'Cattle Force — The Operating System for Modern Cattle Farms'
const EN_DESC = 'The operating system for modern cattle farms. Track every animal, every event, and every outcome.'

const read = (): Lang => {
  try { const v = localStorage.getItem(KEY); if (v === 'es' || v === 'en') return v } catch { /* storage unavailable */ }
  // no saved choice: follow the browser's primary language (any Spanish variant, e.g. es, es-MX, es-ES), otherwise English
  const primary = (navigator.languages?.[0] ?? navigator.language ?? '').toLowerCase()
  return primary.startsWith('es') ? 'es' : 'en'
}

let LANG: Lang = read()
const subs = new Set<() => void>()

/** Translate an English source string (returns it unchanged in English or when no translation exists). `es` overrides the dictionary for one call site. */
export const tx = (s: string, es?: string): string => (LANG === 'es' ? (es ?? ES[s] ?? s) : s)

export const getLang = (): Lang => LANG

const apply = () => {
  document.documentElement.lang = LANG
  document.title = tx(EN_TITLE)
  document.querySelector('meta[name="description"]')?.setAttribute('content', tx(EN_DESC))
}
apply()

let swapTimer = 0
export function setLang(l: Lang) {
  if (l === LANG) return
  const swap = () => {
    LANG = l
    try { localStorage.setItem(KEY, l) } catch { /* storage unavailable */ }
    apply()
    subs.forEach(f => f())
  }
  const root = document.documentElement
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return swap()
  // fade the page content out, swap the strings while it is invisible, fade back in (the navbar stays put so the switch itself never flickers)
  clearTimeout(swapTimer)
  root.classList.add('cf-lang-out')
  swapTimer = window.setTimeout(() => {
    swap()
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('cf-lang-out')))
  }, 170)
}

/** Subscribes the calling component to language changes; use `tx` for the strings themselves. */
export function useLang(): Lang {
  return useSyncExternalStore(f => { subs.add(f); return () => { subs.delete(f) } }, () => LANG)
}
