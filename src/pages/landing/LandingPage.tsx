import { useEffect, useState } from 'react'
import { Effects, Intro, Navbar } from './Chrome'
import Story from './Story'
import NewSections from './NewSections'
import { tx, useLang } from '../../i18n'
import './chrome.css'

type CF = { __cfHeroReady?: boolean; __cfStoryReady?: boolean; __cfLoaded?: boolean }

/* Blurred cover with a small spinner until the hero video and the story animation are both loaded. */
function Loader() {
  useLang()
  const w = window as unknown as CF
  const [done, setDone] = useState(() => !!w.__cfLoaded)
  const [gone, setGone] = useState(() => !!w.__cfLoaded)
  useEffect(() => {
    if (done) return
    const check = () => { if (w.__cfHeroReady && w.__cfStoryReady) finish() }
    const finish = () => { w.__cfLoaded = true; setDone(true); window.dispatchEvent(new Event('cf:loaded')) }
    window.addEventListener('cf:hero-ready', check)
    window.addEventListener('cf:story-ready', check)
    const t = window.setTimeout(finish, 20000) // never block the page forever
    check()
    return () => { window.removeEventListener('cf:hero-ready', check); window.removeEventListener('cf:story-ready', check); clearTimeout(t) }
  }, [done, w])
  useEffect(() => {
    if (!done) { document.documentElement.style.overflow = 'hidden'; return }
    document.documentElement.style.overflow = ''
    const t = window.setTimeout(() => setGone(true), 600)
    return () => clearTimeout(t)
  }, [done])
  if (gone) return null
  return <div className={`cf2-loader${done ? ' off' : ''}`} role="status" aria-label={tx('Loading')}><span className="cf2-loader-ring" /></div>
}

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  return (
    <div className="cf2root">
      <Loader />
      <Navbar />
      <Intro />
      <Story />
      <NewSections />
      <Effects />
    </div>
  )
}
