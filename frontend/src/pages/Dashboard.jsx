import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { TrendingUp, Calendar, Trophy, Users, ArrowRight, Activity, Zap } from 'lucide-react'

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
  const [pollVoted, setPollVoted] = useState(null)
  
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
      className="min-h-screen pb-20"
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
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
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
        <h3 className="text-[18px] font-bold text-[var(--text-main)] mb-5 tracking-tight flex items-center gap-2">
           <Zap size={20} className="text-yellow-500" fill="currentColor" /> Jugaad & Tools
        </h3>
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
      
      {/* Recent Activity Table */}
      <motion.div variants={item} className="mt-10">
         <div className="card p-0 overflow-hidden bg-[var(--bg-surface)] rounded-xl shadow-sm border border-transparent dark:border-gray-800">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/20">
               <h3 className="text-[14px] font-bold text-[var(--text-main)] uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16} /> Taaza Khabar (Recent Activity)
               </h3>
               <button className="text-[#00ED64] text-xs font-bold hover:underline flex items-center gap-1">
                  Sab Dekho <ArrowRight size={12} />
               </button>
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
                    { type: 'Academics', desc: 'Attendance short h bhai (CS101)', time: '10 min pehle', status: 'Danger', tagColor: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                    { type: 'Mess', desc: 'Aaj Dessert me Gulab Jamun h! 😋', time: '1 hr pehle', status: 'Sorted', tagColor: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                    { type: 'Alert', desc: 'Proxy lagwane ka koi scene?', time: '2 hrs pehle', status: 'Risk hai', tagColor: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
                    { type: 'Market', desc: 'Drafter bech rha koi?', time: 'Kal raat', status: 'Active', tagColor: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[var(--bg-hover)] transition-colors border-b border-gray-50 dark:border-gray-800/50 last:border-none">
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${row.tagColor}`}>{row.type}</span>
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

      {/* NEW SECTION: Upcoming Events Timeline */}
      <motion.div variants={item} className="mt-10">
         <h3 className="text-[18px] font-bold text-[var(--text-main)] mb-6 tracking-tight flex items-center gap-2">
            <Calendar size={20} className="text-purple-500" /> Upcoming Tamashe (Events)
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
               { day: "Today", date: "06 Feb", title: "DJ Night @ Open Air Theatre", time: "8:00 PM", tag: "Fun", color: "border-purple-500" },
               { day: "Tomorrow", date: "07 Feb", title: "Inter-Hostel Cricket Match", time: "10:00 AM", tag: "Sports", color: "border-green-500" },
               { day: "Saturday", date: "08 Feb", title: "Hackathon 2026 Submission", time: "11:59 PM", tag: "Tech", color: "border-red-500" },
            ].map((event, i) => (
               <div key={i} className={`card p-5 rounded-xl border-l-4 ${event.color} bg-[var(--bg-surface)] hover:translate-y-[-5px] transition-transform`}>
                  <div className="flex justify-between items-start mb-2">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{event.day}</span>
                     <span className="text-xs font-bold bg-[var(--bg-hover)] px-2 py-1 rounded text-[var(--text-main)]">{event.date}</span>
                  </div>
                  <h4 className="text-lg font-bold text-[var(--text-main)] mb-1 leading-tight">{event.title}</h4>
                  <p className="text-sm text-[var(--text-secondary)] flex items-center gap-2 mt-2">
                     <Users size={14} /> 200+ Interested
                  </p>
               </div>
            ))}
         </div>
      </motion.div>

      {/* NEW SECTION: Two Column Widget Area */}
      <motion.div variants={item} className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
         
         {/* Hostel Leaderboard */}
         <div className="card p-6 rounded-2xl bg-[var(--bg-surface)] border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-6">
               <h3 className="font-bold text-[var(--text-main)] flex items-center gap-2">
                  <Trophy size={18} className="text-yellow-500" /> Hostel Wars
               </h3>
               <span className="text-xs font-bold text-green-500 animate-pulse">Live Updates</span>
            </div>
            <div className="space-y-4">
               {[
                  { name: "Satpura", points: 1250, rank: 1, change: "up" },
                  { name: "Udaygiri", points: 1120, rank: 2, change: "same" },
                  { name: "Himadri", points: 980, rank: 3, change: "down" },
                  { name: "Shivalik", points: 850, rank: 4, change: "down" },
               ].map((h, i) => (
                  <div key={h.name} className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-main)]">
                     <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                           i === 0 ? 'bg-yellow-100 text-yellow-700' :
                           i === 1 ? 'bg-gray-100 text-gray-700' :
                           'bg-orange-50 text-orange-700'
                        }`}>#{h.rank}</span>
                        <span className="font-semibold text-[var(--text-main)]">{h.name}</span>
                     </div>
                     <span className="font-mono font-bold text-[var(--text-secondary)]">{h.points} pts</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Campus Poll */}
         <div className="card p-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white relative overflow-hidden">
            <div className="relative z-10">
               <h3 className="font-bold text-xl mb-2 flex items-center gap-2">
                  <TrendingUp size={20} /> Poll of the Week
               </h3>
               <p className="text-indigo-100 text-sm mb-6">Which canteen makes the best Maggi?</p>
               
               <div className="space-y-3">
                  {[
                     { id: 'a', label: "Nescafe (Night Canteen)", percent: 45 },
                     { id: 'b', label: "LHC Canteen", percent: 30 },
                     { id: 'c', label: "Hostel Shop", percent: 25 },
                  ].map((opt) => (
                     <button 
                        key={opt.id}
                        onClick={() => setPollVoted(opt.id)}
                        className="w-full text-left"
                     >
                        <div className={`relative h-10 rounded-lg overflow-hidden transition-all ${pollVoted ? 'bg-black/20' : 'bg-white/10 hover:bg-white/20'}`}>
                           <div 
                             className="absolute top-0 left-0 h-full bg-white/30 transition-all duration-1000 ease-out"
                             style={{ width: pollVoted ? `${opt.percent}%` : '0%' }}
                           />
                           <div className="absolute inset-0 flex items-center justify-between px-4">
                              <span className="text-sm font-medium">{opt.label}</span>
                              {pollVoted && <span className="text-xs font-bold">{opt.percent}%</span>}
                           </div>
                        </div>
                     </button>
                  ))}
               </div>
               
               {pollVoted && (
                  <p className="mt-4 text-xs text-indigo-200 text-center animate-fade-in">Thanks for voting! (Nescafe is winning obviously)</p>
               )}
            </div>
            
            {/* Background decoration */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl"></div>
         </div>

      </motion.div>

    </motion.div>
  )
}


