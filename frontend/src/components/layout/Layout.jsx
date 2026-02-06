import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'

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
  const [sidebarHover, setSidebarHover] = useState(false)

  // Desktop Link Styles
  const linkClass = ({ isActive }) =>
    `flex items-center gap-4 px-4 h-12 mb-2 rounded-full transition-all duration-300 whitespace-nowrap overflow-hidden ${
      isActive
        ? 'bg-white text-[#001E2B] shadow-sm'
        : 'text-gray-500 hover:bg-white/50 hover:text-[#001E2B] hover:translate-x-1'
    }`

  return (
    <div className="min-h-screen flex bg-[#F9FBFA] text-[#001E2B]">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        className="hidden md:flex flex-col fixed inset-y-0 left-0 z-50 h-[calc(100vh-32px)] m-4 rounded-[40px] bg-white/70 backdrop-blur-[25px] border border-white/50 shadow-glass transition-all duration-400 ease-[cubic-bezier(0.25,0.8,0.25,1)]"
        style={{ width: sidebarHover ? '260px' : '80px' }}
        onMouseEnter={() => setSidebarHover(true)}
        onMouseLeave={() => setSidebarHover(false)}
      >
        {/* Logo Area */}
        <div className="flex items-center px-5 py-8 h-24">
          <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/30">
            <span className="text-[#001E2B] font-bold text-xl">N</span>
          </div>
          <div className={`ml-4 transition-opacity duration-300 ${sidebarHover ? 'opacity-100' : 'opacity-0'} whitespace-nowrap`}>
            <h1 className="text-xl font-bold tracking-tight">Nexus</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-semibold">IIT Ropar</p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={linkClass}>
              {({ isActive }) => (
                <>
                  <div className={`w-10 h-10 flex items-center justify-center rounded-full shrink-0 transition-colors ${isActive ? 'text-primary-600' : ''}`}>
                    <i className={`fas ${l.icon} text-lg`}></i>
                  </div>
                  <span className={`font-medium transition-opacity duration-300 ${sidebarHover ? 'opacity-100' : 'opacity-0'}`}>
                    {l.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Footer */}
        <div className="p-4 mt-auto">
          <div className={`flex items-center gap-3 p-2 rounded-full bg-white/50 border border-white/40 transition-all duration-300 ${sidebarHover ? 'glass-panel' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 text-white font-bold shadow-md">
              {user?.full_name?.[0] || 'U'}
            </div>
            <div className={`overflow-hidden transition-all duration-300 ${sidebarHover ? 'w-auto opacity-100 ml-1' : 'w-0 opacity-0'}`}>
              <p className="text-sm font-bold truncate text-[#001E2B]">
                {user?.full_name?.split(' ')[0]}
              </p>
              <p className="text-[10px] text-gray-500 font-mono truncate">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE HEADER & CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-[112px] transition-all duration-400">
        
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-[#001E2B] font-bold">N</div>
            <span className="font-bold text-lg">Nexus</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200">
            <span className="text-xs font-bold text-gray-700">{user?.full_name?.[0]}</span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-4 md:p-8 lg:p-10 pb-24 md:pb-10 overflow-x-hidden">
          <div className="max-w-6xl mx-auto fade-in">
            {children}
          </div>
        </main>
      </div>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-16 bg-white/90 backdrop-blur-xl border border-white/50 shadow-glass rounded-[32px] z-50 flex items-center justify-around px-2">
        {links.slice(0, 5).map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => `relative flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all duration-200 ${isActive ? 'bg-[#001E2B] text-primary-400 shadow-lg -translate-y-2' : 'text-gray-400 hover:text-gray-600'}`}>
            <i className={`fas ${l.icon} text-lg`}></i>
          </NavLink>
        ))}
        {/* More Menu Trigger (Simple redirect to explorer for now on mobile) */}
        <NavLink to="/explorer" className="relative flex flex-col items-center justify-center w-12 h-12 rounded-full text-gray-400">
          <i className="fas fa-ellipsis-h text-lg"></i>
        </NavLink>
      </nav>

    </div>
  )
}
