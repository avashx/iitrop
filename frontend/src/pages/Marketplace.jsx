import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Tag, Filter, Plus } from 'lucide-react'

const MOCK_ITEMS = [
  { id: 1, title: 'Mini Drafter (Used only once)', price: 350, condition: 'Like New', category: 'Stationery', seller: 'Amit (ME)', time: '2h ago' },
  { id: 2, title: 'Cycle - Hero Sprint', price: 2500, condition: 'Good', category: 'Vehicle', seller: 'Rahul (EE)', time: '5h ago' },
  { id: 3, title: 'RD Sharma Class 11 & 12', price: 800, condition: 'Fair', category: 'Books', seller: 'Sanya (CS)', time: '1d ago' },
  { id: 4, title: 'Mattress (Single Bed)', price: 1200, condition: 'Clean', category: 'Furniture', seller: 'Vikram (CE)', time: '1d ago' },
  { id: 5, title: 'Scientific Calculator fx-991ES', price: 600, condition: 'Excellent', seller: 'Priya (CH)', time: '2d ago' },
  { id: 6, title: 'Induction Cooktop', price: 1500, condition: 'Working', category: 'Electronics', seller: 'Dev (CS)', time: '3d ago' },
]

export default function Marketplace() {
  const [items, setItems] = useState(MOCK_ITEMS)
  const [showForm, setShowForm] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
            <span className="text-green-500">Campus OLX</span>
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-1 rounded-full uppercase tracking-wider">Buy & Sell</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mt-1">Saman becho, paisa kamao (for canteen).</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-[#00ED64] text-[#001E2B] px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:scale-105 transition-all flex items-center gap-2"
        >
          <Plus size={18} /> Bech De Bhai
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-2 rounded-xl flex gap-2 mb-8">
         <div className="bg-[var(--bg-main)] flex-1 rounded-lg flex items-center px-3 border border-transparent focus-within:border-[#00ED64]/50 transition-colors">
            <Search size={18} className="text-gray-400" />
            <input 
              placeholder="Search for drafters, cycles, books..." 
              className="bg-transparent border-none outline-none text-sm w-full p-2 text-[var(--text-main)] placeholder-gray-400"
            />
         </div>
         <button className="p-2.5 bg-[var(--bg-hover)] text-[var(--text-secondary)] rounded-lg hover:text-[var(--text-main)] transition-colors">
            <Filter size={18} />
         </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
         {items.map((item, index) => (
           <motion.div 
             key={item.id}
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: index * 0.1 }}
             className="glass-panel p-5 rounded-2xl group hover:border-[#00ED64]/40 transition-all cursor-pointer"
           >
             <div className="flex justify-between items-start mb-3">
               <span className="bg-[var(--bg-hover)] text-[var(--text-secondary)] text-[10px] px-2 py-1 rounded-md font-medium uppercase tracking-wider">
                 {item.category || 'General'}
               </span>
               <span className="text-[10px] text-gray-400">{item.time}</span>
             </div>
             
             <h3 className="text-lg font-bold text-[var(--text-main)] mb-1 group-hover:text-[#00ED64] transition-colors line-clamp-1">
               {item.title}
             </h3>
             <div className="flex justify-between items-end">
               <div>
                  <p className="text-xs text-[var(--text-secondary)] mb-2">Condition: <span className="text-[var(--text-main)]">{item.condition}</span></p>
                  <div className="flex items-center gap-2">
                     <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-[8px] text-white font-bold">
                        {item.seller[0]}
                     </div>
                     <span className="text-xs text-[var(--text-secondary)]">{item.seller}</span>
                  </div>
               </div>
               <span className="text-xl font-bold text-green-500">₹{item.price}</span>
             </div>
           </motion.div>
         ))}
      </div>
    </motion.div>
  )
}
