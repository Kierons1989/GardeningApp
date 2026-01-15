'use client'

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlantTypeGroup } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'
import CultivarRow from './cultivar-row'

interface PlantTypeCardProps {
  group: PlantTypeGroup
  index: number
  defaultExpanded?: boolean
}

const PlantTypeCard = memo(function PlantTypeCard({
  group,
  index,
  defaultExpanded = false,
}: PlantTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const { plantType, cultivars } = group
  const careProfile = plantType.ai_care_profile
  const taskCount = careProfile?.tasks?.length || 0
  const cultivarCount = cultivars.length

  const displayName = plantType.middle_level || plantType.top_level
  const subtitle =
    plantType.middle_level && plantType.top_level !== plantType.middle_level
      ? plantType.top_level
      : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--stone-100)',
        }}
      >
        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left transition-colors"
          style={{ background: 'transparent' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--stone-50)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <div className="flex items-start gap-4">
            {/* Plant Type Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--sage-100)' }}
            >
              {getPlantTypeIcon(plantType.top_level, 'w-7 h-7', {
                color: 'var(--sage-600)',
              })}
            </div>

            {/* Plant Type Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-lg truncate mb-1"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                {displayName}
              </h3>

              {subtitle && (
                <p
                  className="text-sm truncate mb-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {subtitle}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {plantType.growth_habit?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--sage-50)', color: 'var(--sage-700)' }}
                  >
                    {tag}
                  </span>
                ))}

                {taskCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'var(--earth-100)', color: 'var(--earth-700)' }}
                  >
                    <Icon name="Clipboard" size={12} weight="light" ariaLabel="tasks" />
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Expand indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {cultivarCount} {cultivarCount === 1 ? 'variety' : 'varieties'}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  name="CaretDown"
                  size={20}
                  weight="light"
                  style={{ color: 'var(--text-muted)' }}
                  ariaLabel={isExpanded ? 'collapse' : 'expand'}
                />
              </motion.div>
            </div>
          </div>
        </button>

        {/* Expanded cultivar list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-4 pt-2 border-t"
                style={{ borderColor: 'var(--stone-100)' }}
              >
                <div className="space-y-1">
                  {cultivars.map((plant) => (
                    <CultivarRow
                      key={plant.id}
                      plant={plant}
                      topLevel={plantType.top_level}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

export default PlantTypeCard
