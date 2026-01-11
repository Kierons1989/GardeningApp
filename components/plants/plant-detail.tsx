'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Plant, TaskHistory } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import TaskActions from '@/components/tasks/task-actions'
import PlantChat from '@/components/chat/plant-chat'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'

interface PlantDetailProps {
  plant: Plant
  taskHistory: TaskHistory[]
}

export default function PlantDetail({ plant, taskHistory }: PlantDetailProps) {
  const router = useRouter()
  const [showChat, setShowChat] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Get care profile from either location (plant_types relation or directly on plant)
  const careProfile = plant.plant_types?.ai_care_profile || plant.ai_care_profile

  const currentMonth = new Date().getMonth() + 1
  const activeTasks = careProfile?.tasks.filter((task) => {
    const inWindow = isTaskInWindow(task.month_start, task.month_end, currentMonth)
    if (!inWindow) return false

    // Check if already done recently
    const recentAction = taskHistory.find((h) => h.task_key === task.key)
    if (recentAction) {
      const daysSince = Math.floor(
        (Date.now() - new Date(recentAction.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )
      if (task.recurrence_type === 'weekly_in_window' && daysSince < 7) return false
      if (task.recurrence_type === 'once_per_window' && daysSince < 30) return false
      if (task.recurrence_type === 'monthly_in_window' && daysSince < 28) return false
    }
    return true
  }) || []

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this plant? This cannot be undone.')) {
      return
    }

    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase.from('plants').delete().eq('id', plant.id)

    if (!error) {
      router.push('/plants')
      router.refresh()
    } else {
      alert('Failed to delete plant')
      setDeleting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/plants"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to plants
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 mb-6"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex items-start gap-6">
          {/* Plant Icon */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--sage-100)' }}
          >
            {getPlantTypeIcon(plant.plant_types?.top_level || plant.plant_type || '', 'w-10 h-10', { color: 'var(--sage-700)' })}
          </div>

          {/* Plant Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1
                  className="text-3xl font-semibold mb-1"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {plant.name}
                </h1>
                {plant.common_name && plant.common_name !== plant.name && (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {plant.common_name}
                  </p>
                )}
                {plant.species && (
                  <p className="italic text-sm" style={{ color: 'var(--text-muted)' }}>
                    {plant.species}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="relative"
                  style={{
                    background: showChat ? 'var(--sage-600)' : 'var(--sage-100)',
                    color: showChat ? 'white' : 'var(--sage-700)',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-crimson)',
                    fontWeight: '500',
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all var(--transition-fast)',
                    border: showChat ? 'none' : '1px solid var(--sage-200)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {showChat ? 'Hide Chat' : 'Ask AI'}
                  {!showChat && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                      style={{ background: 'var(--coral)' }}
                    />
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="p-2 rounded-lg transition-colors"
                  style={{
                    color: 'var(--error)',
                    background: 'rgba(199, 81, 70, 0.1)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-4 mt-4">
              {plant.area && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="10" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {plant.area}
                </span>
              )}
              {plant.planted_in && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {plant.planted_in === 'ground' && (
                      <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {plant.planted_in === 'pot' && (
                      <path d="M8 4h8L18 20H6L8 4zM8 4h8" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                    {plant.planted_in === 'raised_bed' && (
                      <rect x="3" y="8" width="18" height="12" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    )}
                  </svg>
                  {formatPlantedIn(plant.planted_in)}
                </span>
              )}
              {careProfile?.uk_hardiness && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--sage-100)',
                    color: 'var(--sage-700)',
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 2v4M12 18v4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M2 12h4M18 12h4M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {careProfile.uk_hardiness}
                </span>
              )}
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
        {plant.notes && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'var(--stone-50)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Your notes
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>{plant.notes}</p>
          </div>
        )}
      </motion.div>

      {/* Chat Panel */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <PlantChat plant={plant} taskHistory={taskHistory} />
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6"
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
                  className="p-4 rounded-xl"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatMonthRange(task.month_start, task.month_end)}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        background: getCategoryColor(task.category).bg,
                        color: getCategoryColor(task.category).text,
                      }}
                    >
                      {task.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {task.why_this_matters}
                  </p>
                  <TaskActions plantId={plant.id} taskKey={task.key} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Task History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-6"
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

          {taskHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {taskHistory.slice(0, 10).map((history) => (
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
                    {history.action === 'done' && '✓'}
                    {history.action === 'skipped' && '→'}
                    {history.action === 'snoozed' && '⏰'}
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
      </div>

      {/* Full Care Calendar */}
      {careProfile?.tasks && careProfile.tasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6 rounded-2xl p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-6">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="var(--sage-600)" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3 10h18M8 2v4M16 2v4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
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

          <div className="grid gap-4">
            {getTasksByMonth(careProfile.tasks).map(({ month, tasks }) => (
              <div
                key={month}
                className="p-5 rounded-xl"
                style={{ background: 'var(--stone-50)' }}
              >
                <h3
                  className="font-semibold mb-4 text-lg"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {month}
                </h3>
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <div
                      key={task.key}
                      className="p-4 rounded-lg"
                      style={{
                        background: 'white',
                        border: '1px solid var(--stone-200)'
                      }}
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <span
                          className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0"
                          style={{
                            background: getCategoryColor(task.category).bg,
                            color: getCategoryColor(task.category).text,
                          }}
                        >
                          {task.category.replace(/_/g, ' ')}
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
                    </div>
                  ))}
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
          transition={{ delay: 0.4 }}
          className="mt-6 rounded-2xl p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="var(--sage-400)" stroke="var(--sage-600)" strokeWidth="1.5">
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v6M12 17v6M23 12h-6M7 12H1" strokeLinecap="round" />
            </svg>
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
              <li key={i} className="flex gap-2" style={{ color: 'var(--text-secondary)' }}>
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

function formatPlantedIn(plantedIn: string): string {
  const labels: Record<string, string> = {
    ground: 'In ground',
    pot: 'In pot',
    raised_bed: 'Raised bed',
  }
  return labels[plantedIn] || plantedIn
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
    done: { bg: 'var(--sage-100)', text: 'var(--sage-700)' },
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

function getTasksByMonth(tasks: any[]) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const tasksByMonth: Record<number, any[]> = {}

  tasks.forEach((task) => {
    const { month_start, month_end } = task

    if (month_start <= month_end) {
      // Normal range (e.g., March to June)
      for (let m = month_start; m <= month_end; m++) {
        if (!tasksByMonth[m]) tasksByMonth[m] = []
        tasksByMonth[m].push(task)
      }
    } else {
      // Wraps around year (e.g., November to February)
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

  // Convert to array and sort by month
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
