'use client'

import { useEffect, useState } from 'react'

type Appointment = {
  id: string; status: string; symptoms: string | null; createdAt: string
  documents: string[]
  slot: { date: string; startTime: string; endTime: string }
  patient: { name: string; email: string; phone: string | null; avatarUrl: string | null }
}

const SC: Record<string, { bg: string; color: string; border: string }> = {
  pending:   { bg: '#fefce8', color: '#ca8a04', border: '#fde68a' },
  confirmed: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  completed: { bg: '#f0f9ff', color: '#0284c7', border: '#bae6fd' },
  cancelled: { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' },
}

// Determine if a stored value is an S3 key (not a full URL)
function isS3Key(value: string): boolean {
  return !value.startsWith('http://') && !value.startsWith('https://')
}

function docLabel(value: string, index: number): string {
  try {
    // Works for both full URLs and plain S3 keys
    const parts = value.split('/')
    const filename = decodeURIComponent(parts[parts.length - 1])
    const clean = filename.replace(/^\d+-[a-z0-9]+\./, '')
    return clean || `Document ${index + 1}`
  } catch {
    return `Document ${index + 1}`
  }
}

function isPdf(value: string) { return value.toLowerCase().includes('.pdf') }
function isImage(value: string) { return !!value.toLowerCase().match(/\.(jpg|jpeg|png)$/) }

async function getSignedUrl(key: string): Promise<string> {
  const res = await fetch('/api/documents/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })
  if (!res.ok) throw new Error('Failed to get signed URL')
  const data = await res.json()
  return data.url
}

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'pending' | 'confirmed' | 'completed' | 'cancelled'>('pending')
  const [updating, setUpdating] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [openingDoc, setOpeningDoc] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/appointments')
      .then(r => r.json())
      .then(d => { setAppointments(d.appointments || []); setLoading(false) })
  }, [])

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id)
    const res = await fetch(`/api/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setUpdating(null)
  }

  // Open a document — fetches a signed URL if value is an S3 key, otherwise opens directly
  const openDocument = async (value: string) => {
    try {
      setOpeningDoc(value)
      if (isS3Key(value)) {
        const signedUrl = await getSignedUrl(value)
        window.open(signedUrl, '_blank', 'noopener,noreferrer')
      } else {
        // Legacy: full URL already stored — still try to get signed URL using key extracted from URL
        try {
          const url = new URL(value)
          const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
          const signedUrl = await getSignedUrl(key)
          window.open(signedUrl, '_blank', 'noopener,noreferrer')
        } catch {
          window.open(value, '_blank', 'noopener,noreferrer')
        }
      }
    } catch (err) {
      alert('Could not open document. Please try again.')
    } finally {
      setOpeningDoc(null)
    }
  }

  // Open image in lightbox — also needs signed URL
  const openLightbox = async (value: string) => {
    try {
      setOpeningDoc(value)
      if (isS3Key(value)) {
        const signedUrl = await getSignedUrl(value)
        setLightbox(signedUrl)
      } else {
        try {
          const url = new URL(value)
          const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
          const signedUrl = await getSignedUrl(key)
          setLightbox(signedUrl)
        } catch {
          setLightbox(value)
        }
      }
    } catch {
      alert('Could not load image preview. Please try again.')
    } finally {
      setOpeningDoc(null)
    }
  }

  const filtered = appointments.filter(a => a.status === tab)
  const counts = {
    pending:   appointments.filter(a => a.status === 'pending').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

      {/* Lightbox for image preview */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <img src={lightbox} alt="Document preview" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 20, right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Appointments</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Review patient details and documents before accepting</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 14px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1e293b' : '#64748b', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>
            {t}
            {counts[t] > 0 && (
              <span style={{ background: tab === t ? '#0ea5e9' : '#e2e8f0', color: tab === t ? '#fff' : '#64748b', borderRadius: 10, padding: '1px 7px', fontSize: 11, marginLeft: 5 }}>
                {counts[t]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p>No {tab} appointments</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map(appt => {
            const sc = SC[appt.status] || SC.pending
            const docs = appt.documents || []

            return (
              <div key={appt.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>

                {/* Top status bar */}
                <div style={{ background: sc.bg, borderBottom: `1px solid ${sc.border}`, padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: sc.color, textTransform: 'capitalize', letterSpacing: 0.3 }}>
                    ● {appt.status}
                  </span>
                  <span style={{ fontSize: 12, color: sc.color, opacity: 0.8 }}>
                    Booked {new Date(appt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                <div style={{ padding: 24 }}>

                  {/* Patient info + slot */}
                  <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: '#64748b', flexShrink: 0, overflow: 'hidden' }}>
                      {appt.patient.avatarUrl
                        ? <img src={appt.patient.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                        : appt.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>{appt.patient.name}</h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, fontSize: 13, color: '#64748b' }}>
                        <span>✉️ {appt.patient.email}</span>
                        {appt.patient.phone && <span>📞 {appt.patient.phone}</span>}
                      </div>
                    </div>
                    {/* Slot badge */}
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, padding: '10px 16px', textAlign: 'center', flexShrink: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>
                        {new Date(appt.slot.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </p>
                      <p style={{ fontSize: 12, color: '#0ea5e9', fontWeight: 500 }}>
                        {appt.slot.startTime} – {appt.slot.endTime}
                      </p>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {appt.symptoms && (
                    <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#92400e', marginBottom: 4 }}>🩺 Patient Symptoms</p>
                      <p style={{ fontSize: 14, color: '#78350f', lineHeight: 1.6 }}>{appt.symptoms}</p>
                    </div>
                  )}

                  {/* Documents */}
                  {docs.length > 0 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>📎 Attached Documents</span>
                        <span style={{ background: '#f0f9ff', color: '#0284c7', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, border: '1px solid #bae6fd' }}>
                          {docs.length} {docs.length === 1 ? 'file' : 'files'}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        {docs.map((docValue, i) => (
                          <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', background: '#f8fafc' }}>

                            {/* Image — click to open lightbox via signed URL */}
                            {isImage(docValue) && (
                              <div
                                onClick={() => openingDoc !== docValue && openLightbox(docValue)}
                                style={{ cursor: openingDoc === docValue ? 'wait' : 'zoom-in', background: '#f1f5f9', height: 140, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              >
                                {openingDoc === docValue ? (
                                  <span style={{ fontSize: 13, color: '#94a3b8' }}>Loading…</span>
                                ) : (
                                  <div style={{ width: '100%', height: '100%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 6 }}>
                                    <span style={{ fontSize: 32 }}>🖼️</span>
                                    <span style={{ fontSize: 11, color: '#64748b' }}>Click to preview</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* PDF */}
                            {isPdf(docValue) && (
                              <div style={{ height: 100, background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <span style={{ fontSize: 36 }}>📄</span>
                                <span style={{ fontSize: 11, color: '#dc2626', fontWeight: 600 }}>PDF Document</span>
                              </div>
                            )}

                            {/* File footer with name + open button */}
                            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 8, borderTop: '1px solid #e2e8f0' }}>
                              <span style={{ flex: 1, fontSize: 12, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {docLabel(docValue, i)}
                              </span>
                              <button
                                onClick={() => openingDoc !== docValue && openDocument(docValue)}
                                disabled={openingDoc === docValue}
                                style={{ background: openingDoc === docValue ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 11, fontWeight: 600, cursor: openingDoc === docValue ? 'wait' : 'pointer', flexShrink: 0 }}
                              >
                                {openingDoc === docValue ? '…' : 'Open'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No documents note */}
                  {docs.length === 0 && (
                    <div style={{ background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: 10, padding: '10px 16px', marginBottom: 16, fontSize: 13, color: '#94a3b8' }}>
                      📎 No documents attached by patient
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f1f5f9' }}>
                    {appt.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(appt.id, 'confirmed')}
                          disabled={updating === appt.id}
                          style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: updating === appt.id ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
                        >
                          ✓ Accept Appointment
                        </button>
                        <button
                          onClick={() => updateStatus(appt.id, 'cancelled')}
                          disabled={updating === appt.id}
                          style={{ background: '#fff', color: '#dc2626', border: '1.5px solid #fecaca', borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}
                        >
                          ✕ Decline
                        </button>
                      </>
                    )}
                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => updateStatus(appt.id, 'completed')}
                        disabled={updating === appt.id}
                        style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', opacity: updating === appt.id ? 0.6 : 1 }}
                      >
                        ✓ Mark as Completed
                      </button>
                    )}
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}