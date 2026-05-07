'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'

const CalendarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
)
const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const ArrowRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const StethoscopeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)

const stats = [
  { value: '2,500+', label: 'Patients Served' },
  { value: '150+', label: 'Verified Doctors' },
  { value: '15+', label: 'Specializations' },
  { value: '4.9★', label: 'Average Rating' },
]

const features = [
  { icon: <ShieldIcon />, title: 'Verified Doctors', desc: 'Every doctor on our platform is credential-verified and background-checked before they can accept patients.' },
  { icon: <CalendarIcon />, title: 'Instant Booking', desc: 'See real-time availability and book your slot in seconds. No phone calls, no waiting on hold.' },
  { icon: <ClockIcon />, title: '24/7 AI Health Support', desc: 'MediBot is available around the clock to answer health questions and guide you to the right specialist.' },
]

const specializations = [
  { name: 'Cardiology', icon: '🫀', color: '#fee2e2', accent: '#ef4444' },
  { name: 'Dermatology', icon: '🧴', color: '#fef3c7', accent: '#f59e0b' },
  { name: 'Neurology', icon: '🧠', color: '#ede9fe', accent: '#8b5cf6' },
  { name: 'Orthopedics', icon: '🦴', color: '#dbeafe', accent: '#3b82f6' },
  { name: 'Pediatrics', icon: '👶', color: '#dcfce7', accent: '#22c55e' },
  { name: 'Psychiatry', icon: '🧘', color: '#fce7f3', accent: '#ec4899' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (loading) return
    if (user) {
      if (user.role === 'patient') router.replace('/dashboard')
      else if (user.role === 'doctor') router.replace('/doctor/dashboard')
      else router.replace('/admin/dashboard')
    }
  }, [user, loading])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading || user) return null

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#fff', color: '#0f172a' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Fraunces:wght@700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .hero-btn-primary { background: #0284c7; color: #fff; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: background 0.2s, transform 0.15s, box-shadow 0.2s; box-shadow: 0 4px 16px rgba(2,132,199,0.3); }
        .hero-btn-primary:hover { background: #0369a1; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2,132,199,0.4); }
        .hero-btn-ghost { background: transparent; color: #0f172a; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 500; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: border-color 0.2s, background 0.2s; text-decoration: none; }
        .hero-btn-ghost:hover { border-color: #0ea5e9; background: #f0f9ff; }
        .feature-card { background: #fff; border: 1px solid #f1f5f9; border-radius: 20px; padding: 32px; transition: box-shadow 0.25s, transform 0.2s; }
        .feature-card:hover { box-shadow: 0 12px 40px rgba(0,0,0,0.09); transform: translateY(-3px); }
        .spec-card { border-radius: 16px; padding: 24px 20px; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; text-align: center; }
        .spec-card:hover { transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        .stat-num { font-family: 'Fraunces', serif; font-size: 40px; font-weight: 800; color: #0284c7; line-height: 1; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fadeUp 0.7s ease both; }
        .fade-up-1 { animation-delay: 0.1s; }
        .fade-up-2 { animation-delay: 0.2s; }
        .fade-up-3 { animation-delay: 0.3s; }
        .pill-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0f9ff; border: 1px solid #bae6fd; color: #0369a1; font-size: 12.5px; font-weight: 600; padding: 6px 14px; border-radius: 20px; }
        .check-item { display: flex; align-items: center; gap: 10px; font-size: 14px; color: #475569; }
        .check-item .check-icon { width: 22px; height: 22px; background: #dcfce7; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #16a34a; flex-shrink: 0; }
      `}</style>

      {/* HERO */}
      <section style={{ background: 'linear-gradient(160deg, #f0f9ff 0%, #fff 50%, #f8fafc 100%)', minHeight: '92vh', display: 'flex', alignItems: 'center', paddingTop: 32, paddingBottom: 64, overflow: 'hidden', position: 'relative' }}>
        {/* decorative blobs */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, left: -80, width: 320, height: 320, background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%' }}>
          {/* Left */}
          <div>
            <div className="pill-badge fade-up" style={{ marginBottom: 24 }}>
              <HeartIcon />
              Trusted Healthcare Platform
            </div>
            <h1 className="fade-up fade-up-1" style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(40px,5vw,62px)', fontWeight: 900, lineHeight: 1.1, color: '#0f172a', marginBottom: 20 }}>
              Your Health,<br />
              <span style={{ color: '#0284c7' }}>Our Priority</span>
            </h1>
            <p className="fade-up fade-up-2" style={{ fontSize: 17, color: '#64748b', lineHeight: 1.7, marginBottom: 32, maxWidth: 460 }}>
              Book appointments with top-rated, verified doctors in minutes. Real-time availability, instant confirmation, AI health guidance.
            </p>
            <div className="fade-up fade-up-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40 }}>
              <Link href="/register" className="hero-btn-primary">
                Get Started Free <ArrowRightIcon />
              </Link>
              <Link href="/login" className="hero-btn-ghost">
                Sign In
              </Link>
            </div>
            <div className="fade-up" style={{ animationDelay: '0.4s', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['No credit card required', 'Free for patients', 'Cancel anytime'].map(t => (
                <div key={t} className="check-item">
                  <div className="check-icon"><CheckIcon /></div>
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', animation: 'float 5s ease-in-out infinite' }}>
              <div style={{ width: 340, background: '#fff', borderRadius: 24, boxShadow: '0 24px 80px rgba(0,0,0,0.12)', padding: 28, border: '1px solid #f1f5f9' }}>
                {/* Mock appointment card */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <StethoscopeIcon />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, color: '#0f172a' }}>Dr. Priya Sharma</div>
                    <div style={{ fontSize: 12.5, color: '#64748b' }}>Cardiologist • 12 yrs exp</div>
                  </div>
                  <div style={{ marginLeft: 'auto', background: '#f0fdf4', color: '#16a34a', fontSize: 11.5, fontWeight: 600, padding: '4px 10px', borderRadius: 8, border: '1px solid #bbf7d0' }}>Verified</div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 14, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, fontWeight: 500 }}>NEXT AVAILABLE</div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Today, 3:00 PM</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                    {['3:00 PM', '4:30 PM', '5:00 PM'].map((t, i) => (
                      <div key={t} style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12.5, fontWeight: 500, background: i === 0 ? '#0284c7' : '#fff', color: i === 0 ? '#fff' : '#475569', border: i === 0 ? 'none' : '1px solid #e2e8f0', cursor: 'pointer' }}>{t}</div>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon />
                    <span style={{ fontSize: 13, color: '#64748b', marginLeft: 4 }}>4.9 (128 reviews)</span>
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>₹500</span>
                </div>
                <button style={{ width: '100%', background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 0', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
                  Book Appointment
                </button>
              </div>
              {/* floating badge */}
              <div style={{ position: 'absolute', top: -16, right: -20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>Online Now</span>
              </div>
              <div style={{ position: 'absolute', bottom: -14, left: -20, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '10px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <UserIcon />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0f172a' }}>+38 booked today</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ background: '#0f172a', padding: '48px 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32, textAlign: 'center' }}>
          {stats.map(s => (
            <div key={s.value}>
              <div className="stat-num">{s.value}</div>
              <div style={{ fontSize: 13.5, color: '#94a3b8', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '96px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="pill-badge" style={{ marginBottom: 16, display: 'inline-flex' }}>Why MediBook</div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
              Built for better healthcare
            </h2>
            <p style={{ fontSize: 16, color: '#64748b', maxWidth: 500, margin: '0 auto' }}>
              Everything you need to take control of your health journey, in one place.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {features.map(f => (
              <div key={f.title} className="feature-card">
                <div style={{ width: 52, height: 52, background: '#f0f9ff', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', marginBottom: 20 }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 10 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SPECIALIZATIONS */}
      <section style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Find the right specialist</h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>Browse doctors across all major medical specializations</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 16 }}>
            {specializations.map(s => (
              <Link key={s.name} href="/register" style={{ textDecoration: 'none' }}>
                <div className="spec-card" style={{ background: s.color }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: s.accent }}>{s.name}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '96px 24px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(26px,3.5vw,40px)', fontWeight: 800, color: '#0f172a', marginBottom: 12 }}>Up and running in 3 steps</h2>
            <p style={{ fontSize: 15, color: '#64748b' }}>Getting care has never been this simple</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }}>
            {[
              { num: '01', icon: <UserIcon />, title: 'Create your account', desc: 'Sign up free in under a minute. No credit card needed.' },
              { num: '02', icon: <StethoscopeIcon />, title: 'Find your doctor', desc: 'Browse verified specialists filtered by your needs and location.' },
              { num: '03', icon: <CalendarIcon />, title: 'Book instantly', desc: 'Pick an available slot and get immediate confirmation.' },
            ].map(step => (
              <div key={step.num} style={{ textAlign: 'center' }}>
                <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
                  <div style={{ width: 64, height: 64, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', margin: '0 auto' }}>
                    {step.icon}
                  </div>
                  <div style={{ position: 'absolute', top: -8, right: -8, width: 24, height: 24, background: '#0f172a', color: '#fff', borderRadius: 8, fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '-0.5px' }}>{step.num}</div>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '96px 24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 60%)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(30px,4vw,52px)', fontWeight: 900, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>
            Start your health journey today
          </h2>
          <p style={{ fontSize: 16, color: '#94a3b8', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of patients who trust MediBook for reliable, quick access to verified healthcare.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register" className="hero-btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
              Create Free Account <ArrowRightIcon />
            </Link>
            <Link href="/login" style={{ color: '#94a3b8', fontSize: 15, fontWeight: 500, padding: '14px 24px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              Already have an account →
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#0f172a', borderTop: '1px solid #1e293b', padding: '32px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#0ea5e9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>M</span>
            </div>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>MediBook</span>
          </div>
          <p style={{ fontSize: 13, color: '#475569' }}>© 2026 MediBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
