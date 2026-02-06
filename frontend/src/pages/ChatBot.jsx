import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hey there! 👋 I'm Nexus Bot — your campus assistant. Ask me about the mess menu, timetable, lost items, marketplace, cab sharing, or anything campus-related!" },
  ])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    setMessages((prev) => [...prev, { role: 'user', text }])
    setInput('')
    setBusy(true)

    try {
      const res = await api.post('/chat/message', { message: text })
      setMessages((prev) => [...prev, { role: 'bot', text: res.data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Oops, something went wrong. Try again!' }])
    } finally {
      setBusy(false)
    }
  }

  const suggestions = [
    "What's for lunch today?",
    "Where can I study late night?",
    "How do I share a cab?",
    "I lost my ID card",
    "Tell me about clubs",
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <h1 className="page-title">🤖 Campus Bot</h1>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm text-gray-400">
              Typing…
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => { setInput(s); }}
              className="px-3 py-1.5 rounded-full bg-gray-100 text-xs text-gray-600 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={send} className="flex gap-3">
        <input
          className="input-field flex-1"
          placeholder="Ask me anything about campus…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary">
          Send
        </button>
      </form>
    </div>
  )
}
