'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface TaskActionsProps {
  plantId: string
  taskKey: string
  onActionComplete?: () => void
}

export default function TaskActions({ plantId, taskKey, onActionComplete }: TaskActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)

  async function handleAction(action: 'done' | 'skipped' | 'snoozed', snoozeUntil?: string) {
    setLoading(action)
    setShowSnoozeOptions(false)

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId,
          taskKey,
          action,
          snoozeUntil,
        }),
      })

      if (response.ok) {
        onActionComplete?.()
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving task action:', error)
    } finally {
      setLoading(null)
    }
  }

  function getSnoozeDate(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() + days)
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="flex items-center gap-2 relative">
      {/* Done Button */}
      <button
        onClick={() => handleAction('done')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: loading === 'done' ? 'var(--sage-600)' : 'var(--sage-100)',
          color: loading === 'done' ? 'white' : 'var(--sage-700)',
        }}
      >
        {loading === 'done' ? (
          <motion.div
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        Done
      </button>

      {/* Skip Button */}
      <button
        onClick={() => handleAction('skipped')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
        style={{
          background: 'var(--stone-100)',
          color: 'var(--text-secondary)',
        }}
      >
        {loading === 'skipped' ? (
          <motion.div
            className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 5l14 14M5 19L19 5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
        Skip
      </button>

      {/* Snooze Button with Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
          disabled={loading !== null}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: showSnoozeOptions ? 'var(--earth-200)' : 'var(--earth-100)',
            color: 'var(--earth-700)',
          }}
        >
          {loading === 'snoozed' ? (
            <motion.div
              className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          Snooze
          <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Snooze Options Dropdown */}
        <AnimatePresence>
          {showSnoozeOptions && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 z-20 rounded-xl overflow-hidden"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-lg)',
                minWidth: '140px',
              }}
            >
              {[
                { days: 7, label: '1 week' },
                { days: 14, label: '2 weeks' },
                { days: 30, label: '1 month' },
              ].map((option) => (
                <button
                  key={option.days}
                  onClick={() => handleAction('snoozed', getSnoozeDate(option.days))}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-stone-50 transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Click outside to close snooze dropdown */}
      {showSnoozeOptions && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowSnoozeOptions(false)}
        />
      )}
    </div>
  )
}
