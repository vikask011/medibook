'use client'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { usePathname } from 'next/navigation'

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const LogOutIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const pathname = usePathname()
  const a = (p: string) => pathname.startsWith(p)

  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: 'linear-gradient(135deg,#0ea5e9,#0284c7)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 16, letterSpacing: '-0.3px' }}>MediBook</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {loading ? null : user ? (
            <>
              {user.role === 'patient' && (
                <>
                  <NL href="/dashboard" active={a('/dashboard')}>Dashboard</NL>
                  <NL href="/doctors" active={a('/doctors')}>Find Doctors</NL>
                  <NL href="/appointments" active={a('/appointments')}>Appointments</NL>
                  <Link href="/notifications" style={{ padding: '6px 10px', borderRadius: 8, display: 'flex', alignItems: 'center', color: a('/notifications') ? '#0ea5e9' : '#64748b', textDecoration: 'none', background: a('/notifications') ? '#f0f9ff' : 'transparent' }}>
                    <BellIcon />
                  </Link>
                </>
              )}
              {user.role === 'doctor' && (
                <>
                  <NL href="/doctor/dashboard" active={a('/doctor/dashboard')}>Dashboard</NL>
                  <NL href="/doctor/appointments" active={a('/doctor/appointments')}>Appointments</NL>
                  <NL href="/doctor/availability" active={a('/doctor/availability')}>Availability</NL>
                  <NL href="/doctor/earnings" active={a('/doctor/earnings')}>Earnings</NL>
                  <NL href="/doctor/profile" active={a('/doctor/profile')}>Profile</NL>
                </>
              )}
              {user.role === 'admin' && (
                <>
                  <NL href="/admin/dashboard" active={a('/admin/dashboard')}>Dashboard</NL>
                  <NL href="/admin/doctors" active={a('/admin/doctors')}>Doctors</NL>
                  <NL href="/admin/users" active={a('/admin/users')}>Users</NL>
                </>
              )}
              <div style={{ marginLeft: 12, paddingLeft: 12, borderLeft: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#f0f9ff', border: '1.5px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0284c7' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>{user.name.split(' ')[0]}</span>
                <button onClick={logout} style={{ fontSize: 12.5, color: '#64748b', background: 'none', border: '1px solid #e2e8f0', borderRadius: 8, cursor: 'pointer', padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <LogOutIcon /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <NL href="/login" active={a('/login')}>Login</NL>
              <Link href="/register" style={{ marginLeft: 8, background: '#0284c7', color: '#fff', fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 9, textDecoration: 'none', transition: 'background 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#0369a1')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0284c7')}
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

function NL({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ fontSize: 13.5, padding: '6px 12px', borderRadius: 8, textDecoration: 'none', fontWeight: active ? 600 : 400, color: active ? '#0284c7' : '#64748b', background: active ? '#f0f9ff' : 'transparent', transition: 'color 0.15s, background 0.15s' }}>
      {children}
    </Link>
  )
}
