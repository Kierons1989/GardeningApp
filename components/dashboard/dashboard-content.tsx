'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant, TaskHistory, TaskSuggestion, AITask } from '@/types/database'
import TaskActions from '@/components/tasks/task-actions'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getCategoryIcon, getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'
import { EmptyGardenIllustration, NoTasksIllustration } from '@/components/ui/empty-states'
import { LawnDashboardWidget } from '@/components/lawn'

interface DashboardContentProps {
  plants: Plant[]
  taskHistory: TaskHistory[]
}

export default function DashboardContent({ plants, taskHistory }: DashboardContentProps) {
  // Generate task suggestions from plants' care profiles
  const taskSuggestions = useMemo(() => {
    const currentMonth = new Date().getMonth() + 1 // 1-12
    const suggestions: TaskSuggestion[] = []

    plants.forEach((plant) => {
      const careProfile = plant.plant_types?.ai_care_profile
      if (!careProfile?.tasks) return

      careProfile.tasks.forEach((task: AITask) => {
        // Check if task is in current window
        const inWindow = isTaskInWindow(task.month_start, task.month_end, currentMonth)
        if (!inWindow) return

        // Check recent history for this task
        const recentAction = taskHistory.find(
          (h) => h.plant_id === plant.id && h.task_key === task.key
        )

        // Skip if recently done/skipped (within appropriate window)
        if (recentAction && shouldSkipTask(recentAction, task.recurrence_type)) {
          return
        }

        suggestions.push({
          task,
          plant,
          source: 'ai_profile',
          due_bucket: getDueBucket(task, currentMonth),
          last_action: recentAction || null,
        })
      })
    })

    // Sort by due bucket, then by effort level
    return suggestions.sort((a, b) => {
      const bucketOrder = { this_week: 0, next_two_weeks: 1, later: 2 }
      const bucketDiff = bucketOrder[a.due_bucket] - bucketOrder[b.due_bucket]
      if (bucketDiff !== 0) return bucketDiff

      const effortOrder = { high: 0, medium: 1, low: 2 }
      return effortOrder[a.task.effort_level] - effortOrder[b.task.effort_level]
    })
  }, [plants, taskHistory])

  const thisWeekTasks = taskSuggestions.filter((t) => t.due_bucket === 'this_week')
  const upcomingTasks = taskSuggestions.filter((t) => t.due_bucket === 'next_two_weeks')

  // Container animation variants - fast for snappy feel
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <h1
          className="text-4xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Your Garden
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {plants.length === 0
            ? 'Add your first plant to get started'
            : `${plants.length} plant${plants.length === 1 ? '' : 's'} in your garden`}
        </p>
      </motion.div>

      {/* Empty State */}
      {plants.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <EmptyGardenIllustration className="w-48 h-48 mx-auto mb-2" />
          <h2
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Your garden awaits
          </h2>
          <p
            className="mb-8 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Add your first plant and we&apos;ll create a personalised care schedule
            with UK-specific seasonal guidance.
          </p>
          <Link href="/plants/new" className="btn btn-primary">
            <Icon name="Plus" size={18} weight="light" className="w-5 h-5" />
            Add your first plant
          </Link>
        </motion.div>
      )}

      {/* Dashboard with tasks */}
      {plants.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tasks Column */}
          <div className="md:col-span-1 lg:col-span-2 space-y-6">
            {/* This Week */}
            <motion.section variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  This Week
                </h2>
                <span
                  className="text-sm px-3 py-1 rounded-full"
                  style={{
                    background: thisWeekTasks.length > 0 ? 'var(--sage-100)' : 'var(--stone-100)',
                    color: thisWeekTasks.length > 0 ? 'var(--sage-700)' : 'var(--text-muted)',
                  }}
                >
                  {thisWeekTasks.length} task{thisWeekTasks.length !== 1 ? 's' : ''}
                </span>
              </div>

              {thisWeekTasks.length === 0 ? (
                <div
                  className="rounded-xl p-8 text-center"
                  style={{
                    background: 'white',
                    border: '1px solid var(--stone-200)',
                  }}
                >
                  <NoTasksIllustration className="w-32 h-32 mx-auto mb-4" />
                  <p style={{ color: 'var(--text-muted)' }}>
                    No tasks for this week. Enjoy your garden!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {thisWeekTasks.map((suggestion, index) => (
                    <TaskCard key={`${suggestion.plant.id}-${suggestion.task.key}`} suggestion={suggestion} index={index} />
                  ))}
                </div>
              )}
            </motion.section>

            {/* Coming Up */}
            {upcomingTasks.length > 0 && (
              <motion.section variants={itemVariants}>
                <div className="flex items-center justify-between mb-4">
                  <h2
                    className="text-xl font-semibold"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    Coming Up
                  </h2>
                  <span
                    className="text-sm px-3 py-1 rounded-full"
                    style={{
                      background: 'var(--stone-100)',
                      color: 'var(--text-muted)',
                    }}
                  >
                    {upcomingTasks.length} task{upcomingTasks.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-3 opacity-80">
                  {upcomingTasks.slice(0, 5).map((suggestion, index) => (
                    <TaskCard key={`${suggestion.plant.id}-${suggestion.task.key}`} suggestion={suggestion} index={index} minimal />
                  ))}
                </div>
              </motion.section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.section variants={itemVariants}>
              <Link
                href="/plants/new"
                className="flex items-center gap-4 p-4 rounded-xl card-hover"
                style={{
                  background: 'white',
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--stone-100)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--sage-100)' }}
                >
                  <Icon name="Plus" size={20} weight="light" className="w-6 h-6" style={{ color: 'var(--sage-600)' }} />
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    Add a plant
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Grow your garden
                  </p>
                </div>
              </Link>
            </motion.section>

            {/* Lawn Care Widget */}
            <motion.section variants={itemVariants}>
              <LawnDashboardWidget />
            </motion.section>

            {/* Recent Plants */}
            <motion.section variants={itemVariants}>
              <h3
                className="text-lg font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                Your Plants
              </h3>
              <div className="space-y-2">
                {plants.slice(0, 5).map((plant) => (
                  <Link
                    key={plant.id}
                    href={`/plants/${plant.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-stone-50"
                    style={{ background: 'white' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--earth-100)' }}
                    >
                      {getPlantTypeIcon(plant.plant_types?.top_level || '', 'w-5 h-5', { color: 'var(--earth-700)' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-medium truncate"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {plant.name}
                      </p>
                      {plant.area && (
                        <p
                          className="text-sm truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {plant.area}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}

                {plants.length > 5 && (
                  <Link
                    href="/plants"
                    className="block text-center py-3 text-sm font-medium rounded-lg"
                    style={{ color: 'var(--sage-600)' }}
                  >
                    View all {plants.length} plants
                  </Link>
                )}
              </div>
            </motion.section>
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Task Card Component
function TaskCard({
  suggestion,
  index,
  minimal = false,
}: {
  suggestion: TaskSuggestion
  index: number
  minimal?: boolean
}) {
  const [showInstructions, setShowInstructions] = useState(false)
  const colors = getCategoryColor(suggestion.task.category)

  const effortColors = {
    high: { border: 'var(--coral)', bg: 'rgba(224, 122, 95, 0.05)' },
    medium: { border: 'var(--earth-400)', bg: 'rgba(212, 164, 122, 0.05)' },
    low: { border: 'var(--sage-300)', bg: 'rgba(163, 189, 169, 0.05)' },
  }
  const effortColor = effortColors[suggestion.task.effort_level] || effortColors.medium

  if (minimal) {
    return (
      <div
        className="flex items-center gap-4 p-4 rounded-xl"
        style={{
          background: 'white',
          border: '1px solid var(--stone-200)',
        }}
      >
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          {getCategoryIcon(suggestion.task.category, 'w-5 h-5', { color: colors.text })}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
            {suggestion.task.title}
          </p>
          <p className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>
            {suggestion.plant.name}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl p-6 card-hover relative overflow-hidden"
      style={{
        background: effortColor.bg,
        boxShadow: 'var(--shadow-sm)',
        borderLeft: `4px solid ${effortColor.border}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          {getCategoryIcon(suggestion.task.category, 'w-6 h-6', { color: colors.text })}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div>
              <h3
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
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
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className="text-xs px-2 py-1 rounded-full"
                style={{ background: colors.bg, color: colors.text }}
              >
                {formatCategory(suggestion.task.category)}
              </span>
              <span
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  background: effortColor.border,
                  color: 'white',
                }}
              >
                {suggestion.task.effort_level}
              </span>
            </div>
          </div>

          <p
            className="text-sm mb-4"
            style={{ color: 'var(--text-secondary)' }}
          >
            {suggestion.task.why_this_matters}
          </p>

          {suggestion.task.how_to && (
            <div className="mb-4">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--sage-600)' }}
              >
                <Icon
                  name="CaretRight"
                  size={16}
                  weight="light"
                  className="w-4 h-4 transition-transform"
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

          <TaskActions
            plantId={suggestion.plant.id}
            taskKey={suggestion.task.key}
          />
        </div>
      </div>
    </motion.div>
  )
}

// Helper functions
function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  // Handles wrapping (e.g., Nov-Feb)
  return currentMonth >= monthStart || currentMonth <= monthEnd
}

function shouldSkipTask(action: TaskHistory, recurrenceType: string): boolean {
  const actionDate = new Date(action.created_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24))

  // If snoozed, check if snooze period has passed
  if (action.action === 'snoozed' && action.snooze_until) {
    return new Date(action.snooze_until) > now
  }

  // For different recurrence types
  switch (recurrenceType) {
    case 'once_per_window':
      return daysSince < 30
    case 'weekly_in_window':
      return daysSince < 7
    case 'monthly_in_window':
      return daysSince < 28
    default:
      return daysSince < 14
  }
}

function getDueBucket(task: AITask, currentMonth: number): 'this_week' | 'next_two_weeks' | 'later' {
  // Simple heuristic: if we're at the start of the window, it's this week
  // Otherwise, it's coming up
  if (task.month_start === currentMonth) {
    return 'this_week'
  }
  return 'next_two_weeks'
}

function formatCategory(category: string): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
