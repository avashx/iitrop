import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function Marketplace() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', price: '', category: 'textbooks', condition: 'good' })

  const load = () => {
    const params = {}
    if (search) params.search = search
    if (category) params.category = category
    api.get('/marketplace/items', { params }).then((r) => setItems(r.data)).catch(() => {})
  }

  useEffect(load, [search, category])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/marketplace/items', { ...form, price: parseFloat(form.price) })
      toast.success('Listing created!')
      setShowForm(false)
      setForm({ title: '', description: '', price: '', category: 'textbooks', condition: 'good' })
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create')
    }
  }

  const CONDITION_BADGE = { excellent: 'badge-green', good: 'badge-blue', fair: 'badge-yellow', poor: 'badge-red' }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">🛒 Student Marketplace</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Sell Item'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 slide-up">
          <h3 className="font-semibold text-gray-800 mb-4">List a new item</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            <input type="number" className="input-field" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="textbooks">Textbooks</option>
              <option value="electronics">Electronics</option>
              <option value="cycles">Cycles</option>
              <option value="furniture">Furniture</option>
              <option value="clothing">Clothing</option>
              <option value="other">Other</option>
            </select>
            <select className="input-field" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
          <textarea className="input-field mt-4 resize-none h-24" placeholder="Description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <button type="submit" className="btn-primary mt-4">Publish Listing</button>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input className="input-field max-w-xs" placeholder="Search items…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="input-field w-40" value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          <option value="textbooks">Textbooks</option>
          <option value="electronics">Electronics</option>
          <option value="cycles">Cycles</option>
          <option value="furniture">Furniture</option>
          <option value="clothing">Clothing</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No items found.</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-800 text-sm leading-snug">{item.title}</h3>
                <span className="text-primary-600 font-bold text-lg whitespace-nowrap ml-2">₹{item.price}</span>
              </div>
              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-gray">{item.category}</span>
                <span className={`badge ${CONDITION_BADGE[item.condition] || 'badge-gray'}`}>{item.condition}</span>
              </div>
              {item.seller && (
                <p className="text-xs text-gray-400 mt-3">Seller: {item.seller.full_name}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
