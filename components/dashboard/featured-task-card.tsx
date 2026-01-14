'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { TaskSuggestion } from '@/types/database'
import TaskActions from '@/components/tasks/task-actions'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getCategoryIcon, getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'

interface FeaturedTaskCardProps {
  suggestion: TaskSuggestion
}

export default function FeaturedTaskCard({ suggestion }: FeaturedTaskCardProps) {
  const [showInstructions, setShowInstructions] = useState(false)
  const colors = getCategoryColor(suggestion.task.category)

  const effortColors = {
    high: { border: 'var(--coral)', bg: 'rgba(224, 122, 95, 0.08)', accent: 'var(--coral)' },
    medium: { border: 'var(--earth-400)', bg: 'rgba(212, 164, 122, 0.08)', accent: 'var(--earth-500)' },
    low: { border: 'var(--sage-400)', bg: 'rgba(163, 189, 169, 0.08)', accent: 'var(--sage-500)' },
  }
  const effortColor = effortColors[suggestion.task.effort_level] || effortColors.medium

  const hasPhoto = !!suggestion.plant.photo_url

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      className="rounded-2xl p-6 md:p-8 relative"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
        border: '1px solid var(--stone-200)',
        borderLeft: `5px solid ${effortColor.border}`,
      }}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Plant Image or Icon */}
        <div className="flex-shrink-0">
          {hasPhoto ? (
            <div
              className="w-full md:w-40 h-32 md:h-40 rounded-xl overflow-hidden relative"
              style={{ background: 'var(--stone-100)' }}
            >
              <Image
                src={suggestion.plant.photo_url!}
                alt={suggestion.plant.name}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className="w-full md:w-40 h-32 md:h-40 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--sage-50)' }}
            >
              {getPlantTypeIcon(
                suggestion.plant.plant_types?.top_level || '',
                'w-16 h-16',
                { color: 'var(--sage-400)' }
              )}
            </div>
          )}
        </div>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Header with badges */}
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: colors.bg }}
              >
                {getCategoryIcon(suggestion.task.category, 'w-5 h-5', { color: colors.text })}
              </div>
              <div>
                <h3
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {suggestion.task.title}
                </h3>
                <Link
                  href={`/plants/${suggestion.plant.id}`}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--sage-600)' }}
                >
                  {suggestion.plant.name}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: colors.bg, color: colors.text }}
              >
                {formatCategory(suggestion.task.category)}
              </span>
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full"
                style={{
                  background: effortColor.accent,
                  color: 'white',
                }}
              >
                {suggestion.task.effort_level}
              </span>
            </div>
          </div>

          {/* Why this matters */}
          <p
            className="text-base mb-4 leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {suggestion.task.why_this_matters}
          </p>

          {/* Expandable instructions */}
          {suggestion.task.how_to && (
            <div className="mb-5">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--sage-600)' }}
              >
                <Icon
                  name="CaretRight"
                  size={14}
                  weight="bold"
                  className="transition-transform"
                  style={{ transform: showInstructions ? 'rotate(90deg)' : 'rotate(0deg)' }}
                />
                {showInstructions ? 'Hide' : 'Show'} detailed instructions
              </button>

              <AnimatePresence>
                {showInstructions && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="mt-3 p-4 rounded-lg text-sm whitespace-pre-line"
                      style={{
                        background: 'var(--stone-50)',
                        border: '1px solid var(--stone-200)',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      {suggestion.task.how_to}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Task Actions */}
          <TaskActions
            plantId={suggestion.plant.id}
            taskKey={suggestion.task.key}
          />
        </div>
      </div>
    </motion.div>
  )
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
