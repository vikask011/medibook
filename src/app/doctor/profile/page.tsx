'use client'

import { useEffect, useState, useRef } from 'react'

const SPECS = ['Cardiologist','Dermatologist','Neurologist','Orthopedic','Pediatrician','Psychiatrist','General Physician']

export default function DoctorProfilePage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', specialization: '', experienceYears: 0, consultationFee: 0, bio: '' })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/doctor/profile').then(r => r.json()).then(d => {
      if (d.profile) {
        setForm({ name: d.profile.user?.name || '', email: d.profile.user?.email || '', phone: d.profile.user?.phone || '', specialization: d.profile.specialization || '', experienceYears: d.profile.experienceYears || 0, consultationFee: d.profile.consultationFee || 0, bio: d.profile.bio || '' })
        setAvatar(d.profile.user?.avatarUrl || null)
      }
      setLoading(false)
    })
  }, [])

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
    e.preventDefault(); setSaving(true)
    const res = await fetch('/api/doctor/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    setSaving(false); setMessage(res.ok ? 'Profile updated successfully!' : 'Failed to update profile')
  }

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Loading...</div>

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>My Profile</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Update your professional information</p>
      </div>

      {message && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>{message}</div>}

      {/* Avatar */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#f0f9ff', border: '2px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontSize: 28, fontWeight: 700, color: '#0ea5e9' }}>
            {avatar ? <img src={avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="avatar" /> : form.name.charAt(0).toUpperCase() || 'D'}
          </div>
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: '#1e293b', marginBottom: 4 }}>Profile Photo</p>
          <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>JPG, PNG up to 5MB</p>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
          <button onClick={() => fileRef.current?.click()} style={{ background: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
            Upload Photo
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[{ label: 'Full Name', key: 'name', type: 'text' }, { label: 'Phone', key: 'phone', type: 'tel' }].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Email</label>
          <input type="email" disabled style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, background: '#f8fafc', color: '#94a3b8', boxSizing: 'border-box' }} value={form.email} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Specialization</label>
          <select style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', background: '#fff', boxSizing: 'border-box', cursor: 'pointer' }}
            value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
            <option value="">Select specialization</option>
            {SPECS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {[{ label: 'Experience (years)', key: 'experienceYears', type: 'number' }, { label: 'Consultation Fee (₹)', key: 'consultationFee', type: 'number' }].map(f => (
            <div key={f.key}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>{f.label}</label>
              <input type={f.type} min="0" style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                value={(form as any)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
            </div>
          ))}
        </div>
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Bio</label>
          <textarea rows={4} style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 8, padding: '9px 12px', fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
            value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Describe your expertise and experience..." />
        </div>
        <button type="submit" disabled={saving} style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 28px', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
