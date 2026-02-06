import { useEffect, useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Academics() {
  const [tab, setTab] = useState('timetable')
  const [timetable, setTimetable] = useState([])
  const [assignments, setAssignments] = useState([])
  const [showTTForm, setShowTTForm] = useState(false)
  const [ttForm, setTTForm] = useState({
    course_code: '',
    course_name: '',
    instructor: '',
    day_of_week: 0,
    start_time: '',
    end_time: '',
    room: '',
  })

  useEffect(() => {
    if (tab === 'timetable') {
      api.get('/academic/timetable').then((r) => setTimetable(r.data)).catch(() => {})
    } else {
      api.get('/academic/assignments').then((r) => setAssignments(r.data)).catch(() => {})
    }
  }, [tab])

  const addTT = async (e) => {
    e.preventDefault()
    try {
      await api.post('/academic/timetable', { ...ttForm, day_of_week: parseInt(ttForm.day_of_week) })
      toast.success('Class added!')
      setShowTTForm(false)
      api.get('/academic/timetable').then((r) => setTimetable(r.data))
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed')
    }
  }

  // group timetable by day
  const byDay = timetable.reduce((acc, entry) => {
    const day = entry.day_of_week
    if (!acc[day]) acc[day] = []
    acc[day].push(entry)
    return acc
  }, {})

  const dueStatus = (due) => {
    const d = new Date(due)
    const now = new Date()
    const diff = (d - now) / (1000 * 60 * 60)
    if (diff < 0) return { text: 'Overdue', cls: 'badge-red' }
    if (diff < 24) return { text: 'Due soon', cls: 'badge-yellow' }
    return { text: `Due ${format(d, 'dd MMM')}`, cls: 'badge-blue' }
  }

  return (
    <div>
      <h1 className="page-title">🎓 Academic Cockpit</h1>

      <div className="flex gap-2 mb-6">
        {['timetable', 'assignments'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {t === 'timetable' ? '📅 Timetable' : '📝 Assignments'}
          </button>
        ))}
      </div>

      {/* ---- Timetable ---- */}
      {tab === 'timetable' && (
        <div>
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowTTForm(!showTTForm)} className="btn-primary text-sm">
              {showTTForm ? 'Cancel' : '+ Add Class'}
            </button>
          </div>

          {showTTForm && (
            <form onSubmit={addTT} className="card mb-6 slide-up space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <input className="input-field" placeholder="Course Code (CS301)" value={ttForm.course_code} onChange={(e) => setTTForm({ ...ttForm, course_code: e.target.value })} required />
                <input className="input-field" placeholder="Course Name" value={ttForm.course_name} onChange={(e) => setTTForm({ ...ttForm, course_name: e.target.value })} required />
                <input className="input-field" placeholder="Instructor" value={ttForm.instructor} onChange={(e) => setTTForm({ ...ttForm, instructor: e.target.value })} />
              </div>
              <div className="grid md:grid-cols-4 gap-4">
                <select className="input-field" value={ttForm.day_of_week} onChange={(e) => setTTForm({ ...ttForm, day_of_week: e.target.value })}>
                  {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                </select>
                <input type="time" className="input-field" value={ttForm.start_time} onChange={(e) => setTTForm({ ...ttForm, start_time: e.target.value })} required />
                <input type="time" className="input-field" value={ttForm.end_time} onChange={(e) => setTTForm({ ...ttForm, end_time: e.target.value })} required />
                <input className="input-field" placeholder="Room (LHC-203)" value={ttForm.room} onChange={(e) => setTTForm({ ...ttForm, room: e.target.value })} />
              </div>
              <button type="submit" className="btn-primary">Add to Timetable</button>
            </form>
          )}

          {Object.keys(byDay).length === 0 ? (
            <div className="card text-center py-12 text-gray-400">No classes added yet. Start building your timetable!</div>
          ) : (
            <div className="space-y-6">
              {Object.entries(byDay)
                .sort(([a], [b]) => a - b)
                .map(([day, entries]) => (
                  <div key={day}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {DAYS[day]}
                    </h3>
                    <div className="space-y-2">
                      {entries
                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                        .map((entry) => (
                          <div key={entry.id} className={`card flex items-center gap-4 ${entry.is_cancelled ? 'opacity-50 line-through' : ''}`}>
                            <div className="text-center min-w-[80px]">
                              <p className="text-sm font-bold text-primary-600">{entry.start_time}</p>
                              <p className="text-xs text-gray-400">{entry.end_time}</p>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800 text-sm">
                                {entry.course_code} — {entry.course_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {entry.instructor && `👤 ${entry.instructor}`} {entry.room && `• 🏫 ${entry.room}`}
                              </p>
                            </div>
                            {entry.is_cancelled && <span className="badge badge-red">Cancelled</span>}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ---- Assignments ---- */}
      {tab === 'assignments' && (
        <div>
          {assignments.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">No assignments posted yet.</div>
          ) : (
            <div className="space-y-4">
              {assignments.map((a) => {
                const status = dueStatus(a.due_date)
                return (
                  <div key={a.id} className="card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="badge badge-blue">{a.course_code}</span>
                          <span className={`badge ${status.cls}`}>{status.text}</span>
                        </div>
                        <h3 className="font-semibold text-gray-800">{a.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{a.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-800">{a.max_marks}</p>
                        <p className="text-xs text-gray-400">marks</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
