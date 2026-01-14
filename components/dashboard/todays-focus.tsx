'use client'

import { motion } from 'framer-motion'
import type { TaskSuggestion } from '@/types/database'
import FeaturedTaskCard from './featured-task-card'
import { NoTasksIllustration } from '@/components/ui/empty-states'

interface TodaysFocusProps {
  featuredTask: TaskSuggestion | null
}

export default function TodaysFocus({ featuredTask }: TodaysFocusProps) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.1 }}
      className="mb-8"
    >
      <h2
        className="text-lg font-semibold mb-4"
        style={{
          fontFamily: 'var(--font-cormorant)',
          color: 'var(--text-primary)',
        }}
      >
        Today&apos;s Focus
      </h2>

      {featuredTask ? (
        <FeaturedTaskCard suggestion={featuredTask} />
      ) : (
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'white',
            border: '1px solid var(--stone-200)',
          }}
        >
          <NoTasksIllustration className="w-24 h-24 mx-auto mb-4" />
          <p
            className="text-lg font-medium mb-1"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            All caught up!
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            No tasks need your attention right now. Enjoy your garden!
          </p>
        </div>
      )}
    </motion.section>
  )
}
