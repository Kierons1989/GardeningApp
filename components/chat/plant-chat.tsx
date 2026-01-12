'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CircleNotch, ChatCircle, PaperPlaneRight } from '@phosphor-icons/react'
import type { Plant, TaskHistory, ChatMessage } from '@/types/database'

interface PlantChatProps {
  plant: Plant
  taskHistory?: TaskHistory[]
}

export default function PlantChat({ plant }: PlantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversation history on mount
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch(`/api/ai/chat?plantId=${plant.id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.conversation) {
            setMessages(data.conversation.messages || [])
            setSessionId(data.conversation.session_id)
          }
        }
      } catch (error) {
        console.error('Failed to load conversation:', error)
      } finally {
        setLoadingHistory(false)
      }
    }
    loadConversation()
  }, [plant.id])

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
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString(),
      }
      setMessages([...newMessages, assistantMessage])
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
        className="px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--stone-200)' }}
      >
        <div>
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
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([])
              setSessionId(null)
            }}
            className="text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: 'var(--stone-100)',
              color: 'var(--text-secondary)',
            }}
          >
            New conversation
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        className="p-4 space-y-4 overflow-y-auto"
        style={{ maxHeight: '400px', minHeight: '200px' }}
      >
        {loadingHistory ? (
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--sage-100)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <CircleNotch size={32} weight="light" color="var(--sage-600)" />
              </motion.div>
            </div>
            <p style={{ color: 'var(--text-muted)' }}>
              Loading conversation...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: 'var(--sage-100)' }}
            >
              <ChatCircle size={40} weight="light" color="var(--sage-600)" />
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
        ) : null}

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
          <PaperPlaneRight size={20} weight="light" />
        </button>
      </form>
    </div>
  )
}
