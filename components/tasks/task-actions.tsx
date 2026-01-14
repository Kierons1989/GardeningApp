'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from '@/components/ui/toast'
import { useTaskMutation } from '@/lib/queries/use-task-mutation'
import Icon from '@/components/ui/icon'

interface TaskActionsProps {
  plantId: string
  taskKey: string
  onActionComplete?: () => void
}

export default function TaskActions({ plantId, taskKey, onActionComplete }: TaskActionsProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)
  const [showSnoozeOptions, setShowSnoozeOptions] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  const snoozeButtonRef = useRef<HTMLButtonElement>(null)

  const taskMutation = useTaskMutation()

  // Update dropdown position when opened
  useEffect(() => {
    if (showSnoozeOptions && snoozeButtonRef.current) {
      const rect = snoozeButtonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.top - 8, // Position above button with small gap
        left: rect.right - 140, // Align right edge with button
      })
    }
  }, [showSnoozeOptions])

  async function handleAction(action: 'done' | 'skipped' | 'snoozed', snoozeUntil?: string) {
    setLoading(action)
    setShowSnoozeOptions(false)

    try {
      await taskMutation.mutateAsync({
        plantId,
        taskKey,
        action,
        snoozeUntil,
      })

      // Show success animation for done action
      if (action === 'done') {
        setCompleting(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        showToast('Task completed! Great work!', 'success')
      } else if (action === 'skipped') {
        showToast('Task skipped', 'info')
      } else if (action === 'snoozed') {
        showToast('Task snoozed for later', 'info')
      }

      onActionComplete?.()
    } catch (error) {
      console.error('Error saving task action:', error)
      showToast('Failed to save task action', 'error')
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
      {/* Success Checkmark Overlay with Celebration */}
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 -top-4 -left-4 -right-4 -bottom-4 flex items-center justify-center z-30 rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(93, 125, 102, 0.95)',
            }}
          >
            {/* Floating botanical particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: 0,
                  y: 0,
                }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                  x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 15)],
                  y: [0, -40 - i * 10],
                }}
                transition={{
                  delay: 0.3 + i * 0.08,
                  duration: 0.6,
                  ease: 'easeOut',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="1.5"
                >
                  <path d="M12 20V12M12 12C12 12 9 10 7 7C10 7 12 9 12 12Z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Done Button */}
      <button
        onClick={() => handleAction('done')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-sage-200 active:scale-95"
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
          <Icon name="Check" size={16} weight="light" ariaLabel="done" />
        )}
        Done
      </button>

      {/* Skip Button */}
      <button
        onClick={() => handleAction('skipped')}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-stone-200 active:scale-95"
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
          <Icon name="X" size={16} weight="light" ariaLabel="skip" />
        )}
        Skip
      </button>

      {/* Snooze Button with Dropdown */}
      <button
        ref={snoozeButtonRef}
        onClick={() => setShowSnoozeOptions(!showSnoozeOptions)}
        disabled={loading !== null}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:bg-earth-200 active:scale-95"
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
          <Icon name="Clock" size={16} weight="light" ariaLabel="snooze" />
        )}
        Snooze
        <Icon name="CaretDown" size={12} weight="light" ariaLabel="expand" />
      </button>

      {/* Snooze Options Dropdown - rendered via portal to avoid clipping */}
      {typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          {showSnoozeOptions && (
            <>
              {/* Backdrop to close on click outside */}
              <div
                className="fixed inset-0 z-[999]"
                onClick={() => setShowSnoozeOptions(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="fixed z-[1000] rounded-xl overflow-hidden"
                style={{
                  top: dropdownPosition.top,
                  left: dropdownPosition.left,
                  transform: 'translateY(-100%)',
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
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  )
}
