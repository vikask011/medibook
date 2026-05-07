'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Doctor = {
  id: string
  specialization: string
  experienceYears: number
  consultationFee: number
  avgRating: number
  bio: string
  user: { id: string; name: string; avatarUrl: string | null }
}

const specializations = ['All', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedic', 'Pediatrician', 'Psychiatrist', 'General Physician']

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState('All')

  useEffect(() => { fetchDoctors() }, [selected])

  const fetchDoctors = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (selected !== 'All') params.set('specialization', selected)
    if (search) params.set('search', search)
    const res = await fetch(`/api/doctors?${params}`)
    const data = await res.json()
    setDoctors(data.doctors || [])
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Find a Doctor</h1>
        <p style={{ fontSize: 15, color: '#64748b' }}>Browse and book from our verified doctors</p>
      </div>

      <form onSubmit={e => { e.preventDefault(); fetchDoctors() }} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          type="text" placeholder="Search by name or specialization..."
          style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 16px', fontSize: 14, color: '#1e293b', background: '#fff', outline: 'none' }}
          value={search} onChange={e => setSearch(e.target.value)}
        />
        <button type="submit" style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
          Search
        </button>
      </form>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {specializations.map(s => (
          <button key={s} onClick={() => setSelected(s)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid',
            borderColor: selected === s ? '#0ea5e9' : '#e2e8f0',
            background: selected === s ? '#0ea5e9' : '#fff',
            color: selected === s ? '#fff' : '#64748b',
            fontWeight: selected === s ? 500 : 400
          }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0' }}>Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0' }}>No doctors found</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {doctors.map(doctor => (
            <div key={doctor.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#0ea5e9', flexShrink: 0 }}>
                  {doctor.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Dr. {doctor.user.name}</div>
                  <div style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 500 }}>{doctor.specialization}</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', padding: '12px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: 16 }}>
                <span>⭐ {doctor.avgRating.toFixed(1)}</span>
                <span>{doctor.experienceYears} yrs exp</span>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>₹{doctor.consultationFee}</span>
              </div>

              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {doctor.bio || 'No bio available'}
              </p>

              <Link href={`/doctors/${doctor.id}`} style={{ display: 'block', textAlign: 'center', background: '#1e293b', color: '#fff', padding: '9px 0', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                View & Book
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
