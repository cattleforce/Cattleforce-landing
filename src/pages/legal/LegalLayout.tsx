import { useEffect, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import brandLogoImg from '../../assets/brand-logo.png'
import './legal.css'

export interface TocEntry {
  id: string
  label: string
}

interface LegalLayoutProps {
  title: string
  effectiveDate: string
  toc: TocEntry[]
  summary: ReactNode
  children: ReactNode
}

export default function LegalLayout({ title, effectiveDate, toc, summary, children }: LegalLayoutProps) {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = `${title} — Cattle Force`
  }, [title])

  return (
    <div className="legal-page">
      <div className="legal-topbar">
        <Link to="/" className="legal-topbar-brand">
          <img src={brandLogoImg} alt="Cattle Force" />
        </Link>
        <div className="legal-topbar-links">
          <Link to="/privacy-policy" className={pathname === '/privacy-policy' ? 'active' : ''}>Privacy Policy</Link>
          <Link to="/terms" className={pathname === '/terms' ? 'active' : ''}>Terms &amp; Conditions</Link>
          <Link to="/" className="legal-back-link"><span className="full">Back to </span>Home</Link>
        </div>
      </div>

      <div className="legal-hero">
        <div className="legal-hero-inner">
          <p className="legal-eyebrow">Ashnix Technologies Private Limited</p>
          <h1>{title}</h1>
          <div className="legal-hero-meta">
            <span>Effective <strong>{effectiveDate}</strong></span>
            <span>Governing courts: <strong>Bengaluru, Karnataka</strong></span>
          </div>
        </div>
      </div>

      <div className="legal-layout">
        <nav className="legal-toc" aria-label={`${title} sections`}>
          <p className="legal-toc-title">Contents</p>
          <ol>
            {toc.map((entry, i) => (
              <li key={entry.id}>
                <a href={`#${entry.id}`}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  {entry.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <main className="legal-body">
          <div className="legal-summary">
            <h2>At a glance</h2>
            {summary}
          </div>

          {children}

          <footer className="legal-footer">
            <span>© {new Date().getFullYear()} Ashnix Technologies Private Limited. All rights reserved.</span>
            <a href="mailto:cattleeorcee@gmail.com">cattleeorcee@gmail.com</a>
          </footer>
        </main>
      </div>
    </div>
  )
}
