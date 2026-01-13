'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import type { Lawn, LawnTask } from '@/types/lawn'
import { useLawnTaskHistory, useLawnMowingLog, useDeleteLawn } from '@/lib/queries/use-lawn'
import LawnHealthIndicator from './lawn-health-indicator'
import LawnMowingQuickLog from './lawn-mowing-quick-log'
import LawnTaskActions from './lawn-task-actions'
import { getLawnCategoryColor, formatLawnCategory } from '@/lib/utils/lawn-category-colors'
import Icon from '@/components/ui/icon'
import {
  LAWN_SIZES,
  LAWN_PRIMARY_USES,
  LAWN_GRASS_TYPES,
  LAWN_SOIL_TYPES,
} from '@/types/lawn'

interface LawnDetailProps {
  lawn: Lawn
}

export default function LawnDetail({ lawn }: LawnDetailProps) {
  const router = useRouter()
  useQueryClient() // Keep for potential future cache invalidation
  const { data: taskHistory = [] } = useLawnTaskHistory()
  const { data: mowingLog = [] } = useLawnMowingLog()
  const deleteLawn = useDeleteLawn()
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())
  const [currentTime] = useState(() => new Date())

  const careProfile = lawn.ai_care_profile

  // Calculate days since last mow
  const daysSinceLastMow = useMemo(() => {
    if (!mowingLog.length) return null
    const lastMow = mowingLog[0]
    const lastMowDate = new Date(lastMow.mowed_at)
    const today = new Date(currentTime)
    today.setHours(0, 0, 0, 0)
    lastMowDate.setHours(0, 0, 0, 0)
    return Math.floor(
      (today.getTime() - lastMowDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  }, [mowingLog, currentTime])

  // Get active tasks for current month
  const activeTasks = useMemo(() => {
    const currentMonth = currentTime.getMonth() + 1

    return careProfile?.tasks.filter((task) => {
      const inWindow = isTaskInWindow(task.month_start, task.month_end, currentMonth)
      if (!inWindow) return false

      // Check if already done recently
      const recentAction = taskHistory.find((h) => h.task_key === task.key)
      if (recentAction) {
        const actionDate = new Date(recentAction.created_at)
        const daysSince = Math.floor(
          (currentTime.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24)
        )
        if (task.recurrence_type === 'weekly_in_window' && daysSince < 7) return false
        if (task.recurrence_type === 'once_per_window' && daysSince < 30) return false
        if (task.recurrence_type === 'fortnightly_in_window' && daysSince < 14) return false
        if (task.recurrence_type === 'monthly_in_window' && daysSince < 28) return false
      }
      return true
    }) || []
  }, [careProfile?.tasks, taskHistory, currentTime])

  const toggleTask = (taskKey: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev)
      if (next.has(taskKey)) {
        next.delete(taskKey)
      } else {
        next.add(taskKey)
      }
      return next
    })
  }

  function handleDelete() {
    if (!confirm('Are you sure you want to delete your lawn? This cannot be undone.')) {
      return
    }
    deleteLawn.mutate(undefined, {
      onSuccess: () => router.push('/lawn'),
    })
  }

  // Get display labels
  const sizeLabel = LAWN_SIZES.find(s => s.value === lawn.size)?.label || lawn.size
  const useLabel = LAWN_PRIMARY_USES.find(u => u.value === lawn.primary_use)?.label || lawn.primary_use
  const grassLabel = LAWN_GRASS_TYPES.find(g => g.value === lawn.grass_type)?.label || lawn.grass_type
  const soilLabel = LAWN_SOIL_TYPES.find(s => s.value === lawn.soil_type)?.label || lawn.soil_type

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/lawn"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="CaretLeft" size={16} weight="light" className="w-4 h-4" />
        Back to lawn care
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 sm:p-8 mb-6"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Lawn Icon */}
          <div
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--lawn-100)' }}
          >
            <Icon name="Leaf" size={40} weight="light" style={{ color: 'var(--lawn-600)' }} />
          </div>

          {/* Lawn Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-semibold mb-1"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {lawn.name}
                </h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {grassLabel} • {sizeLabel} • {useLabel}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {soilLabel} soil
                </p>
              </div>

              {/* Actions */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleteLawn.isPending}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--error)',
                    background: 'rgba(199, 81, 70, 0.1)',
                  }}
                >
                  <Icon name="Trash" size={20} weight="light" className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-4">
              <LawnHealthIndicator status={lawn.health_status} size="md" />
            </div>

            {/* Mobile Actions */}
            <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
              <button
                onClick={handleDelete}
                disabled={deleteLawn.isPending}
                className="p-2.5 rounded-lg transition-colors"
                style={{
                  color: 'var(--error)',
                  background: 'rgba(199, 81, 70, 0.1)',
                }}
              >
                <Icon name="Trash" size={20} weight="light" className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {careProfile?.summary && (
          <p
            className="mt-6 pt-6 border-t"
            style={{
              borderColor: 'var(--stone-200)',
              color: 'var(--text-secondary)',
            }}
          >
            {careProfile.summary}
          </p>
        )}

        {/* Notes */}
        {lawn.notes && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'var(--stone-50)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Your notes
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>{lawn.notes}</p>
          </div>
        )}
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Current Tasks
          </h2>

          {activeTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No tasks due right now. Check back later!
            </p>
          ) : (
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.key}
                  className="p-3 sm:p-4 rounded-xl"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div className="order-2 sm:order-1">
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatMonthRange(task.month_start, task.month_end)}
                      </p>
                    </div>
                    <span
                      className="order-1 sm:order-2 text-xs px-2 py-1 rounded-full self-start flex-shrink-0"
                      style={{
                        background: getLawnCategoryColor(task.category).bg,
                        color: getLawnCategoryColor(task.category).text,
                      }}
                    >
                      {formatLawnCategory(task.category)}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {task.why_this_matters}
                  </p>
                  <LawnTaskActions lawnId={lawn.id} taskKey={task.key} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Mowing Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Mowing Schedule
          </h2>

          {careProfile?.mowing_schedule && (
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-lg" style={{ background: 'var(--lawn-50)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Spring</p>
                  <p className="font-semibold" style={{ color: 'var(--lawn-700)' }}>
                    {careProfile.mowing_schedule.spring_height_mm}mm
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {careProfile.mowing_schedule.spring_frequency}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--lawn-50)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Summer</p>
                  <p className="font-semibold" style={{ color: 'var(--lawn-700)' }}>
                    {careProfile.mowing_schedule.summer_height_mm}mm
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {careProfile.mowing_schedule.summer_frequency}
                  </p>
                </div>
                <div className="p-3 rounded-lg" style={{ background: 'var(--lawn-50)' }}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Autumn</p>
                  <p className="font-semibold" style={{ color: 'var(--lawn-700)' }}>
                    {careProfile.mowing_schedule.autumn_height_mm}mm
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {careProfile.mowing_schedule.autumn_frequency}
                  </p>
                </div>
              </div>
            </div>
          )}

          <LawnMowingQuickLog lawnId={lawn.id} daysSinceLastMow={daysSinceLastMow} />
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Recent Activity
          </h2>

          {taskHistory.length === 0 && mowingLog.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {/* Show recent mowing */}
              {mowingLog.slice(0, 3).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: 'var(--lawn-100)',
                      color: 'var(--lawn-700)',
                    }}
                  >
                    <Icon name="Scissors" size={16} weight="light" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      Mowed
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(log.mowed_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {/* Show recent task actions */}
              {taskHistory.slice(0, 5).map((history) => (
                <div
                  key={history.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: getActionColor(history.action).bg,
                      color: getActionColor(history.action).text,
                    }}
                  >
                    {history.action === 'done' && <Icon name="Check" size={16} weight="light" />}
                    {history.action === 'skipped' && <Icon name="ArrowRight" size={16} weight="light" />}
                    {history.action === 'snoozed' && <Icon name="Clock" size={16} weight="light" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {formatTaskKey(history.task_key)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(history.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Health Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Health Status
          </h2>

          <div className="flex items-center justify-between mb-4">
            <LawnHealthIndicator status={lawn.health_status} size="lg" />
          </div>

          {lawn.known_issues && lawn.known_issues.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Known issues:
              </p>
              <div className="flex flex-wrap gap-2">
                {lawn.known_issues.map((issue) => (
                  <span
                    key={issue}
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: 'var(--earth-100)',
                      color: 'var(--earth-700)',
                    }}
                  >
                    {issue.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Full Care Calendar */}
      {careProfile?.tasks && careProfile.tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-4 sm:mt-6 rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Icon name="Calendar" size={20} weight="light" className="w-5 h-5" style={{ color: 'var(--lawn-600)' }} />
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Full Care Calendar
            </h2>
          </div>

          <div className="grid gap-3 sm:gap-4">
            {getTasksByMonth(careProfile.tasks).map(({ month, tasks }) => (
              <div
                key={month}
                className="p-4 sm:p-6 rounded-xl"
                style={{ background: 'var(--stone-50)' }}
              >
                <h3
                  className="font-semibold mb-3 sm:mb-4 text-lg"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {month}
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {tasks.map((task) => {
                    const taskMonthKey = `${month}-${task.key}`
                    const isExpanded = expandedTasks.has(taskMonthKey)
                    return (
                      <div
                        key={task.key}
                        className="rounded-lg overflow-hidden"
                        style={{
                          background: 'white',
                          border: '1px solid var(--stone-200)'
                        }}
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
                            <span
                              className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 self-start"
                              style={{
                                background: getLawnCategoryColor(task.category).bg,
                                color: getLawnCategoryColor(task.category).text,
                              }}
                            >
                              {formatLawnCategory(task.category)}
                            </span>
                            <div className="flex-1">
                              <h4
                                className="font-semibold mb-1"
                                style={{ color: 'var(--text-primary)' }}
                              >
                                {task.title}
                              </h4>
                              {task.why_this_matters && (
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {task.why_this_matters}
                                </p>
                              )}
                            </div>
                          </div>

                          {task.how_to && (
                            <button
                              onClick={() => toggleTask(taskMonthKey)}
                              className="mt-3 flex items-center gap-2 text-sm font-medium transition-colors"
                              style={{
                                color: 'var(--lawn-600)',
                              }}
                            >
                              <Icon
                                name="CaretRight"
                                size={16}
                                weight="light"
                                className="w-4 h-4 transition-transform"
                                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                              />
                              <span className="hidden sm:inline">{isExpanded ? 'Hide detailed instructions' : 'Show detailed instructions'}</span>
                              <span className="sm:hidden">{isExpanded ? 'Hide instructions' : 'Show instructions'}</span>
                            </button>
                          )}
                        </div>

                        <AnimatePresence>
                          {isExpanded && task.how_to && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                borderTop: '1px solid var(--stone-200)',
                                background: 'var(--stone-50)'
                              }}
                            >
                              <div className="p-3 sm:p-4">
                                <h5
                                  className="font-semibold mb-3 flex items-center gap-2"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  <Icon name="BookOpen" size={16} weight="light" className="w-4 h-4" />
                                  How to do this
                                </h5>
                                <div
                                  className="text-sm leading-relaxed space-y-3"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {task.how_to.split('\n\n').map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Care Tips */}
      {careProfile?.tips && careProfile.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-4 sm:mt-6 rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Lightbulb" size={20} weight="light" className="w-5 h-5" style={{ color: 'var(--lawn-600)' }} />
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Care Tips
            </h2>
          </div>
          <ul className="space-y-2">
            {careProfile.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

// Helper functions
function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  return currentMonth >= monthStart || currentMonth <= monthEnd
}

function formatMonthRange(start: number, end: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (start === end) {
    return months[start - 1]
  }
  return `${months[start - 1]} - ${months[end - 1]}`
}

function getActionColor(action: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    done: { bg: 'var(--lawn-100)', text: 'var(--lawn-700)' },
    skipped: { bg: 'var(--stone-200)', text: 'var(--stone-600)' },
    snoozed: { bg: 'var(--earth-100)', text: 'var(--earth-700)' },
  }
  return colors[action] || colors.done
}

function formatTaskKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function getTasksByMonth(tasks: LawnTask[]) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const tasksByMonth: Record<number, LawnTask[]> = {}

  tasks.forEach((task) => {
    const { month_start, month_end } = task

    if (month_start <= month_end) {
      for (let m = month_start; m <= month_end; m++) {
        if (!tasksByMonth[m]) tasksByMonth[m] = []
        tasksByMonth[m].push(task)
      }
    } else {
      for (let m = month_start; m <= 12; m++) {
        if (!tasksByMonth[m]) tasksByMonth[m] = []
        tasksByMonth[m].push(task)
      }
      for (let m = 1; m <= month_end; m++) {
        if (!tasksByMonth[m]) tasksByMonth[m] = []
        tasksByMonth[m].push(task)
      }
    }
  })

  return Object.entries(tasksByMonth)
    .map(([month, tasks]) => ({
      month: monthNames[parseInt(month) - 1],
      tasks
    }))
    .sort((a, b) => {
      const aIndex = monthNames.indexOf(a.month)
      const bIndex = monthNames.indexOf(b.month)
      return aIndex - bIndex
    })
}
