import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import {
  HiOutlineCalendar,
  HiOutlineMail,
  HiOutlineShoppingCart,
  HiOutlineSearch,
  HiOutlineTruck,
  HiOutlineAcademicCap,
} from 'react-icons/hi'
import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/mess',        label: "Today's Menu",  icon: HiOutlineCalendar,      color: 'bg-orange-50 text-orange-600' },
  { to: '/mail',        label: 'Mail Hub',       icon: HiOutlineMail,          color: 'bg-blue-50 text-blue-600' },
  { to: '/marketplace', label: 'Marketplace',    icon: HiOutlineShoppingCart,   color: 'bg-green-50 text-green-600' },
  { to: '/lost-found',  label: 'Lost & Found',   icon: HiOutlineSearch,         color: 'bg-red-50 text-red-600' },
  { to: '/cab-share',   label: 'Cab Share',      icon: HiOutlineTruck,          color: 'bg-purple-50 text-purple-600' },
  { to: '/academics',   label: 'Academics',      icon: HiOutlineAcademicCap,    color: 'bg-yellow-50 text-yellow-700' },
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
      <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white mb-8">
        <h2 className="text-2xl font-bold">{greeting()}, {user?.full_name?.split(' ')[0]}! 👋</h2>
        <p className="mt-1 text-primary-100">
          Here's what's happening on campus today.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Unread Mails', value: stats.mails, color: 'text-blue-600' },
          { label: 'Active Listings', value: stats.items, color: 'text-green-600' },
          { label: 'Open Rides', value: stats.trips, color: 'text-purple-600' },
          { label: 'Assignments', value: stats.assignments, color: 'text-yellow-600' },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Access</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((l) => (
          <Link key={l.to} to={l.to} className="card hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-lg ${l.color} flex items-center justify-center mb-3`}>
              <l.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-800 group-hover:text-primary-600 transition-colors">
              {l.label}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}
