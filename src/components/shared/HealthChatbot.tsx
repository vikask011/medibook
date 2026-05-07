'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

type Message = {
  role: 'user' | 'assistant'
  content: string
  isSerious?: boolean
}

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const StethoscopeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/>
    <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>
  </svg>
)
const AlertTriangleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
)
const HospitalIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/><line x1="12" y1="7" x2="12" y2="7"/>
    <line x1="12" y1="5" x2="12" y2="9"/><line x1="10" y1="7" x2="14" y2="7"/>
  </svg>
)

export default function HealthChatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm MediBot 👋 I can help answer your health questions. What's on your mind?" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages }),
      })
      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, isSerious: data.isSerious }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'fixed', bottom: 28, right: 28,
          width: 56, height: 56, borderRadius: '50%',
          background: open ? '#0f172a' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(14,165,233,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, transition: 'all 0.2s', color: '#fff',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)' }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}
        title="Health Assistant"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Chat Window */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 96, right: 28,
          width: 368, maxHeight: 540,
          background: '#fff', borderRadius: 22,
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          display: 'flex', flexDirection: 'column',
          zIndex: 1000, overflow: 'hidden',
          border: '1px solid #e2e8f0',
          animation: 'chatSlideUp 0.25s ease',
        }}>
          <style>{`
            @keyframes chatSlideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
            @keyframes typingBounce { 0%,60%,100% { transform:translateY(0) } 30% { transform:translateY(-5px) } }
          `}</style>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <StethoscopeIcon />
            </div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>MediBot</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11.5, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                Health Assistant • Online
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 14, background: '#f8fafc' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '84%',
                  padding: '10px 14px',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#fff',
                  color: msg.role === 'user' ? '#fff' : '#1e293b',
                  fontSize: 13.5, lineHeight: 1.6,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.content}
                </div>

                {/* Serious issue CTA */}
                {msg.isSerious && msg.role === 'assistant' && (
                  <div style={{ marginTop: 10, maxWidth: '88%', width: '100%' }}>
                    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '10px 14px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                      <div style={{ color: '#ea580c', flexShrink: 0, marginTop: 1 }}><AlertTriangleIcon /></div>
                      <p style={{ fontSize: 12.5, color: '#9a3412', lineHeight: 1.55 }}>
                        <strong>This may require medical attention.</strong> Please consult a qualified doctor for a proper diagnosis and treatment plan.
                      </p>
                    </div>
                    <button
                      onClick={() => { router.push('/doctors'); setOpen(false) }}
                      style={{
                        width: '100%', background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
                        border: 'none', borderRadius: 12, padding: '10px 16px',
                        fontSize: 13, fontWeight: 600, color: '#fff',
                        cursor: 'pointer', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 8,
                        boxShadow: '0 3px 12px rgba(220,38,38,0.3)',
                      }}
                    >
                      <HospitalIcon />
                      Find a Doctor to Consult
                    </button>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px 16px 16px 4px', padding: '12px 16px', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 1, 2].map(d => (
                    <div key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: '#94a3b8', animation: 'typingBounce 1.2s infinite', animationDelay: `${d * 0.2}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: 8, background: '#fff' }}>
            <input
              type="text"
              placeholder="Ask about symptoms, health tips…"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              disabled={loading}
              style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: 12, padding: '9px 14px', fontSize: 13.5, outline: 'none', color: '#1e293b', background: loading ? '#f8fafc' : '#fff', fontFamily: 'inherit' }}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim() ? '#e2e8f0' : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                border: 'none', borderRadius: 12, width: 42, height: 42,
                cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: loading || !input.trim() ? '#94a3b8' : '#fff',
                transition: 'background 0.15s',
              }}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
