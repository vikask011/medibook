'use client'
import { createContext, useContext, useEffect, useState } from 'react'

type User = { id: string; name: string; email: string; role: 'patient' | 'doctor' | 'admin'; avatarUrl: string | null; phone: string | null }
type AuthContextType = { user: User | null; loading: boolean; logout: () => void }
const AuthContext = createContext<AuthContextType>({ user: null, loading: true, logout: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user) }).finally(() => setLoading(false))
  }, [])
  const logout = async () => { await fetch('/api/auth/logout', { method: 'POST' }); setUser(null); window.location.href = '/login' }
  return <AuthContext.Provider value={{ user, loading, logout }}>{children}</AuthContext.Provider>
}
export const useAuth = () => useContext(AuthContext)
