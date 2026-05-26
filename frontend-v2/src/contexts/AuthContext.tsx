'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login:          (email: string, password: string, remember?: boolean) => Promise<void>
  register:       (name: string, email: string, password: string)       => Promise<void>
  logout:         () => void
  resetPassword:  (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('hrai_user')
      if (stored) setUser(JSON.parse(stored))
    } catch {}
    setLoading(false)
  }, [])

  const login = async (email: string, password: string, remember = false) => {
    if (!email || password.length < 6) throw new Error('E-posta veya şifre hatalı.')
    await new Promise(r => setTimeout(r, 900))

    const u: User = {
      id:     '1',
      name:   email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email,
      role:   'admin',
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(email)}&backgroundColor=6366f1`,
    }
    setUser(u)
    if (remember) localStorage.setItem('hrai_user', JSON.stringify(u))
    else          sessionStorage.setItem('hrai_user', JSON.stringify(u))
  }

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || password.length < 6) throw new Error('Lütfen tüm alanları doldurun.')
    await new Promise(r => setTimeout(r, 1100))

    const u: User = {
      id:     Date.now().toString(),
      name,
      email,
      role:   'admin',
      avatar: `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=6366f1`,
    }
    setUser(u)
    localStorage.setItem('hrai_user', JSON.stringify(u))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hrai_user')
    sessionStorage.removeItem('hrai_user')
  }

  const resetPassword = async (email: string) => {
    if (!email) throw new Error('E-posta adresi gerekli.')
    await new Promise(r => setTimeout(r, 800))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
