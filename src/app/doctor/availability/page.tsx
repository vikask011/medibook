'use client'

import { useEffect, useState } from 'react'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
type Template = { dayOfWeek: number; startTime: string; endTime: string; slotDurationMins: number }

export default function AvailabilityPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  useEffect(() => {
    fetch('/api/doctor/availability').then(r => r.json()).then(d => setTemplates(d.templates || []))
  }, [])

  const isActive = (day: number) => templates.some(t => t.dayOfWeek === day)
  const getTemplate = (day: number) => templates.find(t => t.dayOfWeek === day)

  const toggleDay = (day: number) => {
    if (isActive(day)) setTemplates(templates.filter(t => t.dayOfWeek !== day))
    else setTemplates([...templates, { dayOfWeek: day, startTime: '09:00', endTime: '17:00', slotDurationMins: 30 }])
  }

  const update = (day: number, field: keyof Template, value: string | number) => {
    setTemplates(templates.map(t => t.dayOfWeek === day ? { ...t, [field]: value } : t))
  }

  const calcSlots = (t: Template) => {
    const [sh, sm] = t.startTime.split(':').map(Number)
    const [eh, em] = t.endTime.split(':').map(Number)
    return Math.max(0, Math.floor(((eh * 60 + em) - (sh * 60 + sm)) / t.slotDurationMins))
  }

  // Save templates then immediately generate slots — one action
  const saveAndGenerate = async () => {
    setSaving(true)
    setMessage('')
    try {
      // Step 1: save templates
      const saveRes = await fetch('/api/doctor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templates }),
      })
      if (!saveRes.ok) {
        const d = await saveRes.json()
        setMsgType('error'); setMessage(d.error || 'Failed to save availability')
        setSaving(false); return
      }

      // Step 2: auto-generate slots for next 30 days
      const genRes = await fetch('/api/doctor/generate-slots', { method: 'POST' })
      const genData = await genRes.json()

      if (genRes.ok) {
        setMsgType('success')
        setMessage(`✅ Availability saved and ${genData.message?.replace('Generated ', '') || 'slots generated'} — patients can now book immediately.`)
      } else {
        setMsgType('error'); setMessage(genData.error || 'Slots could not be generated')
      }
    } catch {
      setMsgType('error'); setMessage('Something went wrong')
    }
    setSaving(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Set Availability</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Configure your weekly schedule. Slots will be available to patients immediately after saving.</p>
      </div>

      {message && (
        <div style={{ background: msgType === 'success' ? '#f0fdf4' : '#fef2f2', border: `1px solid ${msgType === 'success' ? '#bbf7d0' : '#fecaca'}`, color: msgType === 'success' ? '#16a34a' : '#dc2626', padding: '12px 16px', borderRadius: 10, marginBottom: 24, fontSize: 14 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {DAYS.map((day, index) => (
          <div key={index} style={{ background: '#fff', border: `1px solid ${isActive(index) ? '#bae6fd' : '#e2e8f0'}`, borderRadius: 14, padding: '16px 20px', transition: 'border-color 0.2s' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isActive(index) ? 16 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', width: 90 }}>{day}</span>
                {isActive(index) && (
                  <span style={{ fontSize: 12, color: '#0ea5e9', background: '#f0f9ff', padding: '2px 10px', borderRadius: 20 }}>
                    {calcSlots(getTemplate(index)!)} slots/day
                  </span>
                )}
              </div>
              <button onClick={() => toggleDay(index)} style={{
                padding: '6px 18px', borderRadius: 20, fontSize: 12, cursor: 'pointer', border: '1px solid', fontWeight: 500,
                borderColor: isActive(index) ? '#0ea5e9' : '#e2e8f0',
                background: isActive(index) ? '#0ea5e9' : '#fff',
                color: isActive(index) ? '#fff' : '#64748b',
              }}>
                {isActive(index) ? '✓ Active' : 'Off'}
              </button>
            </div>

            {isActive(index) && (
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                {[
                  { label: 'Start Time', field: 'startTime' as keyof Template },
                  { label: 'End Time', field: 'endTime' as keyof Template },
                ].map(f => (
                  <div key={f.field}>
                    <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 500 }}>{f.label}</label>
                    <input type="time" style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#f8fafc' }}
                      value={getTemplate(index)?.[f.field] as string}
                      onChange={e => update(index, f.field, e.target.value)} />
                  </div>
                ))}
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: '#64748b', marginBottom: 5, fontWeight: 500 }}>Slot Duration</label>
                  <select style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none', background: '#f8fafc', cursor: 'pointer' }}
                    value={getTemplate(index)?.slotDurationMins}
                    onChange={e => update(index, 'slotDurationMins', Number(e.target.value))}>
                    <option value={15}>15 mins</option>
                    <option value={20}>20 mins</option>
                    <option value={30}>30 mins</option>
                    <option value={45}>45 mins</option>
                    <option value={60}>60 mins</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={saveAndGenerate}
        disabled={saving}
        style={{ background: saving ? '#7dd3fc' : '#0ea5e9', color: '#fff', border: 'none', borderRadius: 10, padding: '12px 32px', fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.8 : 1 }}
      >
        {saving ? 'Saving...' : '💾 Save Availability'}
      </button>
    </div>
  )
}