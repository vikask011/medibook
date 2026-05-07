'use client'

import { useEffect, useState } from 'react'

type Doctor = {
  id: string
  specialization: string
  experienceYears: number
  consultationFee: number
  isVerified: boolean
  user: { id: string; name: string; email: string; phone: string | null; createdAt: string }
}

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all')

  useEffect(() => {
    fetch('/api/admin/doctors').then(res => res.json()).then(data => { setDoctors(data.doctors || []); setLoading(false) })
  }, [])

  const toggleVerify = async (doctorId: string, current: boolean) => {
    const res = await fetch(`/api/admin/doctors/${doctorId}/verify`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verified: !current })
    })
    if (res.ok) setDoctors(doctors.map(d => d.id === doctorId ? { ...d, isVerified: !current } : d))
  }

  const filtered = doctors.filter(d => filter === 'pending' ? !d.isVerified : filter === 'verified' ? d.isVerified : true)

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Manage Doctors</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Verify and manage doctor registrations</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(['all', 'pending', 'verified'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid', textTransform: 'capitalize',
            borderColor: filter === f ? '#0ea5e9' : '#e2e8f0',
            background: filter === f ? '#0ea5e9' : '#fff',
            color: filter === f ? '#fff' : '#64748b', fontWeight: filter === f ? 500 : 400
          }}>{f}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0' }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Doctor', 'Specialization', 'Fee', 'Experience', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 500, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(doctor => (
                <tr key={doctor.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 500, color: '#1e293b' }}>Dr. {doctor.user.name}</div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{doctor.user.email}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{doctor.specialization}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>₹{doctor.consultationFee}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{doctor.experienceYears} yrs</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                      background: doctor.isVerified ? '#f0fdf4' : '#fefce8',
                      color: doctor.isVerified ? '#16a34a' : '#ca8a04'
                    }}>
                      {doctor.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <button onClick={() => toggleVerify(doctor.id, doctor.isVerified)} style={{
                      padding: '5px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer', border: '1px solid',
                      borderColor: doctor.isVerified ? '#fecaca' : '#bbf7d0',
                      background: doctor.isVerified ? '#fef2f2' : '#f0fdf4',
                      color: doctor.isVerified ? '#dc2626' : '#16a34a'
                    }}>
                      {doctor.isVerified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
