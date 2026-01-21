import { useMemo } from 'react'
import type { Plant, AITask, TaskCategory } from '@/types/database'

const ROUTINE_CATEGORIES: TaskCategory[] = ['watering', 'pest_control']

export interface RoutineGroup {
  category: TaskCategory
  plantCount: number
  recurrenceHint: string
}

/**
 * Hook to gather routine care tasks (watering, pest checks) for display.
 * Returns grouped routine data without tracking state.
 */
export function useRoutines(plants: Plant[]): RoutineGroup[] {
  return useMemo(() => {
    const currentMonth = new Date().getMonth() + 1 // 1-12
    const routineMap = new Map<TaskCategory, Set<string>>()

    plants.forEach((plant) => {
      const careProfile = plant.plant_types?.ai_care_profile
      if (!careProfile?.tasks) return

      careProfile.tasks.forEach((task: AITask) => {
        // Only include routine categories
        if (!ROUTINE_CATEGORIES.includes(task.category)) return

        // Check if task is in current window
        if (!isTaskInWindow(task.month_start, task.month_end, currentMonth)) return

        // Add plant to this routine category
        if (!routineMap.has(task.category)) {
          routineMap.set(task.category, new Set())
        }
        routineMap.get(task.category)!.add(plant.id)
      })
    })

    // Convert map to array of RoutineGroups
    const routines: RoutineGroup[] = []

    ROUTINE_CATEGORIES.forEach((category) => {
      const plantIds = routineMap.get(category)
      if (plantIds && plantIds.size > 0) {
        routines.push({
          category,
          plantCount: plantIds.size,
          recurrenceHint: getRecurrenceHint(category),
        })
      }
    })

    return routines
  }, [plants])
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
 * Get a friendly recurrence hint for each routine category
 */
function getRecurrenceHint(category: TaskCategory): string {
  switch (category) {
    case 'watering':
      return 'Check every few days'
    case 'pest_control':
      return 'Weekly inspection'
    default:
      return 'Regular care'
  }
}

export { ROUTINE_CATEGORIES }
