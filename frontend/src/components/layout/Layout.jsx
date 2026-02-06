import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlineShoppingCart,
  HiOutlineSearch,
  HiOutlineTruck,
  HiOutlineMap,
  HiOutlineAcademicCap,
  HiOutlineChatAlt2,
  HiOutlineMenu,
  HiOutlineX,
} from 'react-icons/hi'
import { useState } from 'react'

const links = [
  { to: '/',              label: 'Dashboard',      icon: HiOutlineHome },
  { to: '/mess',          label: 'Mess Menu',      icon: HiOutlineCalendar },
  { to: '/mail',          label: 'Mail Hub',       icon: HiOutlineMail },
  { to: '/marketplace',   label: 'Marketplace',    icon: HiOutlineShoppingCart },
  { to: '/lost-found',    label: 'Lost & Found',   icon: HiOutlineSearch },
  { to: '/cab-share',     label: 'Cab Share',      icon: HiOutlineTruck },
  { to: '/explorer',      label: 'Explorer',       icon: HiOutlineMap },
  { to: '/academics',     label: 'Academics',      icon: HiOutlineAcademicCap },
  { to: '/chat',          label: 'Campus Bot',     icon: HiOutlineChatAlt2 },
]

export default function Layout({ children }) {
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
            <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 leading-tight">Nexus</h1>
              <p className="text-xs text-gray-400">IIT Ropar Campus</p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={linkClass}
                onClick={() => setSidebarOpen(false)}
              >
                <l.icon className="w-5 h-5 flex-shrink-0" />
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {user?.full_name?.[0] || 'U'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user?.full_name || 'Campus User'}
                </p>
                <p className="text-xs text-gray-400 truncate">IIT Ropar</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 lg:px-8 py-3 flex items-center justify-between">
          <button className="lg:hidden text-gray-600" onClick={() => setSidebarOpen(true)}>
            {sidebarOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
          </button>
          <div className="text-sm text-gray-500">
            Welcome back, <span className="font-medium text-gray-800">{user?.full_name?.split(' ')[0]}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-green">{user?.role || 'student'}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto fade-in">{children}</div>
        </main>
      </div>
    </div>
  )
}
