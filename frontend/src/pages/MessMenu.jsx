import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Utensils, AlertTriangle, Info, ThumbsUp, ThumbsDown } from 'lucide-react'

const MOCK_MENU = {
  today: [
    { id: 1, meal: 'Breakfast', time: '7:30 - 9:30 AM', items: 'Aloo Paratha, Dahi, Pickle, Tea/Coffee', calories: '450 kcal', rating: 4.5, status: 'Live Now' },
    { id: 2, meal: 'Lunch', time: '12:30 - 2:30 PM', items: 'Rajma Chawal, Jeera Aloo, Roti, Salad, Boondi Raita', calories: '750 kcal', rating: 4.2, status: 'Upcoming' },
    { id: 3, meal: 'Snacks', time: '5:00 - 6:00 PM', items: 'Samosa, Green Chutney, Masala Chai', calories: '250 kcal', rating: 4.8, status: 'Upcoming' },
    { id: 4, meal: 'Dinner', time: '7:30 - 9:30 PM', items: 'Patta Gobi (Again?), Dal Fry, Rice, Roti, Gulab Jamun', calories: '600 kcal', rating: 2.5, status: 'Upcoming' },
  ]
}

export default function MessMenu() {
  const [activeTab, setActiveTab] = useState('Today')
  const [votes, setVotes] = useState({})

  const handleVote = (id, type) => {
    setVotes(prev => ({ ...prev, [id]: type }))
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto"
    >
      <div className="flex justify-between items-center mb-8">
         <div>
            <h1 className="text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
              <span className="text-orange-500">Mess Menu</span>
              <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-2 py-1 rounded-full uppercase tracking-wider">Satpura Hostel</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm mt-1">Aaj kya bana hai? (Disappointment or Surprise?)</p>
         </div>
      </div>

      <div className="grid gap-6">
         {MOCK_MENU.today.map((meal, index) => (
           <motion.div 
             key={meal.id}
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             transition={{ delay: index * 0.1 }}
             className="glass-panel p-6 rounded-2xl relative overflow-hidden"
           >
             {/* Status Badge */}
             <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl text-xs font-bold uppercase tracking-wider ${
               meal.status === 'Live Now' ? 'bg-[#00ED64] text-[#001E2B]' : 'bg-[var(--bg-hover)] text-[var(--text-secondary)]'
             }`}>
               {meal.status}
             </div>

             <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                     meal.rating > 4 ? 'bg-green-100 dark:bg-green-900/20' : 
                     meal.rating < 3 ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
                  }`}>
                     {meal.meal === 'Breakfast' && '☕️'}
                     {meal.meal === 'Lunch' && '🍛'}
                     {meal.meal === 'Snacks' && '🥟'}
                     {meal.meal === 'Dinner' && '🍱'}
                  </div>
                </div>

                <div className="flex-1">
                   <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-[var(--text-main)]">{meal.meal}</h3>
                      <span className="text-sm font-medium text-[var(--text-secondary)] bg-[var(--bg-hover)] px-2 py-0.5 rounded-lg flex items-center gap-1">
                        <Utensils size={12} /> {meal.time}
                      </span>
                   </div>
                   
                   <p className="text-[var(--text-main)] text-sm font-medium leading-relaxed mb-3">
                     {meal.items}
                   </p>

                   <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                      <span className="flex items-center gap-1">
                        <Info size={12} /> {meal.calories}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-500 font-bold">
                        <Star size={12} fill="currentColor" /> {meal.rating}/5
                      </span>
                      {meal.rating < 3 && (
                         <span className="flex items-center gap-1 text-red-500">
                           <AlertTriangle size={12} /> High Risk Advisory
                         </span>
                      )}
                   </div>
                </div>

                {/* Voting / Interactive Part */}
                <div className="flex flex-row md:flex-col gap-2 items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 pt-4 md:pt-0 md:pl-6">
                   <button 
                     onClick={() => handleVote(meal.id, 'up')}
                     className={`p-2 rounded-lg transition-all ${votes[meal.id] === 'up' ? 'bg-green-100 text-green-600 dark:bg-green-900/40' : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}
                   >
                     <ThumbsUp size={20} />
                   </button>
                   <span className="text-xs font-bold text-[var(--text-secondary)]">Vote</span>
                   <button 
                     onClick={() => handleVote(meal.id, 'down')}
                     className={`p-2 rounded-lg transition-all ${votes[meal.id] === 'down' ? 'bg-red-100 text-red-600 dark:bg-red-900/40' : 'hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]'}`}
                   >
                     <ThumbsDown size={20} />
                   </button>
                </div>
             </div>
           </motion.div>
         ))}
      </div>
    </motion.div>
  )
}
