import { useMemo } from 'react'
import { motion } from 'framer-motion'
import type { Plant, AITask, TaskCategory } from '@/types/database'
import { getCategoryIcon } from '@/components/ui/botanical-icons'

const ROUTINE_CATEGORIES: TaskCategory[] = ['watering', 'pest_control']

interface MonthlyRoutineTipsProps {
  plants: Plant[]
  viewingMonth: Date
}

interface RoutineGroup {
  category: TaskCategory
  plants: { id: string; name: string }[]
  hint: string
}

export default function MonthlyRoutineTips({ plants, viewingMonth }: MonthlyRoutineTipsProps) {
  const routines = useMemo(() => {
    const month = viewingMonth.getMonth() + 1 // 1-12
    const routineMap = new Map<TaskCategory, Map<string, string>>()

    plants.forEach((plant) => {
      const careProfile = plant.ai_care_profile || plant.plant_types?.ai_care_profile
      if (!careProfile?.tasks) return

      careProfile.tasks.forEach((task: AITask) => {
        if (!ROUTINE_CATEGORIES.includes(task.category)) return
        if (!isTaskInWindow(task.month_start, task.month_end, month)) return

        if (!routineMap.has(task.category)) {
          routineMap.set(task.category, new Map())
        }
        routineMap.get(task.category)!.set(plant.id, plant.name)
      })
    })

    const groups: RoutineGroup[] = []

    ROUTINE_CATEGORIES.forEach((category) => {
      const plantMap = routineMap.get(category)
      if (plantMap && plantMap.size > 0) {
        groups.push({
          category,
          plants: Array.from(plantMap.entries()).map(([id, name]) => ({ id, name })),
          hint: getRoutineHint(category),
        })
      }
    })

    return groups
  }, [plants, viewingMonth])

  if (routines.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="px-5 py-4"
      style={{
        borderBottom: '1px solid var(--stone-200)',
      }}
    >
      <p
        className="text-xs font-medium mb-3"
        style={{ color: 'var(--text-muted)' }}
      >
        Routine Care
      </p>
      <div className="space-y-3">
        {routines.map((routine) => (
          <div
            key={routine.category}
            className="flex items-start gap-3"
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--stone-100)' }}
            >
              {getCategoryIcon(routine.category, 'w-4 h-4', { color: 'var(--stone-600)' })}
            </div>
            <div className="min-w-0 flex-1">
              <p
                className="text-sm font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatCategoryTitle(routine.category)}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {formatPlantNames(routine.plants)} · {routine.hint}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  return currentMonth >= monthStart || currentMonth <= monthEnd
}

function getRoutineHint(category: TaskCategory): string {
  switch (category) {
    case 'watering':
      return 'Check every few days'
    case 'pest_control':
      return 'Weekly inspection'
    default:
      return 'Regular care'
  }
}

function formatCategoryTitle(category: TaskCategory): string {
  switch (category) {
    case 'watering':
      return 'Watering'
    case 'pest_control':
      return 'Pest Checks'
    default:
      return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
}

function formatPlantNames(plants: { id: string; name: string }[]): string {
  if (plants.length === 1) {
    return plants[0].name
  }
  if (plants.length === 2) {
    return `${plants[0].name} and ${plants[1].name}`
  }
  if (plants.length <= 4) {
    const allButLast = plants.slice(0, -1).map((p) => p.name).join(', ')
    return `${allButLast} and ${plants[plants.length - 1].name}`
  }
  const firstThree = plants.slice(0, 3).map((p) => p.name).join(', ')
  return `${firstThree} and ${plants.length - 3} more`
}
