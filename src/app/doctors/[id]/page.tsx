'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

type Review = {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  patient: { name: string }
}

type Doctor = {
  id: string
  specialization: string
  experienceYears: number
  consultationFee: number
  avgRating: number | null
  bio: string
  user: { id: string; name: string; avatarUrl: string | null }
  reviews: Review[]
}

type Slot = { id: string; startTime: string; endTime: string }

export default function DoctorPublicProfilePage() {
  const { id } = useParams()
  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [loading, setLoading] = useState(true)
  const [slotsLoading, setSlotsLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/doctors/${id}`)
      .then(res => res.json())
      .then(data => { setDoctor(data.doctor); setLoading(false) })
  }, [id])

  useEffect(() => {
    if (!selectedDate) return
    setSlotsLoading(true)
    fetch(`/api/doctors/${id}/slots?date=${selectedDate}`)
      .then(res => res.json())
      .then(data => { setSlots(data.slots || []); setSlotsLoading(false) })
  }, [selectedDate, id])

  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Loading...</div>
  if (!doctor) return <div style={{ textAlign: 'center', padding: '80px 0', color: '#94a3b8' }}>Doctor not found</div>

  const reviews = doctor.reviews || []
  const avgRating = typeof doctor.avgRating === 'number' ? doctor.avgRating : 0

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>

      {/* Doctor Info Card */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 16, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#0ea5e9', flexShrink: 0, overflow: 'hidden' }}>
            {doctor.user.avatarUrl
              ? <img src={doctor.user.avatarUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              : doctor.user.name.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Dr. {doctor.user.name}</h1>
            <p style={{ fontSize: 14, color: '#0ea5e9', fontWeight: 500, marginBottom: 12 }}>{doctor.specialization}</p>
            <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#64748b', marginBottom: 12, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ color: '#f59e0b' }}>★</span>
                <strong style={{ color: '#1e293b' }}>{avgRating.toFixed(1)}</strong>
                <span>({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </span>
              <span>🏥 {doctor.experienceYears} yrs exp</span>
              <span>💰 ₹{doctor.consultationFee}</span>
            </div>
            {doctor.bio && (
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{doctor.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, marginBottom: 20 }}>
        <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1e293b', marginBottom: 20 }}>Book an Appointment</h2>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {next7Days.map(date => (
            <button
              key={date}
              onClick={() => { setSelectedDate(date); setSelectedSlot('') }}
              style={{
                padding: '8px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer', border: '1px solid',
                borderColor: selectedDate === date ? '#0ea5e9' : '#e2e8f0',
                background: selectedDate === date ? '#0ea5e9' : '#fff',
                color: selectedDate === date ? '#fff' : '#64748b',
                fontWeight: selectedDate === date ? 500 : 400,
              }}
            >
              {new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
            </button>
          ))}
        </div>

        {selectedDate && (
          <>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 12 }}>Available Slots</p>
            {slotsLoading ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>Loading slots...</p>
            ) : slots.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8' }}>No slots available for this date</p>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                {slots.map(slot => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot.id)}
                    style={{
                      padding: '8px 16px', borderRadius: 10, fontSize: 13, cursor: 'pointer', border: '1px solid',
                      borderColor: selectedSlot === slot.id ? '#0ea5e9' : '#e2e8f0',
                      background: selectedSlot === slot.id ? '#0ea5e9' : '#fff',
                      color: selectedSlot === slot.id ? '#fff' : '#64748b',
                    }}
                  >
                    {slot.startTime} – {slot.endTime}
                  </button>
                ))}
              </div>
            )}
            {selectedSlot && (
              <Link
                href={`/book/${doctor.id}?slot=${selectedSlot}&date=${selectedDate}`}
                style={{ display: 'inline-block', background: '#0ea5e9', color: '#fff', padding: '10px 24px', borderRadius: 10, fontSize: 14, fontWeight: 500, textDecoration: 'none' }}
              >
                Proceed to Book →
              </Link>
            )}
          </>
        )}
      </div>

      {/* Reviews Section */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: '#1e293b' }}>Patient Reviews</h2>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#f59e0b', fontSize: 18 }}>★</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1e293b' }}>{avgRating.toFixed(1)}</span>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>/ 5</span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
            <p style={{ fontSize: 13 }}>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {reviews.map((review, i) => (
              <div
                key={review.id}
                style={{ paddingBottom: 18, marginBottom: 18, borderBottom: i < reviews.length - 1 ? '1px solid #f1f5f9' : 'none' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: '#0ea5e9', flexShrink: 0 }}>
                      {review.patient.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>{review.patient.name}</p>
                      <div style={{ fontSize: 14, letterSpacing: 1 }}>
                        <span style={{ color: '#f59e0b' }}>{'★'.repeat(review.rating)}</span>
                        <span style={{ color: '#e2e8f0' }}>{'★'.repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                  </div>
                  {review.createdAt && (
                    <span style={{ fontSize: 11, color: '#cbd5e1' }}>
                      {new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginTop: 8, paddingLeft: 44 }}>
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}