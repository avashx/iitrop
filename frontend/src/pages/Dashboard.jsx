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
  const [loading, setLoading] = useState(true)

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
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <div className="min-h-screen">
      
      {/* Page Header (Matching HTML) */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-semibold text-[#b42a25] mb-1 uppercase tracking-[0.5px]">NSUTGod</h2>
           <h1 className="text-[28px] font-bold text-[#001E2B] tracking-tight">
             Dashboard Overview
             <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-[18px] font-mono font-semibold bg-[#E8EDEB] text-[#3D4F58] align-middle">
               {loading ? '...' : (stats.mails + stats.items + stats.trips + stats.assignments)}
             </span>
           </h1>
        </div>
        
        {/* Search Input (Styled) */}
        <div className="relative w-full md:w-[320px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Search modules..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#C1C7C6] text-sm focus:outline-none focus:border-[#00ED64] focus:ring-4 focus:ring-[#00ED64]/20 transition-all"
          />
        </div>
      </div>

      {/* Filter Toolbar Actions (Placeholder) */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
         {['All Updates', 'Mails', 'Marketplace', 'Academics'].map((filter, i) => (
           <button 
             key={filter}
             className={`px-3 py-1.5 rounded-[20px] text-[12px] font-semibold border border-transparent transition-all hover:-translate-y-[1px] ${i===0 ? 'bg-[#001E2B] text-white shadow-md' : 'bg-white text-[#3D4F58] shadow-sm hover:shadow-md'}`}
           >
             {filter}
           </button>
         ))}
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: 'Unread Mails', value: stats.mails, icon: 'fa-envelope', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Listings', value: stats.items, icon: 'fa-store', color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Open Rides', value: stats.trips, icon: 'fa-car', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Assignments', value: stats.assignments, icon: 'fa-book', color: 'text-yellow-600', bg: 'bg-yellow-50' },
        ].map((s, idx) => (
          <div key={s.label} className="card p-5 hover:shadow-lg animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center`}>
                <i className={`fas ${s.icon} ${s.color}`}></i>
              </div>
              {/* Optional Trend Indicator */}
              <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">+2 new</span>
            </div>
            <p className="text-3xl font-bold text-[#001E2B] font-mono mb-1">{s.value}</p>
            <p className="text-[13px] font-medium text-[#3D4F58]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <h3 className="text-[18px] font-bold text-[#001E2B] mb-5 tracking-tight">Quick Access</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickLinks.map((l, idx) => (
          <Link 
            key={l.to} 
            to={l.to} 
            className="card group flex flex-col items-center justify-center p-6 text-center hover:border-[#00ED64] hover:ring-1 hover:ring-[#00ED64]/30 animate-fade-in"
            style={{ animationDelay: `${0.2 + (idx * 0.05)}s` }}
          >
            <div className={`w-12 h-12 rounded-2xl ${l.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
              <i className={`fas ${l.icon} ${l.color} text-xl`}></i>
            </div>
            <p className="text-[14px] font-semibold text-[#001E2B] group-hover:text-[#009b41] transition-colors">
              {l.label}
            </p>
          </Link>
        ))}
      </div>
      
      {/* Table Placeholder (To match the HTML Table look) */}
      <div className="mt-10">
         <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8EDEB] flex justify-between items-center bg-gray-50/50">
               <h3 className="text-[14px] font-bold text-[#001E2B] uppercase tracking-wider">Recent Activity</h3>
               <button className="text-[#00ED64] text-xs font-bold hover:underline">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                     {[ 'Type', 'Description', 'Time', 'Status'].map(h => (
                       <th key={h} className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-[#F9FAFB] border-b border-[#F3F4F6]">{h}</th>
                     ))}
                  </tr>
                </thead>
                <tbody>
                  {[1,2,3].map((_, i) => (
                    <tr key={i} className="hover:bg-[#FAFBFA] transition-colors">
                      <td className="px-6 py-3 border-b border-[#F3F4F6]">
                        <span className="tag tag-blue">System</span>
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6] text-[13px] font-medium text-[#3D4F58]">
                        System maintenance scheduled
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6] text-[13px] text-gray-400">
                        2 hours ago
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6]">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-green-600">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </div>

    </div>
  )
}

