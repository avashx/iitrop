import { useState } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CATEGORY_COLORS = {
  academic: 'badge-blue',
  event: 'badge-purple',
  club: 'badge-green',
  urgent: 'badge-red',
  personal: 'badge-gray',
}

export default function MailHub() {
  const [subject, setSubject] = useState('')
  const [sender, setSender] = useState('')
  const [body, setBody] = useState('')
  const [result, setResult] = useState(null)
  const [busy, setBusy] = useState(false)

  const handleSummarize = async (e) => {
    e.preventDefault()
    if (!body.trim()) return toast.error('Paste the mail body')
    setBusy(true)
    try {
      const res = await api.post('/mail/summarize', { subject, sender, body })
      setResult(res.data)
      toast.success('Mail processed!')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to summarize')
    } finally {
      setBusy(false)
    }
  }

  const priorityLabel = (score) => {
    if (score >= 0.7) return { text: 'High Priority', cls: 'badge-red' }
    if (score >= 0.4) return { text: 'Medium', cls: 'badge-yellow' }
    return { text: 'Low', cls: 'badge-green' }
  }

  return (
    <div>
      <h1 className="page-title">📬 AI Mail Summarizer</h1>
      <p className="text-sm text-gray-500 mb-6">
        Paste any email and our NLP engine will summarize it, detect the category, extract action items and deadlines.
      </p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <form onSubmit={handleSummarize} className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input className="input-field" placeholder="Midterm Exam Schedule..." value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input className="input-field" placeholder="dean@iitrpr.ac.in" value={sender} onChange={(e) => setSender(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
            <textarea
              className="input-field h-48 resize-none"
              placeholder="Paste the full email content here…"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Analyzing…' : '✨ Summarize & Analyze'}
          </button>
        </form>

        {/* Result */}
        {result ? (
          <div className="space-y-4 slide-up">
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <span className={`badge ${CATEGORY_COLORS[result.category] || 'badge-gray'}`}>
                  {result.category}
                </span>
                <span className={`badge ${priorityLabel(result.priority_score).cls}`}>
                  {priorityLabel(result.priority_score).text}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">Summary</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
            </div>

            {result.action_items && (
              <div className="card">
                <h3 className="font-semibold text-gray-800 mb-2">📝 Action Items</h3>
                <ul className="space-y-1">
                  {JSON.parse(result.action_items).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-primary-500 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {result.deadline && (
              <div className="card bg-yellow-50 border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-1">⏰ Deadline Detected</h3>
                <p className="text-sm text-yellow-700">{result.deadline}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="card flex items-center justify-center text-gray-400 min-h-[300px]">
            <div className="text-center">
              <p className="text-4xl mb-3">📨</p>
              <p className="text-sm">Paste an email and hit summarize to see the magic</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
