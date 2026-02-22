'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { CircleNotch, PaperPlaneRight, Camera, X, ImageSquare, Plus, Plant, Leaf } from '@phosphor-icons/react'
import type { ChatMessage, ChatMessageImage } from '@/types/database'
import { prepareImageForChat, createImagePreviewUrl, revokeImagePreviewUrl } from '@/lib/utils/image-to-base64'
import { validateImageType } from '@/lib/utils/image-resize'

interface PendingImage {
  id: string
  file: File
  previewUrl: string
}

interface DisplayMessage extends ChatMessage {
  hasImage?: boolean
  imageCount?: number
  imagePreviewUrls?: string[]
}

const MAX_IMAGES = 3

const SUGGESTIONS = [
  'What should I focus on this week?',
  'Which plants need attention?',
  'Any jobs coming up this month?',
]

export default function GardenChat() {
  const [messages, setMessages] = useState<DisplayMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([])
  const [imageError, setImageError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // Load conversation history on mount
  useEffect(() => {
    async function loadConversation() {
      try {
        const response = await fetch('/api/ai/garden-chat')
        if (response.ok) {
          const data = await response.json()
          if (data.conversation) {
            setMessages(data.conversation.messages || [])
            setSessionId(data.conversation.session_id)
          }
        }
      } catch (error) {
        console.error('Failed to load garden conversation:', error)
      } finally {
        setLoadingHistory(false)
      }
    }
    loadConversation()
  }, [])

  // Scroll within the messages container
  useEffect(() => {
    const container = messagesContainerRef.current
    if (container) {
      container.scrollTop = container.scrollHeight
    }
  }, [messages])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => revokeImagePreviewUrl(img.previewUrl))
    }
  }, [pendingImages])

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = inputRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      const maxHeight = 120
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
    }
  }, [])

  useEffect(() => {
    adjustTextareaHeight()
  }, [input, adjustTextareaHeight])

  const handleFileSelect = useCallback((files: FileList | File[]) => {
    setImageError(null)
    const fileArray = Array.from(files)

    const remainingSlots = MAX_IMAGES - pendingImages.length
    if (remainingSlots <= 0) {
      setImageError(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }

    const filesToAdd = fileArray.slice(0, remainingSlots)
    const newPendingImages: PendingImage[] = []

    for (const file of filesToAdd) {
      const typeCheck = validateImageType(file)
      if (!typeCheck.valid) {
        setImageError(typeCheck.error || 'Invalid file type')
        continue
      }

      const previewUrl = createImagePreviewUrl(file)
      newPendingImages.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        previewUrl,
      })
    }

    if (newPendingImages.length > 0) {
      setPendingImages((prev) => [...prev, ...newPendingImages])
    }

    if (fileArray.length > remainingSlots) {
      setImageError(`Only ${remainingSlots} more image${remainingSlots === 1 ? '' : 's'} can be added (max ${MAX_IMAGES})`)
    }
  }, [pendingImages.length])

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [handleFileSelect])

  const removePendingImage = useCallback((id: string) => {
    setPendingImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === id)
      if (imageToRemove) {
        revokeImagePreviewUrl(imageToRemove.previewUrl)
      }
      return prev.filter((img) => img.id !== id)
    })
    setImageError(null)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if ((!input.trim() && pendingImages.length === 0) || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)
    setImageError(null)

    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
    }

    const imagesData: ChatMessageImage[] = []
    const imagePreviewsForDisplay: string[] = []

    if (pendingImages.length > 0) {
      try {
        for (const pendingImg of pendingImages) {
          const imageData = await prepareImageForChat(pendingImg.file)
          imagesData.push(imageData)
          imagePreviewsForDisplay.push(pendingImg.previewUrl)
        }
        setPendingImages([])
      } catch (err) {
        console.error('Failed to process images:', err)
        setImageError('Failed to process images')
        setLoading(false)
        return
      }
    }

    const defaultMessage = imagesData.length > 0
      ? imagesData.length === 1
        ? 'What do you see in this image?'
        : `What do you see in these ${imagesData.length} images?`
      : ''

    const newUserMessage: DisplayMessage = {
      role: 'user',
      content: userMessage || defaultMessage,
      images: imagesData.length > 0 ? imagesData : undefined,
      imagePreviewUrls: imagePreviewsForDisplay.length > 0 ? imagePreviewsForDisplay : undefined,
    }

    const newMessages: DisplayMessage[] = [...messages, newUserMessage]
    setMessages(newMessages)

    try {
      const response = await fetch('/api/ai/garden-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            image: msg.image,
            images: msg.images,
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

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }, [])

  const canSubmit = (input.trim() || pendingImages.length > 0) && !loading

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
        maxHeight: '520px',
        minHeight: '380px',
      }}
    >
      {/* Header — distinct from plant chat with a garden-wide feel */}
      <div
        className="px-4 sm:px-6 py-3 sm:py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{
          borderColor: 'var(--stone-200)',
          background: 'linear-gradient(135deg, var(--sage-50) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--sage-200)' }}
          >
            <Plant size={16} weight="fill" color="var(--sage-700)" />
          </div>
          <div className="min-w-0">
            <h3
              className="text-base sm:text-lg font-semibold truncate"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Ask about your garden
            </h3>
            <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
              Advice across all your plants and lawn
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => {
              setMessages([])
              setSessionId(null)
            }}
            className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors flex-shrink-0 ml-2"
            style={{
              background: 'var(--stone-100)',
              color: 'var(--text-secondary)',
            }}
          >
            New
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 p-3 sm:p-4 space-y-3 sm:space-y-4 overflow-y-auto overscroll-contain"
        style={{ minHeight: '150px' }}
      >
        {loadingHistory ? (
          <div className="text-center py-6 sm:py-8">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center"
              style={{ background: 'var(--sage-100)' }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              >
                <CircleNotch size={24} className="sm:hidden" weight="light" color="var(--sage-600)" />
                <CircleNotch size={32} className="hidden sm:block" weight="light" color="var(--sage-600)" />
              </motion.div>
            </div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Loading conversation...
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center"
              style={{ background: 'var(--sage-100)' }}
            >
              <Leaf size={28} className="sm:hidden" weight="light" color="var(--sage-600)" />
              <Leaf size={40} className="hidden sm:block" weight="light" color="var(--sage-600)" />
            </div>
            <p className="text-sm px-4" style={{ color: 'var(--text-muted)' }}>
              Ask me anything about your whole garden
            </p>
            <p className="text-xs mt-2 px-4" style={{ color: 'var(--text-muted)' }}>
              I know all your plants and lawn - ask for priorities, advice, or plans
            </p>
            <div className="mt-3 sm:mt-4 flex flex-wrap justify-center gap-1.5 sm:gap-2 px-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm rounded-full transition-colors"
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
                className={`max-w-[90%] sm:max-w-[85%] rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
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
                {/* Multiple images grid */}
                {message.imagePreviewUrls && message.imagePreviewUrls.length > 0 && (
                  <div className={`mb-2 grid gap-1.5 ${
                    message.imagePreviewUrls.length === 1 ? 'grid-cols-1' :
                    message.imagePreviewUrls.length === 2 ? 'grid-cols-2' :
                    'grid-cols-3'
                  }`}>
                    {message.imagePreviewUrls.map((url, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative aspect-square rounded-lg overflow-hidden"
                        style={{ maxWidth: message.imagePreviewUrls!.length === 1 ? '160px' : '100px' }}
                      >
                        <Image
                          src={url}
                          alt={`Attached image ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {/* Image attachment indicator (for loaded history) */}
                {message.hasImage && !message.imagePreviewUrls && (
                  <div className="mb-2">
                    <div
                      className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-md"
                      style={{
                        background: message.role === 'user'
                          ? 'rgba(255,255,255,0.15)'
                          : 'var(--stone-200)',
                      }}
                    >
                      <ImageSquare size={14} weight="fill" />
                      <span>
                        {message.imageCount && message.imageCount > 1
                          ? `${message.imageCount} photos attached`
                          : 'Photo attached'}
                      </span>
                    </div>
                  </div>
                )}
                {message.role === 'user' ? (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                ) : (
                  <div className="text-sm prose-chat">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        ul: ({ children }) => <ul className="mb-3 last:mb-0 ml-4 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="mb-3 last:mb-0 ml-4 space-y-1 list-decimal">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
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
      </div>

      {/* Input Area */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 flex-shrink-0"
        style={{
          background: 'linear-gradient(to top, var(--stone-100) 0%, var(--stone-50) 100%)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="Attach images"
          multiple
        />

        <div
          className="relative w-full transition-all"
          style={{
            background: 'white',
            borderRadius: '24px',
            border: isFocused ? '1px solid var(--sage-400)' : '1px solid var(--stone-200)',
            boxShadow: isFocused
              ? '0 2px 8px rgba(0,0,0,0.04), 0 0 0 3px rgba(124, 152, 133, 0.12)'
              : '0 2px 8px rgba(0,0,0,0.04)',
          }}
        >
          {/* Image previews */}
          <AnimatePresence>
            {pendingImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="px-3 pt-3"
              >
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {pendingImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative flex-shrink-0"
                    >
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden">
                        <Image
                          src={img.previewUrl}
                          alt="Image to send"
                          fill
                          className="object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removePendingImage(img.id)}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center transition-colors"
                        style={{
                          background: 'var(--stone-700)',
                          color: 'white',
                        }}
                        aria-label="Remove image"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ))}

                  {pendingImages.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-16 h-16 rounded-xl flex-shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        background: 'var(--stone-100)',
                        border: '2px dashed var(--stone-300)',
                      }}
                      aria-label="Add more images"
                    >
                      <Plus size={20} weight="bold" color="var(--stone-400)" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          <AnimatePresence>
            {imageError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="px-4 pt-2"
              >
                <p className="text-xs" style={{ color: 'var(--error)' }}>
                  {imageError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              pendingImages.length > 0
                ? "Add a message..."
                : "Ask about your garden..."
            }
            className="w-full resize-none block focus:outline-none focus-visible:outline-none"
            style={{
              fontFamily: 'var(--font-crimson)',
              fontSize: '16px',
              lineHeight: '1.5',
              padding: '14px 16px',
              paddingTop: pendingImages.length > 0 ? '8px' : '14px',
              paddingBottom: '48px',
              color: 'var(--text-primary)',
              background: 'transparent',
              minHeight: '24px',
              maxHeight: '160px',
              outline: 'none',
            }}
            disabled={loading}
            rows={1}
          />

          {/* Action bar */}
          <div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 pb-2"
            style={{ pointerEvents: 'none' }}
          >
            <div className="flex items-center gap-1" style={{ pointerEvents: 'auto' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || pendingImages.length >= MAX_IMAGES}
                className="relative flex items-center justify-center transition-colors rounded-full"
                style={{
                  width: '36px',
                  height: '36px',
                  background: pendingImages.length > 0 ? 'var(--sage-100)' : 'transparent',
                  color: pendingImages.length > 0 ? 'var(--sage-700)' : 'var(--text-muted)',
                  opacity: loading || pendingImages.length >= MAX_IMAGES ? 0.4 : 1,
                }}
                aria-label={`Attach photo (${pendingImages.length}/${MAX_IMAGES})`}
                title={`Attach photo (${pendingImages.length}/${MAX_IMAGES})`}
              >
                <Camera size={20} weight={pendingImages.length > 0 ? 'fill' : 'regular'} />
                {pendingImages.length > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center font-semibold"
                    style={{
                      background: 'var(--sage-600)',
                      color: 'white',
                      fontSize: '10px',
                    }}
                  >
                    {pendingImages.length}
                  </span>
                )}
              </button>
            </div>

            <div style={{ pointerEvents: 'auto' }}>
              <button
                type="submit"
                disabled={!canSubmit}
                className="flex items-center justify-center transition-all rounded-full"
                style={{
                  width: '36px',
                  height: '36px',
                  background: canSubmit ? 'var(--sage-600)' : 'var(--stone-200)',
                  color: canSubmit ? 'white' : 'var(--stone-400)',
                  transform: canSubmit ? 'scale(1)' : 'scale(0.95)',
                }}
              >
                <PaperPlaneRight size={18} weight="fill" />
              </button>
            </div>
          </div>
        </div>

        <p
          className="hidden sm:block text-xs mt-2 text-center"
          style={{ color: 'var(--text-muted)' }}
        >
          Press Enter to send · Shift+Enter for new line
        </p>
      </form>
    </div>
  )
}
