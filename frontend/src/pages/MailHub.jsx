import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, PenSquare, Star, Reply, Trash, MoreVertical } from 'lucide-react'

const MOCK_MAILS = [
  {
    id: 1,
    sender: "Dean Academics",
    subject: "Final Warning: 74.9% Attendance",
    preview: "Dear Aditya, This is to inform you that your attendance in CS101 is critically low. If you miss one more class, you will be debarred...",
    time: "10:30 AM",
    read: false,
    tag: "Urgent",
    tagColor: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  },
  {
    id: 2,
    sender: "Hostel Warden",
    subject: "Raat ko shor mat machao",
    preview: "Kal raat 2 baje corridor me cricket kon khel raha tha? CCTV footage check karunga. Fine lagega sabko agar dobara hua to.",
    time: "Yesterday",
    read: true,
    tag: "Notice",
    tagColor: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
  },
  {
    id: 3,
    sender: "Placement Cell",
    subject: "Google is Hiring (Dream Package)",
    preview: "Actually not Google, but 'Gugle Tech Support'. CTC 3.5 LPA. Apply ASAP. Link expires in 2 hours.",
    time: "2 days ago",
    read: true,
    tag: "Career",
    tagColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
  },
  {
    id: 4,
    sender: "Music Club",
    subject: "Jam Session Tonight @ OAT",
    preview: "Bring your instruments. Free momos for first 10 people. We are playing generic Bollywood songs only.",
    time: "3 days ago",
    read: true,
    tag: "Event",
    tagColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
  },
  {
    id: 5,
    sender: "Library",
    subject: "Overdue Book: 'Introduction to Algorithms'",
    preview: "Fine amount: ₹5000. Please return the book or sell your kidney. This is the last reminder.",
    time: "1 week ago",
    read: true,
    tag: "Fine",
    tagColor: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
  }
]

export default function MailHub() {
  const [activeMail, setActiveMail] = useState(null)

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6"
    >
      {/* Mail List */}
      <div className={`flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden ${activeMail ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-[var(--bg-surface)]">
          <h1 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="text-blue-500">Inbox</span>
            <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">12</span>
          </h1>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-[var(--bg-hover)] rounded-full text-[var(--text-secondary)]">
               <Search size={18} />
            </button>
            <button className="p-2 bg-[#00ED64] text-[#001E2B] rounded-full hover:shadow-lg hover:scale-105 transition-all">
               <PenSquare size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[var(--bg-surface)]">
           {MOCK_MAILS.map((mail) => (
             <motion.div
               key={mail.id}
               onClick={() => setActiveMail(mail)}
               initial={{ x: -20, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               className={`p-4 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#00ED64]/30 ${
                 activeMail?.id === mail.id 
                   ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
                   : 'hover:bg-[var(--bg-hover)] bg-[var(--bg-main)]'
               }`}
             >
               <div className="flex justify-between items-start mb-1">
                 <h3 className={`text-sm font-semibold truncate pr-2 ${mail.read ? 'text-[var(--text-secondary)]' : 'text-[var(--text-main)]'}`}>
                   {mail.sender}
                 </h3>
                 <span className="text-[10px] text-gray-400 whitespace-nowrap">{mail.time}</span>
               </div>
               <h4 className={`text-[13px] truncate mb-1 ${mail.read ? 'font-normal text-[var(--text-secondary)]' : 'font-bold text-[var(--text-main)]'}`}>
                 {mail.subject}
               </h4>
               <p className="text-[12px] text-gray-400 line-clamp-1 mb-2">
                 {mail.preview}
               </p>
               <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${mail.tagColor}`}>
                 {mail.tag}
               </span>
             </motion.div>
           ))}
        </div>
      </div>

      {/* Mail Detail View */}
      <div className={`flex-[1.5] glass-panel rounded-2xl p-6 flex-col ${activeMail ? 'flex' : 'hidden md:flex'}`}>
         {activeMail ? (
           <motion.div 
             key={activeMail.id}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             className="h-full flex flex-col"
           >
             {/* Mobile Back Button */}
             <button onClick={() => setActiveMail(null)} className="md:hidden text-sm text-[var(--text-secondary)] mb-4 flex items-center gap-1">
               ← Back
             </button>

             <div className="flex justify-between items-start mb-6">
                <div>
                   <h2 className="text-xl font-bold text-[var(--text-main)] mb-2">{activeMail.subject}</h2>
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                        {activeMail.sender[0]}
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-[var(--text-main)]">{activeMail.sender}</p>
                        <p className="text-xs text-[var(--text-secondary)]">to me • {activeMail.time}</p>
                     </div>
                   </div>
                </div>
                <div className="flex gap-2 text-[var(--text-secondary)]">
                   <Star size={18} className="cursor-pointer hover:text-yellow-400" />
                   <MoreVertical size={18} className="cursor-pointer hover:text-[var(--text-main)]" />
                </div>
             </div>

             <div className="flex-1 text-[var(--text-secondary)] text-sm leading-relaxed whitespace-pre-wrap border-t border-gray-100 dark:border-gray-800 pt-6">
               <p>{activeMail.preview}</p>
               <br/>
               <p>
               Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
               </p>
               <br/>
               <p>
               Best Regards,<br/>
               {activeMail.sender}
               </p>
             </div>

             <div className="mt-8 flex gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)] rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Reply size={16} /> Reply
               </button>
               <button className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)] rounded-lg text-sm font-medium text-[var(--text-main)] hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <Trash size={16} /> Delete
               </button>
             </div>
           </motion.div>
         ) : (
           <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)] opacity-50">
              <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mb-4">
                 <Reply size={32} />
              </div>
              <p>Select a mail to read</p>
           </div>
         )}
      </div>
    </motion.div>
  )
}
