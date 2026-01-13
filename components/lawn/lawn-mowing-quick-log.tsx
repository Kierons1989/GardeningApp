'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLogMowing } from '@/lib/queries/use-lawn'
import { useToast } from '@/components/ui/toast'
import Icon from '@/components/ui/icon'

interface LawnMowingQuickLogProps {
  lawnId: string
  daysSinceLastMow: number | null
}

export default function LawnMowingQuickLog({ lawnId, daysSinceLastMow }: LawnMowingQuickLogProps) {
  const [completing, setCompleting] = useState(false)
  const { showToast } = useToast()
  const logMowing = useLogMowing()

  async function handleMowedToday() {
    setCompleting(true)

    try {
      await logMowing.mutateAsync({
        lawn_id: lawnId,
        mowed_at: new Date().toISOString(),
      })

      // Show success animation
      await new Promise(resolve => setTimeout(resolve, 800))
      showToast('Mowing logged! Great work!', 'success')
    } catch {
      showToast('Failed to log mowing', 'error')
    } finally {
      setCompleting(false)
    }
  }

  return (
    <div className="relative">
      {/* Success Animation Overlay */}
      <AnimatePresence>
        {completing && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-10 rounded-xl overflow-hidden"
            style={{
              background: 'rgba(74, 145, 73, 0.95)',
            }}
          >
            {/* Floating grass particles */}
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
                  x: [0, (i % 2 === 0 ? 1 : -1) * (20 + i * 10)],
                  y: [0, -30 - i * 8],
                }}
                transition={{
                  delay: 0.2 + i * 0.06,
                  duration: 0.5,
                  ease: 'easeOut',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="rgba(255,255,255,0.7)"
                  strokeWidth="2"
                >
                  <path d="M12 20V14M12 14C12 14 10 12 8 10M12 14C12 14 14 12 16 10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </motion.div>
            ))}

            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-12 h-12"
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
                  transition={{ delay: 0.25, duration: 0.35 }}
                />
              </svg>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Button */}
      <button
        onClick={handleMowedToday}
        disabled={logMowing.isPending}
        className="w-full flex items-center justify-center gap-3 p-4 rounded-xl transition-all active:scale-98"
        style={{
          background: 'var(--lawn-100)',
          color: 'var(--lawn-700)',
          border: '1px solid var(--lawn-200)',
        }}
      >
        {logMowing.isPending && !completing ? (
          <motion.div
            className="w-5 h-5 border-2 border-lawn-300 border-t-lawn-700 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <Icon name="Scissors" size={20} weight="light" className="w-5 h-5" />
        )}
        <span className="font-medium">Mowed Today</span>
      </button>

      {/* Last mowed info */}
      {daysSinceLastMow !== null && (
        <p
          className="text-center text-sm mt-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Last mowed: {daysSinceLastMow === 0
            ? 'Today'
            : daysSinceLastMow === 1
              ? 'Yesterday'
              : `${daysSinceLastMow} days ago`}
        </p>
      )}
    </div>
  )
}
