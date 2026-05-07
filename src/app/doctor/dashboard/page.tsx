'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const ClockIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const CurrencyIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)
const XIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

type Profile = {
  specialization: string
  experienceYears: number
  consultationFee: number
  bio: string
  user: { phone: string; avatarUrl: string | null }
}

const navCards = [
  { href: '/doctor/appointments', Icon: CalendarIcon, title: 'Appointments', desc: 'View and manage your schedule', color: '#f0f9ff', accent: '#0284c7' },
  { href: '/doctor/availability', Icon: ClockIcon, title: 'Set Availability', desc: 'Configure your weekly slots', color: '#f0fdf4', accent: '#16a34a' },
  { href: '/doctor/profile', Icon: UserIcon, title: 'My Profile', desc: 'Update bio, fee and specialization', color: '#faf5ff', accent: '#7c3aed' },
  { href: '/doctor/earnings', Icon: CurrencyIcon, title: 'Earnings', desc: 'View your revenue breakdown', color: '#fffbeb', accent: '#d97706' },
]

export default function DoctorDashboardPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [profileLoaded, setProfileLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/doctor/profile').then(r => r.json()).then(d => {
      if (d.profile) setProfile(d.profile)
      setProfileLoaded(true)
    })
  }, [])

  const missingFields = (): string[] => {
    if (!profile) return []
    const missing: string[] = []
    if (!profile.user?.phone) missing.push('Phone Number')
    if (!profile.specialization) missing.push('Specialization')
    if (!profile.experienceYears || profile.experienceYears === 0) missing.push('Years of Experience')
    if (!profile.consultationFee || profile.consultationFee === 0) missing.push('Consultation Fee')
    if (!profile.bio || profile.bio.trim().length < 20) missing.push('Bio (min 20 chars)')
    if (!profile.user?.avatarUrl) missing.push('Profile Photo')
    return missing
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const incomplete = missingFields()
  // Only show the banner once profile data has actually loaded
  const showIncomplete = profileLoaded && incomplete.length > 0

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>
          {greeting}, Dr. {user?.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 15, color: '#64748b' }}>Manage your practice from here</p>
      </div>

      {/* Only show this alert when profile is loaded AND has missing fields */}
      {showIncomplete && (
        <div style={{ background: '#fff7f7', border: '1.5px solid #fca5a5', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, background: '#fee2e2', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
              <AlertIcon />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#dc2626', marginBottom: 6 }}>
                Complete your profile to start accepting patients
              </p>
              <p style={{ fontSize: 13, color: '#b91c1c', marginBottom: 14, lineHeight: 1.6 }}>
                The following details are missing. Go to{' '}
                <Link href="/doctor/profile" style={{ color: '#dc2626', textDecoration: 'underline', fontWeight: 600 }}>My Profile</Link>{' '}
                to fill them in:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                {incomplete.map(f => (
                  <span key={f} style={{ background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 600, padding: '5px 12px', borderRadius: 20, border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <XIcon /> {f}
                  </span>
                ))}
              </div>
              <Link href="/doctor/profile" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#dc2626', color: '#fff', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
                Complete Profile <ArrowIcon />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Nav cards — always shown */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {navCards.map(({ href, Icon, title, desc, color, accent }) => (
          <Link key={href} href={href}
            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 28, textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 48, height: 48, background: color, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 18 }}>
              <Icon />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 14 }}>{desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: accent }}>
              Open <ArrowIcon />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}