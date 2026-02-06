import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import Lenis from 'lenis'

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
import BootLoader from './components/common/BootLoader'

function AppShell({ children }) {
  const { loading } = useAuth()
  
  if (loading) {
     return null; // BootLoader handles the visuals
  }
  return <Layout>{children}</Layout>
}

export default function App() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical', 
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)
    
    return () => {
      lenis.destroy() 
    }
  }, [])

  return (
    <>
      <AnimatePresence>
        {booting && <BootLoader onComplete={() => setBooting(false)} />}
      </AnimatePresence>
      
      {!booting && (
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
      )}
    </>
  )
}
