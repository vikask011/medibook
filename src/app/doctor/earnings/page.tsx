'use client'

import { useEffect, useState } from 'react'

type Appointment = { id: string; status: string; paymentStatus: string; createdAt: string; slot: { date: string; startTime: string }; patient: { name: string }; doctor: { consultationFee: number } }

export default function EarningsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/appointments').then(r => r.json()).then(d => { setAppointments(d.appointments || []); setLoading(false) })
  }, [])

  const paid = appointments.filter(a => a.paymentStatus === 'paid')
  const total = paid.reduce((s, a) => s + (a.doctor?.consultationFee || 0), 0)
  const thisMonth = paid.filter(a => new Date(a.createdAt).getMonth() === new Date().getMonth())
  const monthTotal = thisMonth.reduce((s, a) => s + (a.doctor?.consultationFee || 0), 0)

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Earnings</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Your revenue breakdown</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Earnings', value: `₹${total}`, sub: 'All time' },
          { label: 'This Month', value: `₹${monthTotal}`, sub: new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' }) },
          { label: 'Total Appointments', value: paid.length, sub: 'Paid' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>{s.label}</p>
            <p style={{ fontSize: 28, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>{s.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8' }}>{s.sub}</p>
          </div>
        ))}
      </div>
      {loading ? <div style={{ textAlign: 'center', color: '#94a3b8' }}>Loading...</div> : paid.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0' }}>No earnings yet</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Patient', 'Date', 'Time', 'Amount', 'Status'].map(h => <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 500, color: '#64748b' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {paid.map(a => (
                <tr key={a.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>{a.patient.name}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{new Date(a.slot.date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{a.slot.startTime}</td>
                  <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1e293b' }}>₹{a.doctor?.consultationFee || 0}</td>
                  <td style={{ padding: '14px 20px' }}><span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: '#f0fdf4', color: '#16a34a' }}>Paid</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
