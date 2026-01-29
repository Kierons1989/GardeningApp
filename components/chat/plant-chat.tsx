'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { CircleNotch, ChatCircle, PaperPlaneRight, Camera, X, ImageSquare } from '@phosphor-icons/react'
import type { Plant, TaskHistory, ChatMessage, ChatMessageImage } from '@/types/database'
import { prepareImageForChat, createImagePreviewUrl, revokeImagePreviewUrl } from '@/lib/utils/image-to-base64'
import { validateImageType } from '@/lib/utils/image-resize'

interface PlantChatProps {
  plant: Plant
  taskHistory?: TaskHistory[]
}

interface PendingImage {
  file: File
  previewUrl: string
}

interface DisplayMessage extends ChatMessage {
  hasImage?: boolean
  imagePreviewUrl?: string
}

export default function PlantChat({ plant }: PlantChatProps) {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [pendingImage, setPendingImage] = useState<PendingImage | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (pendingImage) {
        revokeImagePreviewUrl(pendingImage.previewUrl)
      }
    }
  }, [pendingImage])

  const handleFileSelect = useCallback((file: File) => {
    setImageError(null)

    const typeCheck = validateImageType(file)
    if (!typeCheck.valid) {
      setImageError(typeCheck.error || 'Invalid file type')
      return
    }

    // Clean up previous preview
    if (pendingImage) {
      revokeImagePreviewUrl(pendingImage.previewUrl)
    }

    const previewUrl = createImagePreviewUrl(file)
    setPendingImage({ file, previewUrl })
  }, [pendingImage])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0])
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const removePendingImage = useCallback(() => {
    if (pendingImage) {
      revokeImagePreviewUrl(pendingImage.previewUrl)
      setPendingImage(null)
    }
    setImageError(null)
  }, [pendingImage])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && !pendingImage) || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setImageError(null)

    // Prepare image data if attached
    let imageData: ChatMessageImage | undefined
    let imagePreviewForDisplay: string | undefined

    if (pendingImage) {
      try {
        imageData = await prepareImageForChat(pendingImage.file)
        imagePreviewForDisplay = pendingImage.previewUrl
        setPendingImage(null) // Clear pending but keep preview URL for display
      } catch (err) {
        console.error('Failed to process image:', err)
        setImageError('Failed to process image')
        setLoading(false)
        return
      }
    }

    // Add user message immediately with preview
    const newUserMessage: DisplayMessage = {
      role: 'user',
      content: userMessage || (imageData ? 'What do you see in this image?' : ''),
      image: imageData,
      imagePreviewUrl: imagePreviewForDisplay,
    }

    const newMessages: DisplayMessage[] = [...messages, newUserMessage]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId: plant.id,
          messages: newMessages.map(msg => ({
            role: msg.role,
            content: msg.content,
            image: msg.image,
            timestamp: msg.timestamp,
          })),
          sessionId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: DisplayMessage = {
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

  const canSubmit = (input.trim() || pendingImage) && !loading

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
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              You can also attach photos for diagnosis
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
                {/* Image attachment indicator or preview */}
                {(message.hasImage || message.imagePreviewUrl) && (
                  <div className="mb-2">
                    {message.imagePreviewUrl ? (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                        <Image
                          src={message.imagePreviewUrl}
                          alt="Attached image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
                        style={{
                          background: message.role === 'user'
                            ? 'rgba(255,255,255,0.15)'
                            : 'var(--stone-200)',
                        }}
                      >
                        <ImageSquare size={14} weight="fill" />
                        <span>Photo attached</span>
                      </div>
                    )}
                  </div>
                )}
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

      {/* Image Preview */}
      <AnimatePresence>
        {pendingImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-2"
          >
            <div
              className="inline-flex items-start gap-2 p-2 rounded-xl"
              style={{ background: 'var(--sage-50)', border: '1px solid var(--sage-200)' }}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={pendingImage.previewUrl}
                  alt="Image to send"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                onClick={removePendingImage}
                className="p-1 rounded-full transition-colors hover:bg-sage-200"
                style={{ background: 'var(--sage-100)' }}
                aria-label="Remove image"
              >
                <X size={14} weight="bold" color="var(--sage-700)" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {imageError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="px-4 pb-2"
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {imageError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t flex gap-3 items-end"
        style={{ borderColor: 'var(--stone-200)' }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Attach image"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="btn-icon btn-icon-secondary flex-shrink-0"
          style={{ opacity: loading ? 0.5 : 1 }}
          aria-label="Attach photo"
          title="Attach a photo"
        >
          <Camera size={20} weight="light" />
        </button>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={pendingImage ? "Add a message about this photo..." : "Ask about your plant..."}
          className="input flex-1"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={!canSubmit}
          className="btn btn-primary px-4 flex-shrink-0"
          style={{ opacity: canSubmit ? 1 : 0.5 }}
        >
          <PaperPlaneRight size={20} weight="light" />
        </button>
      </form>
    </div>
  )
}
