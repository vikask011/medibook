'use client'

import { useEffect, useState, useRef } from 'react'

const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const CameraIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const XIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const SaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
  </svg>
)

export default function PatientProfilePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', age: '', gender: '', bloodGroup: '', address: '' })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/patient/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        setForm({
          name: d.profile.name || '',
          email: d.profile.email || '',
          phone: d.profile.phone || '',
          age: d.profile.age ? String(d.profile.age) : '',
          gender: d.profile.gender || '',
          bloodGroup: d.profile.bloodGroup || '',
          address: d.profile.address || '',
        })
        setAvatar(d.profile.avatarUrl || null)
      }
      setLoading(false)
    })
  }, [])

  const missingFields = () => {
    const m = []
    if (!form.phone) m.push('Phone Number')
    if (!form.age) m.push('Age')
    if (!form.gender) m.push('Gender')
    if (!form.bloodGroup) m.push('Blood Group')
    if (!form.address) m.push('Address')
    return m
  }

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const url = ev.target?.result as string
      setAvatar(url)
      await fetch('/api/upload/avatar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ avatarUrl: url }) })
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage('')
    const res = await fetch('/api/patient/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false)
    setMessage(res.ok ? 'success' : 'error')
    setTimeout(() => setMessage(''), 3000)
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Loading...</div>

  const incomplete = missingFields()
  const inp = (style = {}) => ({ border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px', fontSize: 14, outline: 'none', width: '100%', color: '#0f172a', fontFamily: 'inherit', boxSizing: 'border-box' as const, ...style })

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>My Profile</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Keep your health information up to date</p>
      </div>

      {/* Incomplete warning */}
      {incomplete.length > 0 && (
        <div style={{ background: '#fff7f7', border: '1px solid #fca5a5', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#dc2626' }}>
            <AlertIcon />
            <span style={{ fontSize: 13.5, fontWeight: 700, color: '#dc2626' }}>Incomplete Profile</span>
          </div>
          <p style={{ fontSize: 12.5, color: '#b91c1c', marginBottom: 10, lineHeight: 1.55 }}>
            Complete your profile so doctors have the information they need during consultations.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {incomplete.map(f => (
              <span key={f} style={{ background: '#fee2e2', color: '#dc2626', fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 20, border: '1px solid #fca5a5', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <XIcon /> {f}
              </span>
            ))}
          </div>
        </div>
      )}

      {message === 'success' && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8, color: '#16a34a', fontSize: 13.5 }}>
          <CheckIcon /> Profile updated successfully!
        </div>
      )}
      {message === 'error' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '12px 16px', marginBottom: 20, color: '#dc2626', fontSize: 13.5 }}>
          Failed to update profile. Please try again.
        </div>
      )}

      {/* Avatar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#f0f9ff', border: '2px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 26, fontWeight: 700, color: '#0284c7', flexShrink: 0 }}>
          {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : form.name.charAt(0).toUpperCase() || '?'}
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', marginBottom: 2 }}>{form.name || 'Your Name'}</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>JPG or PNG, max 5MB</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          <button onClick={() => fileRef.current?.click()} style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <CameraIcon /> Upload Photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Full Name</label>
            <input style={inp()} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Phone</label>
            <input type="tel" style={inp()} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 00000 00000" />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Email</label>
          <input type="email" disabled style={inp({ background: '#f8fafc', color: '#94a3b8' })} value={form.email} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Age</label>
            <input type="number" min="1" max="120" style={inp()} value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} placeholder="e.g. 28" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Gender</label>
            <select style={inp({ cursor: 'pointer', background: '#fff' })} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option value="">Select gender</option>
              {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Blood Group</label>
          <select style={inp({ cursor: 'pointer', background: '#fff' })} value={form.bloodGroup} onChange={e => setForm({ ...form, bloodGroup: e.target.value })}>
            <option value="">Select blood group</option>
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 28 }}>
          <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Address</label>
          <textarea rows={2} style={{ ...inp(), resize: 'vertical' }} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your home address" />
        </div>

        <button type="submit" disabled={saving} style={{ background: saving ? '#94a3b8' : '#0284c7', color: '#fff', border: 'none', borderRadius: 11, padding: '12px 28px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s' }}>
          <SaveIcon /> {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
