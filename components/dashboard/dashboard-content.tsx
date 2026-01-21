'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Plant, TaskHistory, TaskSuggestion, AITask } from '@/types/database'
import Icon from '@/components/ui/icon'
import { EmptyGardenIllustration } from '@/components/ui/empty-states'
import { LawnDashboardWidget } from '@/components/lawn'
import { MonthlyCalendar } from '@/components/calendar'
import JournalHero from './journal-hero'
import TodaysFocus from './todays-focus'
import YourGarden from './your-garden'

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
  const featuredTask = thisWeekTasks[0] || null

  const allCaughtUp = thisWeekTasks.length === 0 && plants.length > 0

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero with personalized greeting */}
      <JournalHero
        taskCount={thisWeekTasks.length}
        allCaughtUp={allCaughtUp}
      />

      {/* Empty State for new users */}
      {plants.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
            Your garden journal awaits
          </h2>
          <p
            className="mb-8 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Add your first plant and we&apos;ll create a personalised care schedule
            with UK-specific seasonal guidance.
          </p>
          <Link href="/plants/new" className="btn btn-primary inline-flex items-center gap-2">
            <Icon name="Plus" size={18} weight="light" />
            Add your first plant
          </Link>
        </motion.div>
      )}

      {/* Main Dashboard Content */}
      {plants.length > 0 && (
        <div className="space-y-8">
          {/* Today's Focus - Featured Task */}
          <TodaysFocus featuredTask={featuredTask} />

          {/* Monthly Calendar */}
          <MonthlyCalendar plants={plants} taskHistory={taskHistory} />

          {/* Your Garden - Full Width */}
          <YourGarden plants={plants} />

          {/* Lawn Care Section */}
          <section>
            <h2
              className="text-lg font-semibold mb-4"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Lawn Care
            </h2>
            <div className="max-w-md">
              <LawnDashboardWidget />
            </div>
          </section>
        </div>
      )}
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
