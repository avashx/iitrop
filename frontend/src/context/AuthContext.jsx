import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

// Demo user that is always "logged in"
const DEMO_USER = {
  id: 1,
  email: 'demo@iitrpr.ac.in',
  username: 'demo',
  full_name: 'Campus User',
  role: 'student',
  branch: 'CSE',
  year: 2,
  phone: '',
  avatar_url: '',
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // auto-login: try to get a token silently, fall back to demo user object
  useEffect(() => {
    const bootstrap = async () => {
      try {
        // attempt to grab a real token so API calls that need auth work
        const token = localStorage.getItem('nexus_token')
        if (token) {
          const me = await api.get('/auth/me')
          setUser(me.data)
        } else {
          // auto-login with a demo account
          const formData = new URLSearchParams()
          formData.append('username', 'demo@iitrpr.ac.in')
          formData.append('password', 'demo1234')
          const res = await api.post('/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          })
          localStorage.setItem('nexus_token', res.data.access_token)
          setUser(res.data.user)
        }
      } catch {
        // backend unreachable — use offline demo user so the UI still renders
        setUser(DEMO_USER)
      } finally {
        setLoading(false)
      }
    }
    bootstrap()
  }, [])

  const value = { user, loading }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
