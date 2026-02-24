import { useMemo } from 'react'
import type { Plant, TaskHistory, AITask, TaskCategory } from '@/types/database'

// Routine categories are shown in the RoutinesWidget, not the calendar
const ROUTINE_CATEGORIES: TaskCategory[] = ['watering', 'pest_control']

export interface CalendarTask {
  task: AITask
  plant: Plant
  lastAction: TaskHistory | null
}

/**
 * Hook to get all tasks active in a given month
 * Tasks are considered active if the month falls within their month_start to month_end window
 */
export function useCalendarTasks(
  plants: Plant[],
  taskHistory: TaskHistory[],
  viewingMonth: Date
): CalendarTask[] {
  return useMemo(() => {
    const tasks: CalendarTask[] = []
    const viewingMonthNum = viewingMonth.getMonth() + 1 // 1-12

    plants.forEach((plant) => {
      // Prefer per-plant care profile (from plant state updates) over shared plant_type profile
      const careProfile = plant.ai_care_profile || plant.plant_types?.ai_care_profile
      if (!careProfile?.tasks) return

      careProfile.tasks.forEach((task) => {
        // Skip routine tasks - they're shown in the RoutinesWidget
        if (ROUTINE_CATEGORIES.includes(task.category)) return

        // Check if task is active in the viewing month
        const inWindow = isTaskInWindow(task.month_start, task.month_end, viewingMonthNum)
        if (!inWindow) return

        // Check recent history for this task
        const recentAction = taskHistory.find(
          (h) => h.plant_id === plant.id && h.task_key === task.key
        )

        // Skip if recently done/skipped based on recurrence
        if (recentAction && shouldSkipTask(recentAction, task.recurrence_type)) {
          return
        }

        tasks.push({
          task,
          plant,
          lastAction: recentAction || null,
        })
      })
    })

    // Sort by category, then by effort level (high priority first)
    return tasks.sort((a, b) => {
      // Sort by effort level first (high > medium > low)
      const effortOrder = { high: 0, medium: 1, low: 2 }
      const effortDiff = effortOrder[a.task.effort_level] - effortOrder[b.task.effort_level]
      if (effortDiff !== 0) return effortDiff

      // Then by category
      return a.task.category.localeCompare(b.task.category)
    })
  }, [plants, taskHistory, viewingMonth])
}

/**
 * Check if a task is within its active window for a given month
 */
function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  // Handles wrapping (e.g., Nov-Feb spans year boundary)
  return currentMonth >= monthStart || currentMonth <= monthEnd
}

/**
 * Check if a task should be skipped based on recent history
 */
function shouldSkipTask(action: TaskHistory, recurrenceType: string): boolean {
  const actionDate = new Date(action.created_at)
  const now = new Date()
  const daysSince = Math.floor((now.getTime() - actionDate.getTime()) / (1000 * 60 * 60 * 24))

  // If snoozed, check if snooze period has passed
  if (action.action === 'snoozed' && action.snooze_until) {
    return new Date(action.snooze_until) > now
  }

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

/**
 * Get the month name for display
 */
export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
  return months[month]
}
