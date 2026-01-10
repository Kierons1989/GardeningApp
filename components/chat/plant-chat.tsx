'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant, TaskHistory, ChatMessage } from '@/types/database'

interface PlantChatProps {
  plant: Plant
  taskHistory: TaskHistory[]
}

export default function PlantChat({ plant, taskHistory }: PlantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message immediately
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: plant.id,
          messages: newMessages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      setMessages([
        ...newMessages,
        { role: 'assistant', content: data.response },
      ])
    } catch {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Sorry, I had trouble responding. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 border-b"
        style={{ borderColor: 'var(--stone-200)' }}
      >
        <h3
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Ask about {plant.name}
        </h3>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Get UK-specific advice for your plant
        </p>
      </div>

      {/* Messages */}
      <div
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: '400px', minHeight: '200px' }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--sage-100)' }}
            >
              <span className="text-2xl">💬</span>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Ask me anything about caring for your {plant.common_name || plant.name}
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {[
                'When should I prune?',
                'How often should I water?',
                'Any pest problems to watch for?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-sm rounded-full transition-colors"
                  style={{
                    background: 'var(--stone-100)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user' ? 'rounded-br-sm' : 'rounded-bl-sm'
                }`}
                style={{
                  background:
                    message.role === 'user'
                      ? 'var(--sage-600)'
                      : 'var(--stone-100)',
                  color: message.role === 'user' ? 'white' : 'var(--text-primary)',
                }}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div
              className="rounded-2xl rounded-bl-sm px-4 py-3"
              style={{ background: 'var(--stone-100)' }}
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--stone-400)' }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex gap-3"
        style={{ borderColor: 'var(--stone-200)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your plant..."
          className="input flex-1"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="btn btn-primary px-4"
          style={{
            opacity: !input.trim() || loading ? 0.5 : 1,
          }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  )
}
