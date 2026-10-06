import { useEffect } from 'react'
import { Effects, Intro, Navbar } from './Chrome'
import Story from './Story'
import NewSections from './NewSections'
import './chrome.css'

export default function LandingPage() {
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  return (
    <div className="cf2root">
      <Navbar />
      <Intro />
      <Story />
      <NewSections />
      <Effects />
    </div>
  )
}
