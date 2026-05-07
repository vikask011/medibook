'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  const cards = [
    { href: '/admin/doctors', emoji: '🏥', title: 'Manage Doctors', desc: 'Verify new doctors and view all registrations' },
    { href: '/admin/users', emoji: '👥', title: 'Manage Users', desc: 'View all registered patients' },
  ]

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Admin Panel</h1>
        <p style={{ fontSize: 15, color: '#64748b' }}>Manage the MediBook platform</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {cards.map(c => (
          <Link key={c.href} href={c.href} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, textDecoration: 'none', display: 'block' }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>{c.emoji}</div>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 6 }}>{c.title}</h2>
            <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
