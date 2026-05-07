'use client'

import { useEffect, useState } from 'react'

type User = { id: string; name: string; email: string; phone: string | null; createdAt: string }

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/users').then(res => res.json()).then(data => { setUsers(data.users || []); setLoading(false) })
  }, [])

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Manage Users</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>All registered patients on MediBook</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#94a3b8', padding: '80px 0' }}>Loading...</div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Name', 'Email', 'Phone', 'Joined'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, fontWeight: 500, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 20px', fontWeight: 500, color: '#1e293b' }}>{user.name}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{user.phone || '—'}</td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{new Date(user.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
