'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('')
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json(); setLoading(false)
    if (!res.ok) { setError(data.error); return }
    if (data.user.role === 'patient') window.location.href = '/dashboard'
    else if (data.user.role === 'doctor') window.location.href = '/doctor/dashboard'
    else window.location.href = '/admin/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#f8fafc' }}>
      <div style={{ width: '45%', background: '#1e293b', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: '#0ea5e9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>M</span></div>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 17 }}>MediBook</span>
        </div>
        <div>
          <h1 style={{ color: '#fff', fontSize: 36, fontWeight: 700, lineHeight: 1.3, marginBottom: 16 }}>Healthcare at<br />your fingertips</h1>
          <p style={{ color: '#94a3b8', fontSize: 16 }}>Book appointments with verified doctors instantly.</p>
        </div>
        <p style={{ color: '#475569', fontSize: 13 }}>Trusted by 1000+ patients</p>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Sign in to your account</p>
          {error && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 8, marginBottom: 24, fontSize: 14 }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
              <input type="email" required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1e293b', background: '#fff', outline: 'none', boxSizing: 'border-box' }} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Password</label>
              <input type="password" required style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 14px', fontSize: 14, color: '#1e293b', background: '#fff', outline: 'none', boxSizing: 'border-box' }} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 0', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 24, textAlign: 'center' }}>Don't have an account?{' '}<Link href="/register" style={{ color: '#0ea5e9', fontWeight: 500, textDecoration: 'none' }}>Create one</Link></p>
        </div>
      </div>
    </div>
  )
}
