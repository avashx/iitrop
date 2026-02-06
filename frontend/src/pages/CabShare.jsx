import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function CabShare() {
  const [trips, setTrips] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    origin: 'IIT Ropar Campus',
    destination: '',
    departure_time: '',
    seats_total: 4,
    price_per_person: '',
    notes: '',
    contact_number: '',
  })

  const load = () => api.get('/cab/trips').then((r) => setTrips(r.data)).catch(() => {})
  useEffect(load, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.post('/cab/trips', {
        ...form,
        seats_total: parseInt(form.seats_total),
        price_per_person: parseFloat(form.price_per_person),
      })
      toast.success('Trip posted!')
      setShowForm(false)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  const joinTrip = async (id) => {
    try {
      await api.post(`/cab/trips/${id}/join`)
      toast.success('Joined the ride!')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not join')
    }
  }

  const leaveTrip = async (id) => {
    try {
      await api.post(`/cab/trips/${id}/leave`)
      toast.success('Left the ride')
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not leave')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">🚕 Cab Sharing</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancel' : '+ Post Ride'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 slide-up space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Origin" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} required />
            <input className="input-field" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} required />
            <input type="datetime-local" className="input-field" value={form.departure_time} onChange={(e) => setForm({ ...form, departure_time: e.target.value })} required />
            <input type="number" className="input-field" placeholder="Total seats" value={form.seats_total} onChange={(e) => setForm({ ...form, seats_total: e.target.value })} min={1} max={7} />
            <input type="number" className="input-field" placeholder="Price per person (₹)" value={form.price_per_person} onChange={(e) => setForm({ ...form, price_per_person: e.target.value })} required />
            <input className="input-field" placeholder="Your phone number" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} required />
          </div>
          <textarea className="input-field resize-none h-16" placeholder="Notes (e.g. can drop at Sector 17)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button type="submit" className="btn-primary">Post Ride</button>
        </form>
      )}

      {trips.length === 0 ? (
        <div className="card text-center py-12 text-gray-400">No upcoming rides. Be the first to post!</div>
      ) : (
        <div className="space-y-4">
          {trips.map((trip) => {
            const dep = new Date(trip.departure_time)
            const past = dep < new Date()
            return (
              <div key={trip.id} className={`card ${past ? 'opacity-60' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {trip.origin} → {trip.destination}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">
                      🗓 {format(dep, 'EEE, dd MMM yyyy')} at {format(dep, 'hh:mm a')}
                    </p>
                    {trip.notes && <p className="text-xs text-gray-400 mt-1">💬 {trip.notes}</p>}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-primary-600">₹{trip.price_per_person}</p>
                      <p className="text-xs text-gray-400">per person</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">{trip.seats_available}</p>
                      <p className="text-xs text-gray-400">seats left</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 flex-1">📞 {trip.contact_number} &bull; Posted by {trip.creator?.full_name || 'Someone'}</p>
                  {!past && trip.seats_available > 0 && (
                    <button onClick={() => joinTrip(trip.id)} className="btn-primary text-xs">Join Ride</button>
                  )}
                  <button onClick={() => leaveTrip(trip.id)} className="btn-secondary text-xs">Leave</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
