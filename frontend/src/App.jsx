import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Layout from './components/layout/Layout'
import Dashboard from './pages/Dashboard'
import MessMenu from './pages/MessMenu'
import MailHub from './pages/MailHub'
import Marketplace from './pages/Marketplace'
import LostFound from './pages/LostFound'
import CabShare from './pages/CabShare'
import Explorer from './pages/Explorer'
import Academics from './pages/Academics'
import ChatBot from './pages/ChatBot'

function AppShell({ children }) {
  const { loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppShell><Dashboard /></AppShell>} />
      <Route path="/mess" element={<AppShell><MessMenu /></AppShell>} />
      <Route path="/mail" element={<AppShell><MailHub /></AppShell>} />
      <Route path="/marketplace" element={<AppShell><Marketplace /></AppShell>} />
      <Route path="/lost-found" element={<AppShell><LostFound /></AppShell>} />
      <Route path="/cab-share" element={<AppShell><CabShare /></AppShell>} />
      <Route path="/explorer" element={<AppShell><Explorer /></AppShell>} />
      <Route path="/academics" element={<AppShell><Academics /></AppShell>} />
      <Route path="/chat" element={<AppShell><ChatBot /></AppShell>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
