'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import type { TaskSuggestion } from '@/types/database'
import CompactTaskCard from './compact-task-card'
import Icon from '@/components/ui/icon'

interface ThisWeekTasksProps {
  tasks: TaskSuggestion[]
}

export default function ThisWeekTasks({ tasks }: ThisWeekTasksProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (tasks.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            This Week
          </h2>
          <span
            className="text-xs px-2.5 py-1 rounded-full"
            style={{
              background: 'var(--sage-100)',
              color: 'var(--sage-700)',
            }}
          >
            {tasks.length} more
          </span>
        </div>

        {/* Scroll buttons - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
            style={{ background: 'white', border: '1px solid var(--stone-200)' }}
            aria-label="Scroll left"
          >
            <Icon name="CaretLeft" size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-stone-100"
            style={{ background: 'white', border: '1px solid var(--stone-200)' }}
            aria-label="Scroll right"
          >
            <Icon name="CaretRight" size={16} style={{ color: 'var(--text-secondary)' }} />
          </button>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{
          scrollPaddingLeft: '1rem',
          scrollPaddingRight: '1rem',
        }}
      >
        {tasks.map((task, index) => (
          <CompactTaskCard
            key={`${task.plant.id}-${task.task.key}`}
            suggestion={task}
            index={index}
          />
        ))}
      </div>
    </motion.section>
  )
}
