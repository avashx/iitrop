import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import ParticleBackground from '../common/ParticleBackground'

// FontAwesome icons map
const links = [
  { to: '/',              label: 'Dashboard',      icon: 'fa-home' },
  { to: '/mess',          label: 'Mess Menu',      icon: 'fa-utensils' },
  { to: '/mail',          label: 'Mail Hub',       icon: 'fa-envelope-open-text' },
  { to: '/marketplace',   label: 'Marketplace',    icon: 'fa-store' },
  { to: '/lost-found',    label: 'Lost & Found',   icon: 'fa-search-location' },
  { to: '/cab-share',     label: 'Cab Share',      icon: 'fa-car' },
  { to: '/explorer',      label: 'Explorer',       icon: 'fa-map-marked-alt' },
  { to: '/academics',     label: 'Academics',      icon: 'fa-graduation-cap' },
  { to: '/chat',          label: 'Campus Bot',     icon: 'fa-robot' },
]

export default function Layout({ children }) {
  const { user } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarHover, setSidebarHover] = useState(false)

  return (
    <div className="min-h-screen flex bg-transparent text-[var(--text-main)] transition-colors duration-300 relative">
      <ParticleBackground />
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 h-[calc(100vh-32px)] m-4 rounded-[40px] glass-sidebar transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
        style={{ width: sidebarHover ? '260px' : '80px', backgroundColor: 'var(--bg-surface)' }}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        {/* Logo Area */}
        <div className="flex items-center px-5 py-8 h-24 mb-4">
          <div className="w-8 h-8 rounded-full bg-transparent flex items-center justify-center shrink-0">
             <span className="text-red-700 font-bold text-xl">N</span>
          </div>
          <div className={`ml-4 transition-opacity duration-300 ${sidebarHover ? 'opacity-100' : 'opacity-0'} whitespace-nowrap`}>
            <h2 className="text-[20px] font-semibold text-[#b42a25] tracking-tight">NEXUS</h2>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto no-scrollbar">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => 
              `flex items-center px-3 h-12 rounded-[50px] transition-all duration-200 whitespace-nowrap overflow-hidden ${
                isActive 
                  ? 'bg-[var(--bg-main)] text-[var(--text-main)] shadow-[0_4px_12px_rgba(0,0,0,0.08)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
              }`
            }>
              <div className="w-6 mx-2 flex items-center justify-center shrink-0">
                <i className={`fas ${l.icon} text-lg`}></i>
              </div>
              <span className={`font-medium ml-2 transition-opacity duration-300 ${sidebarHover ? 'opacity-100' : 'opacity-0'}`}>
                {l.label}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* Footer: User + Theme */}
        <div className="p-4 mt-auto space-y-2">
           {/* Theme Toggle Button */}
           <button 
             onClick={toggleTheme}
             className={`w-full flex items-center gap-3 p-2 rounded-full transition-all duration-300 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-main)]`}
           >
             <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </div>
             <div className={`overflow-hidden transition-all duration-300 ${sidebarHover ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0'}`}>
               <p className="text-sm font-medium truncate">
                 {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
               </p>
             </div>
           </button>

          <div className={`flex items-center gap-3 p-2 rounded-full transition-all duration-300 ${sidebarHover ? 'bg-[var(--bg-hover)]' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0 text-gray-700 font-bold shadow-sm">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${sidebarHover ? 'w-auto opacity-100 ml-2' : 'w-0 opacity-0'}`}>
              <p className="text-sm font-bold truncate text-[var(--text-main)]">
                {user?.full_name?.split(' ')[0]}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE HEADER & CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[112px] transition-all duration-400">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 h-16 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--bg-hover)] flex items-center justify-between px-4 text-[var(--text-main)]">
          <div className="flex items-center gap-3">
            <span className="text-[#b42a25] font-bold text-lg">NEXUS</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="text-[var(--text-secondary)]">
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 text-black">
               <span className="text-xs font-bold">{user?.full_name?.[0]}</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 pb-24 md:pb-10 overflow-x-hidden">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.5 }}
             >
                {children}
             </motion.div>
        </main>
      </div>
    </div>
  )
}          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="mobile-nav-glass md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-auto min-w-[280px] h-auto py-2 px-6 rounded-[32px] z-50 flex items-center justify-between gap-4">
        {links.slice(0, 5).map((l) => (
          <NavLink key={l.to} to={l.to} className="no-underline">
            {({ isActive }) => (
              <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-[#001E2B]' : 'text-[#3D4F58]'}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-[#001E2B] text-[#00ED64]' : 'bg-transparent'}`}>
                  <i className={`fas ${l.icon} text-sm`}></i>
                </div>
                <span className="text-[10px] font-medium">{l.label.split(' ')[0]}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

    </div>
  )
}
