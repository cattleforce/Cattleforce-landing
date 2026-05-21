import { useEffect, useState } from 'react'
import {
  Eye, CheckSquare, BarChart3, Building2, Database,
  Check, Menu, X, Activity, Mail, Zap,
} from 'lucide-react'
import brandLogoImg from '../../assets/brand-logo.png'
import heroVideo from '../../assets/Herosection.mp4'
import dashboardImg from '../../assets/Dashboard.png'
import animalsImg from '../../assets/Animals.png'
import reproductionImg from '../../assets/Reproduction.png'
import milkImg from '../../assets/Milk.png'
import './landing.css'

const APP_URL = import.meta.env.VITE_APP_URL ?? 'https://app.cattleforce.in'

function useFadeIn() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add('visible')
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )
    document.querySelectorAll('.lp-fade-in, .lp-fade-left, .lp-fade-right').forEach((el) => {
      observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])
}


export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const [contactForm, setContactForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [contactStatus, setContactStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'activate'>('idle')

  async function handleContactSubmit(e: React.FormEvent) {
    e.preventDefault()
    setContactStatus('loading')
    try {
      const res = await fetch('https://formsubmit.co/ajax/cattleeforcee@gmail.com', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({
          name: contactForm.name,
          email: contactForm.email,
          company: contactForm.company || 'N/A',
          subject: contactForm.subject,
          message: contactForm.message,
          _subject: `[Cattle Force] ${contactForm.subject}`,
          _captcha: 'false',
          _template: 'table',
        }),
      })
      const data = await res.json()
      if (data.success === 'true' || data.success === true) {
        setContactStatus('success')
        setContactForm({ name: '', email: '', company: '', subject: '', message: '' })
      } else if (typeof data.message === 'string' && data.message.toLowerCase().includes('activat')) {
        setContactStatus('activate')
      } else {
        setContactStatus('error')
      }
    } catch {
      setContactStatus('error')
    }
  }

  useFadeIn()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return
    const id = hash.replace('#', '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth'
    return () => { document.documentElement.style.scrollBehavior = '' }
  }, [])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="landing-page">

      {/* ── NAVBAR ──────────────────────────────────── */}
      <nav className={`lp-nav${navScrolled ? ' lp-nav--scrolled' : ''}`}>
        <div className="lp-nav-inner">
          <a href="/" className="lp-nav-logo">
            <img src={brandLogoImg} alt="Cattle Force" className="lp-nav-wordmark" />
          </a>

          <div className="lp-nav-links">
            <a href="#pricing">Pricing</a>
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </div>

          <div className="lp-nav-actions">
            <a href={`${APP_URL}/login`} className="lp-nav-login">Login</a>
            <a href={`${APP_URL}/login`} className="lp-nav-cta">Start Managing Your Herd</a>
            <button
              className="lp-mobile-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div className={`lp-mobile-menu${mobileOpen ? ' open' : ''}`}>
        <a href="#pricing" onClick={() => setMobileOpen(false)}>Pricing</a>
        <a href="#features" onClick={() => setMobileOpen(false)}>Features</a>
        <a href="#about" onClick={() => setMobileOpen(false)}>About</a>
        <a href="#contact" onClick={() => setMobileOpen(false)}>Contact</a>
        <a href={`${APP_URL}/login`} onClick={() => setMobileOpen(false)}>Login</a>
        <a href={`${APP_URL}/login`} className="lp-mobile-cta" onClick={() => setMobileOpen(false)}>
          Start Managing Your Herd
        </a>
      </div>

      {/* ── HERO ────────────────────────────────────── */}
      <section className="lp-hero" id="hero">
        <video
          className="lp-hero-video"
          src={heroVideo}
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="lp-hero-content">
          <h1 className="lp-hero-headline">
            The operating system for<br />
            <em>modern cattle farms.</em>
          </h1>

          <p className="lp-hero-sub">
            A complete cattle management system built to track every animal,<br />every event, and every outcome.
          </p>

          <div className="lp-hero-ctas">
            <a href={`${APP_URL}/login`} className="lp-btn-primary">Start Managing Your Herd</a>
            <a href="#contact" className="lp-btn-secondary">Book a Demo</a>
          </div>

          <div className="lp-hero-trust">
            <p className="lp-hero-trust-label">
              Trusted by high-volume cattle operations across the Americas, Europe, and Asia
            </p>
            <div className="lp-trust-logos">
              {[
                { icon: '◆', name: 'Alta Terra'     },
                { icon: '⊕', name: 'Pampa Group'    },
                { icon: '✸', name: 'Herdenhaus'     },
                { icon: '◎', name: 'Lakewood Farms' },
                { icon: '✦', name: 'Rancho Sol'     },
              ].map(({ icon, name }) => (
                <span key={name} className="lp-trust-logo">
                  <span className="lp-trust-logo-icon">{icon}</span>
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── COMMAND SECTION ─────────────────────────── */}
      <section className="lp-section lp-command lp-above-hero" id="about">
        <div className="lp-container">
          <div className="lp-fade-in">
            <span className="lp-section-label">Total Operational Command</span>
            <h2 className="lp-section-title">
              Total control over your cattle operation.<br />
              Zero spreadsheets. No guesswork.
            </h2>
            <p className="lp-section-sub">
              Cattle Force replaces notebooks, Excel files, and disconnected tools with one
              system that keeps your entire operation in sync.
            </p>
          </div>

          {/* Dashboard screenshot */}
          <div className="lp-dashboard-mock lp-fade-in delay-1">
            <img src={dashboardImg} alt="Cattle Force Dashboard" className="lp-dashboard-img" />
          </div>
        </div>
      </section>

      {/* ── FEATURE BLOCKS ──────────────────────────── */}
      <section className="lp-section lp-features lp-above-hero" id="features">
        <div className="lp-container">

          {/* Block 1 — Animal Management */}
          <div className="lp-feature-block">
            <div className="lp-fade-left">
              <span className="lp-feature-tag">Animal Management</span>
              <h3 className="lp-feature-title">Know every animal instantly</h3>
              <p className="lp-feature-desc">
                Track identity, lineage, weight, lifecycle stage, and full history —
                all in one place, always up to date.
              </p>
            </div>
            <div className="lp-feature-mock lp-fade-right">
              <img src={animalsImg} alt="Animal Management" className="lp-feature-mock-img" />
            </div>
          </div>

          {/* Block 2 — Reproduction */}
          <div className="lp-feature-block reverse">
            <div className="lp-fade-right">
              <span className="lp-feature-tag">Reproduction Tracking</span>
              <h3 className="lp-feature-title">Never miss a breeding or calving</h3>
              <p className="lp-feature-desc">
                Track heat, AI, pregnancies, calving events, and offspring automatically —
                with complete lineage tracking from day one.
              </p>
            </div>
            <div className="lp-feature-mock lp-fade-left">
              <img src={reproductionImg} alt="Reproduction Tracking" className="lp-feature-mock-img" />
            </div>
          </div>

          {/* Block 3 — Milk Production */}
          <div className="lp-feature-block">
            <div className="lp-fade-left">
              <span className="lp-feature-tag">Production Monitoring</span>
              <h3 className="lp-feature-title">See milk performance clearly</h3>
              <p className="lp-feature-desc">
                Monitor daily yield per animal, per session, and over time.
                Identify trends, issues, and top performers instantly.
              </p>
            </div>
            <div className="lp-feature-mock lp-fade-right">
              <img src={milkImg} alt="Production Monitoring" className="lp-feature-mock-img" />
            </div>
          </div>

        </div>
      </section>

      {/* ── FEATURE GRID ────────────────────────────── */}
      <section className="lp-section lp-grid-section lp-above-hero" id="features-grid">
        <div className="lp-container">
          <div className="lp-fade-in">
            <h2 className="lp-section-title">Everything your operation runs on</h2>
          </div>
          <div className="lp-feature-grid">
            {[
              {
                icon: <Eye size={20} />,
                title: 'Herd Visibility',
                desc: 'See your entire herd in one system. Every animal, every status, always current.',
              },
              {
                icon: <Activity size={20} />,
                title: 'Event Tracking',
                desc: 'Log real-world activity as it happens. Nothing falls through the cracks.',
              },
              {
                icon: <CheckSquare size={20} />,
                title: 'Task Management',
                desc: 'Keep your team aligned on what needs to happen — and when.',
              },
              {
                icon: <BarChart3 size={20} />,
                title: 'Analytics',
                desc: 'Make decisions with real data. Performance trends, reproductive rates, yield analysis.',
              },
              {
                icon: <Building2 size={20} />,
                title: 'Multi-Farm Access',
                desc: 'Manage multiple farms and teams from a single operational view.',
              },
              {
                icon: <Database size={20} />,
                title: 'Bulk Operations',
                desc: 'Handle large herds without friction. Import, update, and export at scale.',
              },
            ].map((item, i) => (
              <div key={item.title} className={`lp-grid-card lp-fade-in delay-${(i % 3) + 1}`}>
                <div className="lp-grid-icon">{item.icon}</div>
                <div className="lp-grid-card-title">{item.title}</div>
                <p className="lp-grid-card-desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────── */}
      <section className="lp-section lp-testimonials lp-above-hero">
        <div className="lp-container">
          <div className="lp-fade-in">
            <h2 className="lp-section-title">Built for serious cattle operations</h2>
            <p className="lp-section-sub">
              Used by ranchers managing hundreds to thousands of animals daily
            </p>
          </div>
          <div className="lp-testi-grid">
            {[
              {
                quote: 'We run over 500 head, and this replaced three spreadsheets and a whiteboard. Everything is in one place now.',
                name: 'James R.',
                role: 'Ranch Manager, Texas',
                initials: 'JR',
              },
              {
                quote: 'Reproduction tracking alone paid for the system in the first season. We stopped missing events entirely.',
                name: 'Matías O.',
                role: 'Farm Owner, Argentina',
                initials: 'MO',
              },
              {
                quote: 'Now we actually trust our data. Everything is tracked, nothing gets lost — and the team can see the same information.',
                name: 'Sophie K.',
                role: 'Dairy Operator, Germany',
                initials: 'SK',
              },
            ].map((t) => (
              <div key={t.name} className="lp-testi-card lp-fade-in">
                <p className="lp-testi-quote">"{t.quote}"</p>
                <div className="lp-testi-author">
                  <div className="lp-testi-avatar">{t.initials}</div>
                  <div>
                    <div className="lp-testi-name">{t.name}</div>
                    <div className="lp-testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────── */}
      <section className="lp-section lp-pricing lp-above-hero" id="pricing">
        <div className="lp-container">
          <div className="lp-fade-in">
            <h2 className="lp-section-title">Simple pricing that scales with your herd</h2>
            <p className="lp-section-sub">
              No per-animal surprises. Clear pricing as your operation grows.
            </p>
          </div>
          <div className="lp-pricing-grid">

            {/* Starter */}
            <div className="lp-plan-card lp-fade-in delay-1">
              <div className="lp-plan-name">Starter</div>
              <p className="lp-plan-tagline">For growing farms getting organized</p>
              <div className="lp-plan-price">
                <span className="lp-plan-currency">$</span>
                <span className="lp-plan-amount">79</span>
                <span className="lp-plan-period">/mo</span>
              </div>
              <a href={`${APP_URL}/login`} className="lp-plan-cta ghost">Start Managing</a>
              <div className="lp-plan-divider" />
              <div className="lp-plan-features">
                {['Up to 100 animals', 'Core tracking modules', '2 users', 'CSV exports', 'Email support'].map((f) => (
                  <div key={f} className="lp-plan-feature">
                    <Check size={14} className="lp-check-icon" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Ranch — highlighted */}
            <div className="lp-plan-card featured lp-fade-in delay-2">
              <div className="lp-plan-badge">Most Popular</div>
              <div className="lp-plan-name">Ranch</div>
              <p className="lp-plan-tagline">For active, high-volume operations</p>
              <div className="lp-plan-price">
                <span className="lp-plan-currency">$</span>
                <span className="lp-plan-amount">149</span>
                <span className="lp-plan-period">/mo</span>
              </div>
              <a href={`${APP_URL}/login`} className="lp-plan-cta primary">Start Managing</a>
              <div className="lp-plan-divider" />
              <div className="lp-plan-features">
                {[
                  'Up to 1,000 animals',
                  'Full system + analytics',
                  'Multi-user access',
                  'Investor visibility',
                  'Reproduction & milk modules',
                  'Priority support',
                ].map((f) => (
                  <div key={f} className="lp-plan-feature">
                    <Check size={14} className="lp-check-icon" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Enterprise */}
            <div className="lp-plan-card lp-fade-in delay-3">
              <div className="lp-plan-name">Enterprise</div>
              <p className="lp-plan-tagline">For multi-farm and large-scale operations</p>
              <div className="lp-plan-custom">Custom</div>
              <a href="#contact" className="lp-plan-cta ghost">Talk to Sales</a>
              <div className="lp-plan-divider" />
              <div className="lp-plan-features">
                {[
                  'Unlimited animals & farms',
                  'Custom integrations',
                  'Dedicated support',
                  'SLA guarantee',
                  'On-boarding assistance',
                  'API access',
                ].map((f) => (
                  <div key={f} className="lp-plan-feature">
                    <Check size={14} className="lp-check-icon" />
                    {f}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── VALUE BLOCK ─────────────────────────────── */}
      <section className="lp-section-sm lp-value lp-above-hero">
        <div className="lp-container">
          <div className="lp-fade-in" style={{ textAlign: 'center' }}>
            <h2 className="lp-section-title">From field activity to full visibility</h2>
            <p className="lp-section-sub" style={{ marginBottom: 0 }}>
              Capture what happens on the ground and turn it into clear, reliable
              operational insight — without extra work.
            </p>
          </div>
          <div className="lp-value-bullets lp-fade-in delay-1">
            {[
              { label: 'Real-time updates', desc: 'Changes reflect instantly across your team' },
              { label: 'Connected system', desc: 'Every module shares the same data source' },
              { label: 'Operational clarity', desc: 'Always know exactly what\'s happening on farm' },
            ].map((b) => (
              <div key={b.label} className="lp-value-bullet">
                <div className="lp-value-bullet-dot" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--lp-text)', fontSize: 15 }}>{b.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--lp-text-muted)', marginTop: 2 }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ─────────────────────────────────── */}
      <section className="lp-section lp-contact lp-above-hero" id="contact">
        <div className="lp-container">
          <div className="lp-contact-layout">

            {/* Left — info */}
            <div className="lp-contact-info lp-fade-left">
              <span className="lp-section-label">Contact Us</span>
              <h2 className="lp-contact-heading">
                Let's talk about<br />your operation
              </h2>
              <p className="lp-contact-desc">
                Whether you're ready to get started, want a personalised demo, or have a
                question about how Cattle Force fits your farm — we'd love to hear from you.
              </p>
              <div className="lp-contact-detail-list">
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon"><Mail size={18} /></div>
                  <div>
                    <div className="lp-contact-detail-label">Email us</div>
                    <a href="mailto:cattleeforcee@gmail.com" className="lp-contact-detail-value">
                      cattleeforcee@gmail.com
                    </a>
                  </div>
                </div>
                <div className="lp-contact-detail">
                  <div className="lp-contact-detail-icon"><Zap size={18} /></div>
                  <div>
                    <div className="lp-contact-detail-label">Response time</div>
                    <div className="lp-contact-detail-value">Within 24 hours</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div className="lp-contact-form-wrap lp-fade-right">
              {contactStatus === 'success' ? (
                <div className="lp-contact-success">
                  <div className="lp-contact-success-icon"><Check size={28} /></div>
                  <h3>Message sent!</h3>
                  <p>Thanks for reaching out. We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="lp-contact-form">
                  <div className="lp-form-row">
                    <div className="lp-form-group">
                      <label className="lp-form-label">Full name *</label>
                      <input
                        type="text"
                        className="lp-form-input"
                        placeholder="John Smith"
                        value={contactForm.name}
                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="lp-form-group">
                      <label className="lp-form-label">Email address *</label>
                      <input
                        type="email"
                        className="lp-form-input"
                        placeholder="john@yourfarm.com"
                        value={contactForm.email}
                        onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Farm / Company name</label>
                    <input
                      type="text"
                      className="lp-form-input"
                      placeholder="Demo Ranch LLC"
                      value={contactForm.company}
                      onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                    />
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Subject *</label>
                    <input
                      type="text"
                      className="lp-form-input"
                      placeholder="I'd like to book a demo"
                      value={contactForm.subject}
                      onChange={e => setContactForm(f => ({ ...f, subject: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="lp-form-group">
                    <label className="lp-form-label">Message *</label>
                    <textarea
                      className="lp-form-input lp-form-textarea"
                      placeholder="Tell us about your operation and how we can help..."
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      rows={5}
                      required
                    />
                  </div>
                  {contactStatus === 'activate' && (
                    <div className="lp-contact-error lp-contact-activate">
                      <strong>One more step:</strong> We just sent an activation email to our inbox.
                      Please click the confirmation link in that email, then submit your message again.
                    </div>
                  )}
                  {contactStatus === 'error' && (
                    <div className="lp-contact-error">
                      Something went wrong. Please try again or email us directly at{' '}
                      <a href="mailto:cattleeforcee@gmail.com">cattleeforcee@gmail.com</a>.
                    </div>
                  )}
                  <button
                    type="submit"
                    className="lp-btn-primary lp-contact-submit"
                    disabled={contactStatus === 'loading'}
                  >
                    {contactStatus === 'loading' ? 'Sending…' : contactStatus === 'activate' ? 'Try Again' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────── */}
      <section className="lp-section lp-final-cta lp-above-hero">
        <div className="lp-container">
          <div className="lp-fade-in">
            <h2 className="lp-final-headline">
              Run your entire cattle operation<br />on one system
            </h2>
            <p className="lp-final-sub">
              Start tracking your herd the way real operations actually work
            </p>
            <div className="lp-final-ctas">
              <a href={`${APP_URL}/login`} className="lp-btn-primary">Start Managing Your Herd</a>
              <a href="mailto:hello@cattleforce.com" className="lp-btn-secondary">Book a Demo</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer className="lp-footer lp-above-hero">
        <div className="lp-container">
          <div className="lp-footer-inner">
            <div className="lp-footer-logo">
              <img src={brandLogoImg} alt="Cattle Force" className="lp-nav-wordmark lp-nav-wordmark--sm" />
            </div>

            <div className="lp-footer-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#contact">Contact</a>
              <a href={`${APP_URL}/login`}>Login</a>
            </div>

            <div className="lp-footer-right">
              <div className="lp-footer-email">
                <a href="mailto:hello@cattleforce.com">hello@cattleforce.com</a>
              </div>
              <div className="lp-lang-toggle">
                <button className="lp-lang-btn active">EN</button>
                <button className="lp-lang-btn">ES</button>
              </div>
            </div>
          </div>

          <div className="lp-footer-copy">
            © {new Date().getFullYear()} Cattle Force. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  )
}
