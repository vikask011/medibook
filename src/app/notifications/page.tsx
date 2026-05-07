'use client'

import { useEffect, useState } from 'react'

type Notification = { id: string; message: string; type: string; isRead: boolean; createdAt: string }

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/notifications').then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoading(false) })
  }, [])

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Notifications</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Your recent activity</p>
      </div>
      {loading ? <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>Loading...</div>
        : notifications.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => (
              <div key={n.id} style={{ background: n.isRead ? '#fff' : '#f0f9ff', border: `1px solid ${n.isRead ? '#e2e8f0' : '#bae6fd'}`, borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 20 }}>🔔</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, color: '#1e293b', marginBottom: 4 }}>{n.message}</p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9', marginTop: 4, flexShrink: 0 }} />}
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
