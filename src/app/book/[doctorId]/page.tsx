'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Script from 'next/script'

type Doctor = { id: string; consultationFee: number; specialization: string; user: { name: string; avatarUrl: string | null } }
type Slot = { id: string; startTime: string; endTime: string; date: string }

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const MAX_SIZE_MB = 10

function FileIcon({ type }: { type: string }) {
  if (type === 'application/pdf') return <span style={{ fontSize: 20 }}>📄</span>
  return <span style={{ fontSize: 20 }}>🖼️</span>
}

export default function BookPage() {
  const { doctorId } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slotId = searchParams.get('slot')
  const date = searchParams.get('date')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [slot, setSlot] = useState<Slot | null>(null)
  const [symptoms, setSymptoms] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, slotRes] = await Promise.all([
          fetch(`/api/doctors/${doctorId}`),
          slotId ? fetch(`/api/slots/${slotId}`) : Promise.resolve(null),
        ])
        const docData = await docRes.json()
        setDoctor(docData.doctor)
        if (slotRes) { const slotData = await slotRes.json(); setSlot(slotData.slot) }
      } catch { setError('Failed to load booking details') }
      setPageLoading(false)
    }
    fetchData()
  }, [doctorId, slotId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('')
    const selected = Array.from(e.target.files || [])
    const combined = [...files, ...selected]

    if (combined.length > 5) { setFileError('Max 5 files allowed'); return }

    for (const f of selected) {
      if (!ALLOWED_TYPES.includes(f.type)) { setFileError(`"${f.name}" is not allowed. Use PDF, JPG, or PNG.`); return }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) { setFileError(`"${f.name}" exceeds ${MAX_SIZE_MB}MB limit.`); return }
    }

    setFiles(combined)
    // Reset input so same file can be re-selected after removal
    e.target.value = ''
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setFileError('')
  }

  const uploadDocuments = async (): Promise<string[]> => {
    if (files.length === 0) return []
    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    const res = await fetch('/api/upload/documents', { method: 'POST', body: formData })
    if (!res.ok) {
      const d = await res.json()
      throw new Error(d.error || 'Document upload failed')
    }
    const { urls } = await res.json()
    return urls
  }

  const handlePayment = async () => {
    if (!doctor) return
    if (!scriptLoaded) { setError('Payment system loading, please wait...'); return }
    setLoading(true); setError('')
    try {
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: doctor.consultationFee }),
      })
      if (!orderRes.ok) { setError('Failed to create payment order'); setLoading(false); return }
      const { order } = await orderRes.json()
      setLoading(false)

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: 'INR',
        name: 'MediBook',
        description: `Appointment with Dr. ${doctor.user.name}`,
        order_id: order.id,
        handler: async (response: any) => {
          setLoading(true)
          try {
            // Upload documents first, then book
            const documents = await uploadDocuments()
            const res = await fetch('/api/appointments', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ slotId, doctorId, symptoms, paymentId: response.razorpay_payment_id, documents }),
            })
            const data = await res.json()
            if (res.ok) router.push('/appointments')
            else { setError(data.error || 'Booking failed'); setLoading(false) }
          } catch (err: any) {
            setError(err.message || 'Something went wrong after payment')
            setLoading(false)
          }
        },
        prefill: {},
        theme: { color: '#0ea5e9' },
        modal: { ondismiss: () => setLoading(false) },
      }
      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', () => { setError('Payment failed. Please try again.'); setLoading(false) })
      rzp.open()
    } catch { setError('Something went wrong'); setLoading(false) }
  }

  if (pageLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <p>Loading booking details...</p>
      </div>
    </div>
  )

  if (!doctor) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', color: '#64748b' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
        <p>Doctor not found</p>
      </div>
    </div>
  )

  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '—'

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setScriptLoaded(true)} />

      <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '48px 24px' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>

          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Confirm Appointment</h1>
            <p style={{ fontSize: 14, color: '#64748b' }}>Review your booking details before payment</p>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 14 }}>
              {error}
            </div>
          )}

          {/* Doctor card */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#0ea5e9', flexShrink: 0, overflow: 'hidden' }}>
              {doctor.user.avatarUrl
                ? <img src={doctor.user.avatarUrl} style={{ width: 56, height: 56, borderRadius: 14, objectFit: 'cover' }} alt="doctor" />
                : doctor.user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 2 }}>Dr. {doctor.user.name}</h2>
              <p style={{ fontSize: 13, color: '#0ea5e9' }}>{doctor.specialization}</p>
            </div>
          </div>

          {/* Appointment details */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 16 }}>Appointment Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '📅', label: 'Date', value: formattedDate },
                { icon: '⏰', label: 'Time', value: slot ? `${slot.startTime} – ${slot.endTime}` : '—' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 14, color: '#64748b' }}>{row.icon} {row.label}</span>
                  <span style={{ fontSize: 14, color: '#1e293b', fontWeight: 500 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: '#1e293b' }}>Consultation Fee</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#0ea5e9' }}>₹{doctor.consultationFee}</span>
              </div>
            </div>
          </div>

          {/* Symptoms */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
              Describe your symptoms
              <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>optional</span>
            </label>
            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}>Help the doctor prepare for your visit</p>
            <textarea
              rows={4}
              style={{ width: '100%', border: '1px solid #e2e8f0', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', resize: 'none', boxSizing: 'border-box', fontFamily: 'inherit', color: '#1e293b', lineHeight: 1.5 }}
              placeholder="e.g. Chest pain for 2 days, shortness of breath, mild fever..."
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
            />
          </div>

          {/* Documents upload */}
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 24, marginBottom: 24 }}>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                Attach Documents
                <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 400, marginLeft: 8 }}>optional</span>
              </label>
              <p style={{ fontSize: 13, color: '#94a3b8' }}>
                Upload reports, prescriptions, or scans so the doctor can review them before your visit. PDF, JPG, PNG · Max 10MB each · Up to 5 files
              </p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '10px 14px' }}>
                    <FileIcon type={file.type} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</p>
                      <p style={{ fontSize: 11, color: '#94a3b8' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      onClick={() => removeFile(i)}
                      style={{ background: '#fef2f2', border: 'none', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', color: '#dc2626', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileError && (
              <p style={{ fontSize: 13, color: '#dc2626', marginBottom: 10 }}>⚠️ {fileError}</p>
            )}

            {/* Upload button */}
            {files.length < 5 && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1.5px dashed #bae6fd', borderRadius: 10, padding: '10px 18px', background: '#f0f9ff', color: '#0284c7', fontSize: 13, fontWeight: 500, cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                >
                  <span style={{ fontSize: 18 }}>📎</span>
                  {files.length === 0 ? 'Choose files to attach' : `Add more files (${files.length}/5)`}
                </button>
              </>
            )}
          </div>

          {/* Pay button */}
          <button
            onClick={handlePayment}
            disabled={loading}
            style={{
              width: '100%', background: loading ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none',
              borderRadius: 14, padding: '16px 0', fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s',
            }}
          >
            {loading ? <>Processing...</> : <>💳 Pay ₹{doctor.consultationFee} &amp; Book</>}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
            🔒 Secure payment powered by Razorpay
          </p>
        </div>
      </div>
    </>
  )
}