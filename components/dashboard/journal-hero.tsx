'use client'

import { motion } from 'framer-motion'
import { useProfile } from '@/lib/queries/use-profile'
import { getTimeOfDayGreeting } from '@/lib/utils/time-greetings'

interface JournalHeroProps {
  taskCount?: number
  allCaughtUp?: boolean
}

export default function JournalHero({ taskCount = 0, allCaughtUp = false }: JournalHeroProps) {
  const { data: profile } = useProfile()

  const greeting = getTimeOfDayGreeting()
  const displayName = profile?.display_name || 'Gardener'

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div>
        <h1
          className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 tracking-tight"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          {greeting}, {displayName}
        </h1>

        {allCaughtUp ? (
          <p
            className="text-lg"
            style={{ color: 'var(--sage-600)' }}
          >
            All caught up! Your garden is in great shape.
          </p>
        ) : taskCount > 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>
            You have {taskCount} task{taskCount !== 1 ? 's' : ''} to tend to
          </p>
        ) : null}
      </div>
    </motion.section>
  )
}
