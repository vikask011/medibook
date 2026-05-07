'use client'

import { useAuth } from '@/lib/auth-context'
import Link from 'next/link'

const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
)
const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const UserIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
)
const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
)

const cards = [
  { href: '/doctors', Icon: SearchIcon, title: 'Find a Doctor', desc: 'Browse verified doctors by specialization', color: '#f0f9ff', accent: '#0284c7' },
  { href: '/appointments', Icon: CalendarIcon, title: 'My Appointments', desc: 'View and manage your bookings', color: '#f0fdf4', accent: '#16a34a' },
  { href: '/profile', Icon: UserIcon, title: 'My Profile', desc: 'Update your personal information', color: '#faf5ff', accent: '#7c3aed' },
]

export default function DashboardPage() {
  const { user } = useAuth()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          {greeting}, {user?.name.split(' ')[0]}
        </h1>
        <p style={{ fontSize: 15, color: '#64748b' }}>What would you like to do today?</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {cards.map(({ href, Icon, title, desc, color, accent }) => (
          <Link key={href} href={href}
            style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, padding: 28, textDecoration: 'none', display: 'block', transition: 'box-shadow 0.2s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.09)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <div style={{ width: 48, height: 48, background: color, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, marginBottom: 18 }}>
              <Icon />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 6 }}>{title}</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 500, color: accent }}>
              Go <ArrowIcon />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
