import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

const quickLinks = [
  { to: '/mess',        label: "Aaj ka Khana",     icon: 'fa-utensils',           color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { to: '/mail',        label: "Official Bakar",   icon: 'fa-envelope-open-text', color: 'text-blue-600',   bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { to: '/marketplace', label: "Campus OLX",       icon: 'fa-store',              color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
  { to: '/lost-found',  label: "Khoya Paya",       icon: 'fa-search-location',    color: 'text-red-600',    bg: 'bg-red-50 dark:bg-red-900/20' },
  { to: '/cab-share',   label: "Gedi Route",       icon: 'fa-car',                color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { to: '/academics',   label: "Padhai Likhai",    icon: 'fa-graduation-cap',     color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ mails: 4, items: 12, trips: 5, assignments: 3 })
  const [activeFilter, setActiveFilter] = useState('Sab Kuch')
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div 
      className="min-h-screen"
      variants={container}
      initial="hidden"
      animate="show"
    >
      
      {/* Page Header */}
      <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-[14px] font-semibold text-[#b42a25] mb-1 uppercase tracking-[0.5px]">NEXUS</h2>
           <h1 className="text-[28px] font-bold text-[var(--text-main)] tracking-tight">
             Kya haal h, <span className="text-[#00ED64]">Aditya</span>? 👋
           </h1>
           <p className="text-[var(--text-secondary)] text-sm mt-1">Campus ka daily update lelo, warna FOMO ho jayega.</p>
        </div>
        
        {/* Search Input */}
        <div className="relative w-full md:w-[320px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </span>
          <input 
            type="text" 
            placeholder="Kya dhund raha h bhai?" 
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-[var(--bg-surface)] text-sm focus:outline-none focus:border-[#00ED64] focus:ring-4 focus:ring-[#00ED64]/20 transition-all font-medium text-[var(--text-main)]"
          />
        </div>
      </motion.div>

      {/* Filter Toolbar Actions */}
      <motion.div variants={item} className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
         {['Sab Kuch', 'Bakar (Mails)', 'Campus Dukan', 'Homework'].map((filter) => (
           <button 
             key={filter}
             onClick={() => setActiveFilter(filter)}
             className={`px-3 py-1.5 rounded-[20px] text-[12px] font-semibold border border-transparent transition-all hover:-translate-y-[1px] ${
               activeFilter === filter 
               ? 'bg-[var(--text-main)] text-[var(--bg-main)] shadow-md' 
               : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] shadow-sm hover:shadow-md'
             }`}
           >
             {filter}
           </button>
         ))}
      </motion.div>

      {/* Stats Cards Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {[
          { label: "Dean's Emails", value: stats.mails, icon: 'fa-envelope', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', new: 'Spam mostly' },
          { label: "Campus Dukan", value: stats.items, icon: 'fa-store', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', new: 'Saste deals' },
          { label: "Gedi Partners", value: stats.trips, icon: 'fa-car', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', new: 'Chalo Murthal' },
          { label: "Maut ka Farmaan", value: stats.assignments, icon: 'fa-book', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', new: 'Deadlines!' },
        ].map((s) => (
          <div key={s.label} className="card p-5 hover:shadow-lg bg-[var(--bg-surface)] rounded-xl border border-transparent dark:border-gray-800 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center`}>
                <i className={`fas ${s.icon} ${s.color}`}></i>
              </div>
              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">{s.new}</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-main)] font-mono mb-1">{s.value}</p>
            <p className="text-[13px] font-medium text-[var(--text-secondary)]">{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Access Grid */}
      <motion.div variants={item}>
        <h3 className="text-[18px] font-bold text-[var(--text-main)] mb-5 tracking-tight">Jugaad & Tools</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickLinks.map((l) => (
            <Link 
              key={l.to} 
              to={l.to} 
              className="card group flex flex-col items-center justify-center p-6 text-center bg-[var(--bg-surface)] rounded-2xl border border-transparent dark:border-gray-800 hover:border-[#00ED64] hover:ring-1 hover:ring-[#00ED64]/30 transition-all shadow-sm"
            >
              <div className={`w-12 h-12 rounded-2xl ${l.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                <i className={`fas ${l.icon} ${l.color} text-xl`}></i>
              </div>
              <p className="text-[14px] font-semibold text-[var(--text-main)] group-hover:text-[#009b41] transition-colors">
                {l.label}
              </p>
            </Link>
          ))}
        </div>
      </motion.div>
      
      {/* Table Placeholder (Mock Data) */}
      <motion.div variants={item} className="mt-10">
         <div className="card p-0 overflow-hidden bg-[var(--bg-surface)] rounded-xl shadow-sm border border-transparent dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
               <h3 className="text-[14px] font-bold text-[var(--text-main)] uppercase tracking-wider">Taaza Khabar (Recent Activity)</h3>
               <button className="text-[#00ED64] text-xs font-bold hover:underline">Sab Dekho</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                     {[ 'Scene', 'Kya Hua?', 'Kab Hua?', 'Status'].map(h => (
                       <th key={h} className="px-6 py-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider bg-gray-50/30 dark:bg-white/5 border-b border-gray-100 dark:border-gray-800">{h}</th>
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
                    <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-none">
                      <td className="px-6 py-3">
                        <span className={`tag ${row.tagColor}`}>{row.type}</span>
                      </td>
                      <td className="px-6 py-3 text-[13px] font-medium text-[var(--text-secondary)]">
                        {row.desc}
                      </td>
                      <td className="px-6 py-3 text-[13px] text-gray-400">
                        {row.time}
                      </td>
                      <td className="px-6 py-3">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-gray-600 dark:text-gray-400">
                           <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'Sorted' ? 'bg-green-500' : row.status === 'Danger' ? 'bg-red-500' : 'bg-yellow-500'}`}></span> {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </div>
      </motion.div>

    </motion.div>
  )
}


