'use client'

import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import { useRoutines } from './use-routines'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getCategoryIcon } from '@/components/ui/botanical-icons'

interface RoutinesWidgetProps {
  plants: Plant[]
}

export default function RoutinesWidget({ plants }: RoutinesWidgetProps) {
  const routines = useRoutines(plants)

  // Don't render if no active routines this month
  if (routines.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <h2
        className="text-lg font-semibold mb-3"
        style={{
          fontFamily: 'var(--font-cormorant)',
          color: 'var(--text-primary)',
        }}
      >
        Regular Care
      </h2>

      <div
        className="rounded-2xl p-4"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--stone-100)',
        }}
      >
        <div className="flex flex-wrap gap-3">
          {routines.map((routine, index) => {
            const colors = getCategoryColor(routine.category)
            const title = formatCategoryTitle(routine.category)

            return (
              <motion.div
                key={routine.category}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05, duration: 0.2 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl flex-1 min-w-[160px]"
                style={{
                  background: colors.bg,
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                  }}
                >
                  {getCategoryIcon(routine.category, 'w-5 h-5', { color: colors.text })}
                </div>

                <div className="min-w-0">
                  <p
                    className="font-medium text-sm leading-tight"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {routine.plantCount} {routine.plantCount === 1 ? 'plant' : 'plants'} · {routine.recurrenceHint}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

function formatCategoryTitle(category: string): string {
  switch (category) {
    case 'watering':
      return 'Watering'
    case 'pest_control':
      return 'Pest Checks'
    default:
      return category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }
}
