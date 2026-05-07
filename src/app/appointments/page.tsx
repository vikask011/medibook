
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Review = { id: string; rating: number; comment: string | null }

type Appointment = {
  id: string; status: string; symptoms: string | null; createdAt: string
  documents: string[]
  slot: { date: string; startTime: string; endTime: string }
  doctor: { id: string; specialization: string; consultationFee: number; user: { name: string; avatarUrl: string | null } }
  reviews: Review[]
}

const SC: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fefce8', color: '#ca8a04' }, confirmed: { bg: '#f0fdf4', color: '#16a34a' },
  completed: { bg: '#f0f9ff', color: '#0284c7' }, cancelled: { bg: '#fef2f2', color: '#dc2626' },
}

function isS3Key(value: string): boolean {
  return !value.startsWith('http://') && !value.startsWith('https://')
}

function docLabel(value: string, index: number): string {
  try {
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

async function fetchSignedUrl(key: string): Promise<string> {
  const res = await fetch('/api/documents/signed-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key }),
  })
  if (!res.ok) throw new Error('Failed to get signed URL')
  const data = await res.json()
  return data.url
}

async function resolveUrl(value: string): Promise<string> {
  if (isS3Key(value)) {
    return fetchSignedUrl(value)
  }
  // Legacy full URL — extract key from path
  try {
    const url = new URL(value)
    const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
    return fetchSignedUrl(key)
  } catch {
    return value
  }
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 30, padding: 0, color: star <= (hover || value) ? '#f59e0b' : '#e2e8f0', transition: 'color 0.1s' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function ReviewModal({ appointment, onClose, onSubmit }: {
  appointment: Appointment
  onClose: () => void
  onSubmit: (appointmentId: string, rating: number, comment: string) => Promise<void>
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating'); return }
    setSubmitting(true)
    await onSubmit(appointment.id, rating, comment)
    setSubmitting(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Rate your experience</h2>
          <p style={{ fontSize: 14, color: '#64748b' }}>Dr. {appointment.doctor.user.name} · {appointment.doctor.specialization}</p>
        </div>

        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 10 }}>Your rating</p>
          <StarPicker value={rating} onChange={setRating} />
          {error && <p style={{ fontSize: 12, color: '#dc2626', marginTop: 6 }}>{error}</p>}
        </div>

        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>Comment (optional)</label>
          <textarea
            rows={3}
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Share your experience with this doctor..."
            style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 12px', fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 1, background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontSize: 14, fontWeight: 500, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
          <button
            onClick={onClose}
            style={{ padding: '12px 20px', border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, color: '#64748b', background: '#fff', cursor: 'pointer' }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}

// Document section component with signed URL support
function DocumentsSection({ documents }: { documents: string[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [openingDoc, setOpeningDoc] = useState<string | null>(null)

  if (!documents || documents.length === 0) return null

  const openDocument = async (value: string) => {
    try {
      setOpeningDoc(value)
      const url = await resolveUrl(value)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      alert('Could not open document. Please try again.')
    } finally {
      setOpeningDoc(null)
    }
  }

  const openLightbox = async (value: string) => {
    try {
      setOpeningDoc(value)
      const url = await resolveUrl(value)
      setLightbox(url)
    } catch {
      alert('Could not load image preview. Please try again.')
    } finally {
      setOpeningDoc(null)
    }
  }

  return (
    <>
      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, cursor: 'zoom-out' }}
        >
          <img src={lightbox} alt="Document preview" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }} />
          <button onClick={() => setLightbox(null)} style={{ position: 'fixed', top: 20, right: 24, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 22, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>📎 My Uploaded Documents</span>
          <span style={{ background: '#f0f9ff', color: '#0284c7', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, border: '1px solid #bae6fd' }}>
            {documents.length} {documents.length === 1 ? 'file' : 'files'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8 }}>
          {documents.map((docValue, i) => (
            <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden', background: '#f8fafc' }}>

              {/* Image preview */}
              {isImage(docValue) && (
                <div
                  onClick={() => openingDoc !== docValue && openLightbox(docValue)}
                  style={{ cursor: openingDoc === docValue ? 'wait' : 'zoom-in', height: 110, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 4 }}
                >
                  {openingDoc === docValue ? (
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>Loading…</span>
                  ) : (
                    <>
                      <span style={{ fontSize: 28 }}>🖼️</span>
                      <span style={{ fontSize: 10, color: '#64748b' }}>Click to preview</span>
                    </>
                  )}
                </div>
              )}

              {/* PDF icon */}
              {isPdf(docValue) && (
                <div style={{ height: 80, background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontSize: 28 }}>📄</span>
                  <span style={{ fontSize: 10, color: '#dc2626', fontWeight: 600 }}>PDF</span>
                </div>
              )}

              {/* Footer */}
              <div style={{ padding: '8px 10px', display: 'flex', alignItems: 'center', gap: 6, borderTop: '1px solid #e2e8f0' }}>
                <span style={{ flex: 1, fontSize: 11, color: '#374151', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {docLabel(docValue, i)}
                </span>
                <button
                  onClick={() => openingDoc !== docValue && openDocument(docValue)}
                  disabled={openingDoc === docValue}
                  style={{ background: openingDoc === docValue ? '#94a3b8' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 5, padding: '3px 9px', fontSize: 10, fontWeight: 600, cursor: openingDoc === docValue ? 'wait' : 'pointer', flexShrink: 0 }}
                >
                  {openingDoc === docValue ? '…' : 'Open'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetch('/api/appointments').then(r => r.json()).then(d => { setAppointments(d.appointments || []); setLoading(false) })
  }, [])

  const filtered = appointments.filter(a => {
    if (tab === 'upcoming') return ['pending', 'confirmed'].includes(a.status)
    if (tab === 'past') return a.status === 'completed'
    return a.status === 'cancelled'
  })

  const handleReviewSubmit = async (appointmentId: string, rating: number, comment: string) => {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, rating, comment }),
    })
    if (res.ok) {
      const data = await res.json()
      setAppointments(prev => prev.map(a =>
        a.id === appointmentId ? { ...a, reviews: [data.review] } : a
      ))
      setReviewTarget(null)
      setSuccessMsg('Thank you for your review!')
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 24px' }}>
      {reviewTarget && (
        <ReviewModal
          appointment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
        />
      )}

      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>My Appointments</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Track all your bookings</p>
      </div>

      {successMsg && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
          ✅ {successMsg}
        </div>
      )}

      <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f1f5f9', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        {(['upcoming', 'past', 'cancelled'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, textTransform: 'capitalize', background: tab === t ? '#fff' : 'transparent', color: tab === t ? '#1e293b' : '#64748b', boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.08)' : 'none' }}>{t}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📅</div>
          <p style={{ marginBottom: 16 }}>No {tab} appointments</p>
          {tab === 'upcoming' && <Link href="/doctors" style={{ background: '#0ea5e9', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>Find a Doctor</Link>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(appt => {
            const sc = SC[appt.status] || { bg: '#f1f5f9', color: '#64748b' }
            const alreadyReviewed = appt.reviews && appt.reviews.length > 0
            const myReview = alreadyReviewed ? appt.reviews[0] : null
            const docs = appt.documents || []

            return (
              <div key={appt.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: '#0ea5e9', flexShrink: 0, overflow: 'hidden' }}>
                      {appt.doctor.user.avatarUrl ? <img src={appt.doctor.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : appt.doctor.user.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Dr. {appt.doctor.user.name}</h3>
                      <p style={{ fontSize: 13, color: '#0ea5e9', marginBottom: 8 }}>{appt.doctor.specialization}</p>
                      <p style={{ fontSize: 13, color: '#64748b' }}>📅 {new Date(appt.slot.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })} &nbsp;·&nbsp; ⏰ {appt.slot.startTime} – {appt.slot.endTime}</p>
                      <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>💰 ₹{appt.doctor.consultationFee}</p>
                      {appt.symptoms && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Symptoms: {appt.symptoms}</p>}
                    </div>
                  </div>
                  <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: sc.bg, color: sc.color, textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{appt.status}</span>
                </div>

                {/* Documents — shown to patient for all statuses */}
                {docs.length > 0 && <DocumentsSection documents={docs} />}

                {appt.status === 'completed' && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: docs.length > 0 ? 'none' : '1px solid #f1f5f9' }}>
                    {alreadyReviewed && myReview ? (
                      <div style={{ background: '#fefce8', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, color: '#f59e0b', marginBottom: 2, letterSpacing: 2 }}>
                            {'★'.repeat(myReview.rating)}{'☆'.repeat(5 - myReview.rating)}
                          </div>
                          {myReview.comment && <p style={{ fontSize: 13, color: '#78716c', margin: 0 }}>{myReview.comment}</p>}
                        </div>
                        <span style={{ fontSize: 11, color: '#a8a29e', whiteSpace: 'nowrap', marginTop: 2 }}>Your review</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewTarget(appt)}
                        style={{ background: '#0ea5e9', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                      >
                        ⭐ Leave a Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
