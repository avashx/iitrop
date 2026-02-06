import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const MEAL_LABELS = { breakfast: '🌅 Breakfast', lunch: '☀️ Lunch', snacks: '🍵 Snacks', dinner: '🌙 Dinner' }

export default function MessMenu() {
  const [menus, setMenus] = useState([])
  const [tab, setTab] = useState('today')
  const [rating, setRating] = useState({})

  useEffect(() => {
    const endpoint = tab === 'today' ? '/mess/today' : '/mess/week'
    api.get(endpoint).then((r) => setMenus(r.data)).catch(() => toast.error('Failed to load menu'))
  }, [tab])

  const submitRating = async (menuId) => {
    const val = rating[menuId]
    if (!val || val < 1 || val > 5) return toast.error('Rating must be 1-5')
    try {
      await api.post('/mess/rate', { menu_id: menuId, score: parseInt(val), comment: '' })
      toast.success('Rating submitted!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not rate')
    }
  }

  // group menus by date
  const grouped = menus.reduce((acc, m) => {
    const d = m.date
    if (!acc[d]) acc[d] = []
    acc[d].push(m)
    return acc
  }, {})

  return (
    <div>
      <h1 className="page-title">🍽️ Mess Menu</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['today', 'week'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'today' ? "Today's Menu" : 'This Week'}
          </button>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="card text-center py-12 text-gray-400">
          <p className="text-lg">No menu data available yet.</p>
          <p className="text-sm mt-1">Ask the mess committee to upload it!</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, items]) => (
        <div key={date} className="mb-8">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((m) => (
              <div key={m.id} className="card">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-800">{MEAL_LABELS[m.meal_type] || m.meal_type}</h4>
                  {m.allergens && (
                    <span className="badge badge-yellow text-xs">⚠️ {m.allergens}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{m.items}</p>
                {m.nutritional_info && (
                  <p className="text-xs text-gray-400 mb-3">{m.nutritional_info}</p>
                )}

                {/* Quick rating */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <input
                    type="number"
                    min={1}
                    max={5}
                    placeholder="1-5"
                    className="input-field w-20"
                    value={rating[m.id] || ''}
                    onChange={(e) => setRating({ ...rating, [m.id]: e.target.value })}
                  />
                  <button onClick={() => submitRating(m.id)} className="btn-primary text-xs">
                    Rate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
