import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // on mount, check if token exists and fetch user
  useEffect(() => {
    const token = localStorage.getItem('nexus_token')
    if (token) {
      api
        .get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('nexus_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    // OAuth2PasswordRequestForm expects form data with "username" field
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const res = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })

    localStorage.setItem('nexus_token', res.data.access_token)
    const me = await api.get('/auth/me')
    setUser(me.data)
    return me.data
  }

  const register = async (payload) => {
    await api.post('/auth/register', payload)
  }

  const logout = () => {
    localStorage.removeItem('nexus_token')
    setUser(null)
  }

  const value = { user, loading, login, register, logout }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
