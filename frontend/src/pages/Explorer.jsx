import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Explorer() {
  const [places, setPlaces] = useState([])
  const [recs, setRecs] = useState([])
  const [tab, setTab] = useState('all')
  const [showRecs, setShowRecs] = useState(false)
  const [vibes, setVibes] = useState('')

  const load = () => {
    const params = {}
    if (tab !== 'all') params.category = tab
    api.get('/explorer/places', { params }).then((r) => setPlaces(r.data)).catch(() => {})
  }

  useEffect(load, [tab])

  const getRecommendations = async () => {
    if (!vibes.trim()) return toast.error('Enter your vibes!')
    try {
      const res = await api.get('/explorer/recommend', { params: { vibes } })
      setRecs(res.data)
      setShowRecs(true)
      toast.success('Recommendations ready!')
    } catch {
      toast.error('Failed to get recommendations')
    }
  }

  const categoryIcon = (cat) => {
    const icons = { restaurant: '🍽️', cafe: '☕', attraction: '🏞️', dessert: '🍨', gym: '🏋️', other: '📍' }
    return icons[cat] || '📍'
  }

  return (
    <div>
      <h1 className="page-title">🗺️ Explorer's Guide</h1>

      {/* Recommendation section */}
      <div className="card mb-6 bg-gradient-to-r from-accent-50 to-purple-50 border-accent-200">
        <h3 className="font-semibold text-gray-800 mb-2">✨ AI Recommendations</h3>
        <p className="text-sm text-gray-500 mb-3">Tell us your vibe and we'll suggest the best spots near campus.</p>
        <div className="flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="e.g. budget, late-night, study-friendly, nature"
            value={vibes}
            onChange={(e) => setVibes(e.target.value)}
          />
          <button onClick={getRecommendations} className="btn-primary whitespace-nowrap">
            Get Picks
          </button>
        </div>
      </div>

      {showRecs && recs.length > 0 && (
        <div className="mb-8 slide-up">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Recommended for you</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recs.map((p) => (
              <div key={p.id} className="card border-2 border-accent-200 bg-accent-50/30">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{categoryIcon(p.category)}</span>
                  <h4 className="font-semibold text-gray-800">{p.name}</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">{p.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>💰 ₹{p.avg_cost || 'Free'}</span>
                  {p.student_discount && <span className="badge badge-green">Student Discount</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'restaurant', 'cafe', 'dessert', 'attraction'].map((c) => (
          <button key={c} onClick={() => setTab(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === c ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {c === 'all' ? 'All Places' : categoryIcon(c) + ' ' + c.charAt(0).toUpperCase() + c.slice(1) + 's'}
          </button>
        ))}
      </div>

      {/* Places grid */}
      {places.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No places found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {places.map((p) => (
            <div key={p.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{categoryIcon(p.category)}</span>
                <h3 className="font-semibold text-gray-800 text-sm">{p.name}</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3 line-clamp-2">{p.description}</p>
              <div className="space-y-1 text-xs text-gray-500">
                <p>📍 {p.address}</p>
                {p.opening_hours && <p>🕐 {p.opening_hours}</p>}
                <p>💰 Avg: ₹{p.avg_cost || 'Free'}</p>
                {p.phone && <p>📞 {p.phone}</p>}
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {p.vibe_tags?.split(',').map((tag) => (
                  <span key={tag} className="badge badge-purple text-xs">{tag.trim()}</span>
                ))}
              </div>
              {p.student_discount && (
                <p className="text-xs text-green-600 font-medium mt-2">🎓 Student discount available</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
