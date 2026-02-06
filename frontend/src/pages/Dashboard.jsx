import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/mess',        label: "Today's Menu",  icon: 'fa-utensils',          color: 'text-orange-600', bg: 'bg-orange-50' },
  { to: '/mail',        label: 'Mail Hub',       icon: 'fa-envelope-open-text',color: 'text-blue-600',   bg: 'bg-blue-50' },
  { to: '/marketplace', label: 'Marketplace',    icon: 'fa-store',              color: 'text-green-600',  bg: 'bg-green-50' },
  { to: '/lost-found',  label: 'Lost & Found',   icon: 'fa-search-location',    color: 'text-red-600',    bg: 'bg-red-50' },
  { to: '/cab-share',   label: 'Cab Share',      icon: 'fa-car',                color: 'text-purple-600', bg: 'bg-purple-50' },
  { to: '/academics',   label: 'Academics',      icon: 'fa-graduation-cap',     color: 'text-yellow-600', bg: 'bg-yellow-50' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ mails: 0, items: 0, trips: 0, assignments: 0 })

  useEffect(() => {
    const load = async () => {
      try {
        const [mailRes, marketRes, cabRes, assignRes] = await Promise.allSettled([
          api.get('/mail/inbox'),
          api.get('/marketplace/items'),
          api.get('/cab/trips'),
          api.get('/academic/assignments'),
        ])

        setStats({
          mails: mailRes.status === 'fulfilled' ? mailRes.value.data.length : 0,
          items: marketRes.status === 'fulfilled' ? marketRes.value.data.length : 0,
          trips: cabRes.status === 'fulfilled' ? cabRes.value.data.length : 0,
          assignments: assignRes.status === 'fulfilled' ? assignRes.value.data.length : 0,
        })
      } catch {
        // stats are best-effort
      }
    }
    load()
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div>
      {/* Hero */}
      <div className="card bg-gradient-to-br from-[#001E2B] to-[#0d3345] text-white mb-8 border-none shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full mix-blend-overlay filter blur-[64px] opacity-20 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-bold tracking-tight mb-2">{greeting()}, {user?.full_name?.split(' ')[0]}!</h2>
          <p className="text-gray-300 max-w-lg">
            Welcome to your campus command center. Check your latest updates and manage your day efficiently.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <h3 className="section-title text-[18px] font-semibold text-[#001E2B] mb-4">Overview</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Unread Mails', value: stats.mails, icon: 'fa-envelope', color: 'text-blue-500' },
          { label: 'Active Listings', value: stats.items, icon: 'fa-shopping-bag', color: 'text-green-500' },
          { label: 'Open Rides', value: stats.trips, icon: 'fa-car-side', color: 'text-purple-500' },
          { label: 'Assignments', value: stats.assignments, icon: 'fa-book', color: 'text-yellow-500' },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${s.color.replace('text-', 'bg-').replace('500', '50')} flex items-center justify-center shrink-0`}>
              <i className={`fas ${s.icon} ${s.color} text-lg`}></i>
            </div>
            <div>
              <p className="text-2xl font-bold font-mono text-[#001E2B]">{s.value}</p>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h3 className="section-title text-[18px] font-semibold text-[#001E2B] mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
        {quickLinks.map((l) => (
          <Link key={l.to} to={l.to} className="card group hover:bg-[#F9FAFB] border border-transparent hover:border-primary-200 transition-all duration-300">
            <div className={`w-12 h-12 rounded-xl ${l.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <i className={`fas ${l.icon} ${l.color} text-xl`}></i>
            </div>
            <p className="text-[15px] font-semibold text-[#001E2B] group-hover:text-primary-700 transition-colors">
              {l.label}
            </p>
            <p className="text-[12px] text-gray-400 mt-1">Jump to module &rarr;</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
