import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function LostFound() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    item_type: 'lost',
    title: '',
    description: '',
    location: '',
    category: '',
    contact_info: '',
  })

  const load = () => {
    const params = {}
    if (filter) params.item_type = filter
    api.get('/lost-found/items', { params }).then((r) => setItems(r.data)).catch(() => {})
  }

  useEffect(load, [filter])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/lost-found/items', form)
      toast.success('Report submitted!')
      setShowForm(false)
      setForm({ item_type: 'lost', title: '', description: '', location: '', category: '', contact_info: '' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  const resolve = async (id) => {
    try {
      await api.patch(`/lost-found/items/${id}/resolve`)
      toast.success('Marked as resolved!')
      load()
    } catch {
      toast.error('Could not update')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">🔍 Lost & Found</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Report Item'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 slide-up space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <select className="input-field" value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>
            <input className="input-field" placeholder="Item name" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input className="input-field" placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <input className="input-field" placeholder="Category (e.g. electronics)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          </div>
          <textarea className="input-field resize-none h-20" placeholder="Describe the item…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input-field" placeholder="Contact info (phone/email)" value={form.contact_info} onChange={(e) => setForm({ ...form, contact_info: e.target.value })} required />
          <button type="submit" className="btn-primary">Submit Report</button>
        </form>
      )}

      {/* Filter pills */}
      <div className="flex gap-2 mb-6">
        {['', 'lost', 'found'].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === '' ? 'All' : f === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No reports yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col sm:flex-row sm:items-start gap-4">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.item_type === 'lost' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                {item.item_type === 'lost' ? '📛' : '✅'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <span className={`badge ${item.item_type === 'lost' ? 'badge-red' : 'badge-green'}`}>
                    {item.item_type}
                  </span>
                  {item.status === 'resolved' && <span className="badge badge-gray">Resolved</span>}
                </div>
                <p className="text-sm text-gray-600 mb-1">{item.description}</p>
                <p className="text-xs text-gray-400">📍 {item.location} &bull; 📞 {item.contact_info}</p>
              </div>
              {item.status !== 'resolved' && (
                <button onClick={() => resolve(item.id)} className="btn-secondary text-xs flex-shrink-0">
                  Mark Resolved
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
