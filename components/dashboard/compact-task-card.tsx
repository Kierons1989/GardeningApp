'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { TaskSuggestion } from '@/types/database'
import TaskActions from '@/components/tasks/task-actions'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getCategoryIcon } from '@/components/ui/botanical-icons'

interface CompactTaskCardProps {
  suggestion: TaskSuggestion
  index: number
}

export default function CompactTaskCard({ suggestion, index }: CompactTaskCardProps) {
  const colors = getCategoryColor(suggestion.task.category)

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.03, duration: 0.25 }}
      className="flex-shrink-0 w-[320px] rounded-xl p-5 snap-start overflow-visible"
      style={{
        background: 'white',
        border: '1px solid var(--stone-200)',
        borderLeft: `4px solid ${colors.border}`,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--stone-100)' }}
        >
          {getCategoryIcon(suggestion.task.category, 'w-4 h-4', { color: 'var(--stone-600)' })}
        </div>
        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm leading-tight line-clamp-2"
            style={{ color: 'var(--text-primary)' }}
          >
            {suggestion.task.title}
          </h4>
          <Link
            href={`/plants/${suggestion.plant.id}`}
            className="text-xs hover:underline truncate block mt-0.5"
            style={{ color: 'var(--sage-600)' }}
          >
            {suggestion.plant.name}
          </Link>
        </div>
      </div>

      {/* Brief description */}
      <p
        className="text-xs mb-4 line-clamp-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {suggestion.task.why_this_matters}
      </p>

      {/* Compact Actions */}
      <div className="flex items-center gap-1.5">
        <TaskActions
          plantId={suggestion.plant.id}
          taskKey={suggestion.task.key}
        />
      </div>
    </motion.div>
  )
}
