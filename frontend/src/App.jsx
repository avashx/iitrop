import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MessMenu from './pages/MessMenu'
import MailHub from './pages/MailHub'
import Marketplace from './pages/Marketplace'
import LostFound from './pages/LostFound'
import CabShare from './pages/CabShare'
import Explorer from './pages/Explorer'
import Academics from './pages/Academics'
import ChatBot from './pages/ChatBot'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!user) return <Navigate to="/auth/login" replace />
  return <Layout>{children}</Layout>
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (user) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Auth pages */}
      <Route path="/auth/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/auth/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Protected pages */}
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/mess" element={<ProtectedRoute><MessMenu /></ProtectedRoute>} />
      <Route path="/mail" element={<ProtectedRoute><MailHub /></ProtectedRoute>} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/lost-found" element={<ProtectedRoute><LostFound /></ProtectedRoute>} />
      <Route path="/cab-share" element={<ProtectedRoute><CabShare /></ProtectedRoute>} />
      <Route path="/explorer" element={<ProtectedRoute><Explorer /></ProtectedRoute>} />
      <Route path="/academics" element={<ProtectedRoute><Academics /></ProtectedRoute>} />
      <Route path="/chat" element={<ProtectedRoute><ChatBot /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
