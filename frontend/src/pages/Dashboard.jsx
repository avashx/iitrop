import { useEffect, useState } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/mess',        label: "Aaj ka Khana",     icon: 'fa-utensils',           color: 'text-orange-600', bg: 'bg-orange-50' },
  { to: '/mail',        label: "Official Bakar",   icon: 'fa-envelope-open-text', color: 'text-blue-600',   bg: 'bg-blue-50' },
  { to: '/marketplace', label: "Campus OLX",       icon: 'fa-store',              color: 'text-green-600',  bg: 'bg-green-50' },
  { to: '/lost-found',  label: "Khoya Paya",       icon: 'fa-search-location',    color: 'text-red-600',    bg: 'bg-red-50' },
  { to: '/cab-share',   label: "Gedi Route",       icon: 'fa-car',                color: 'text-purple-600', bg: 'bg-purple-50' },
  { to: '/academics',   label: "Padhai Likhai",    icon: 'fa-graduation-cap',     color: 'text-yellow-600', bg: 'bg-yellow-50' },
]

export default function Dashboard() {
  const { user } = useAuth()
  // Mock data initialized to look good immediately
  const [stats, setStats] = useState({ mails: 4, items: 12, trips: 5, assignments: 3 })
  const [loading, setLoading] = useState(false)

  // UseEffect for API calls is kept but best-effort, won't override with 0 if error ideally
  // Actually, let's just use mock data primarily for this demo request
  useEffect(() => {
    // API logic commented out for demo consistency or can be kept as fallback
    /*
    const load = async () => {
      try { ... } 
    }
    load()
    */
  }, [])

  return (
    <div className="min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-semibold text-[#b42a25] mb-1 uppercase tracking-[0.5px]">NEXUS</h2>
           <h1 className="text-[28px] font-bold text-[#001E2B] tracking-tight">
             Kya haal h, <span className="text-[#00ED64]">Aditya</span>? 👋
           </h1>
           <p className="text-[#3D4F58] text-sm mt-1">Campus ka daily update lelo, warna FOMO ho jayega.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-[320px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Kya dhund raha h bhai?" 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#C1C7C6] text-sm focus:outline-none focus:border-[#00ED64] focus:ring-4 focus:ring-[#00ED64]/20 transition-all font-medium"
          />
        </div>
      </div>

      {/* Filter Toolbar Actions */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
         {['Sab Kuch', 'Bakar (Mails)', 'Campus Dukan', 'Homework'].map((filter, i) => (
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
          { label: "Dean's Emails", value: stats.mails, icon: 'fa-envelope', color: 'text-blue-600', bg: 'bg-blue-50', new: 'Spam mostly' },
          { label: "Campus Dukan", value: stats.items, icon: 'fa-store', color: 'text-green-600', bg: 'bg-green-50', new: 'Saste deals' },
          { label: "Gedi Partners", value: stats.trips, icon: 'fa-car', color: 'text-purple-600', bg: 'bg-purple-50', new: 'Chalo Murthal' },
          { label: "Maut ka Farmaan", value: stats.assignments, icon: 'fa-book', color: 'text-yellow-600', bg: 'bg-yellow-50', new: 'Deadlines!' },
        ].map((s, idx) => (
          <div key={s.label} className="card p-5 hover:shadow-lg animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center`}>
                <i className={`fas ${s.icon} ${s.color}`}></i>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{s.new}</span>
            </div>
            <p className="text-3xl font-bold text-[#001E2B] font-mono mb-1">{s.value}</p>
            <p className="text-[13px] font-medium text-[#3D4F58]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Access Grid */}
      <h3 className="text-[18px] font-bold text-[#001E2B] mb-5 tracking-tight">Jugaad & Tools</h3>
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
      
      {/* Table Placeholder (Mock Data) */}
      <div className="mt-10">
         <div className="card p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E8EDEB] flex justify-between items-center bg-gray-50/50">
               <h3 className="text-[14px] font-bold text-[#001E2B] uppercase tracking-wider">Taaza Khabar (Recent Activity)</h3>
               <button className="text-[#00ED64] text-xs font-bold hover:underline">Sab Dekho</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                     {[ 'Scene', 'Kya Hua?', 'Kab Hua?', 'Status'].map(h => (
                       <th key={h} className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-[#F9FAFB] border-b border-[#F3F4F6]">{h}</th>
                     ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { type: 'Academics', desc: 'Attendance short h bhai (CS101)', time: '10 min pehle', status: 'Danger', tagColor: 'tag-red' },
                    { type: 'Mess', desc: 'Aaj Dessert me Gulab Jamun h! 😋', time: '1 hr pehle', status: 'Sorted', tagColor: 'tag-green' },
                    { type: 'Alert', desc: 'Proxy lagwane ka koi scene?', time: '2 hrs pehle', status: 'Risk hai', tagColor: 'tag-yellow' },
                    { type: 'Market', desc: 'Drafter bech rha koi?', time: 'Kal raat', status: 'Active', tagColor: 'tag-blue' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#FAFBFA] transition-colors">
                      <td className="px-6 py-3 border-b border-[#F3F4F6]">
                        <span className={`tag ${row.tagColor}`}>{row.type}</span>
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6] text-[13px] font-medium text-[#3D4F58]">
                        {row.desc}
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6] text-[13px] text-gray-400">
                        {row.time}
                      </td>
                      <td className="px-6 py-3 border-b border-[#F3F4F6]">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-gray-600">
                           <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Sorted' ? 'bg-green-500' : row.status === 'Danger' ? 'bg-red-500' : 'bg-yellow-500'}`}></span> {row.status}
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


