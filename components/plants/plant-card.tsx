'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'

interface PlantCardProps {
  plant: Plant
  index: number
}

export default function PlantCard({ plant, index }: PlantCardProps) {
  const careProfile = plant.plant_types?.ai_care_profile
  const taskCount = careProfile?.tasks?.length || 0
  const hasProfile = !!careProfile
  const topLevel = plant.plant_types?.top_level
  const middleLevel = plant.plant_types?.middle_level
  const cultivarName = plant.cultivar_name
  const growthHabit = plant.plant_types?.growth_habit || []

  // Determine card title and subtitle
  const cardTitle = cultivarName
    ? cultivarName
    : topLevel && middleLevel
      ? `${topLevel} - ${middleLevel}`
      : plant.name

  const cardSubtitle = cultivarName && middleLevel ? middleLevel : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        href={`/plants/${plant.id}`}
        className="group block rounded-xl p-5 card-hover"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div className="flex items-start gap-4">
          {/* Plant Icon/Image */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--sage-100)' }}
          >
            {plant.photo_url ? (
              <img
                src={plant.photo_url}
                alt={plant.name}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              getPlantTypeIcon(plant.plant_types?.top_level || '', 'w-7 h-7', { color: 'var(--sage-600)' })
            )}
          </div>

          {/* Plant Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="font-medium text-lg truncate mb-1"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              {cardTitle}
            </h3>

            {cardSubtitle && (
              <p
                className="text-sm truncate mb-2"
                style={{ color: 'var(--text-muted)' }}
              >
                {cardSubtitle}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap mb-2">
              {growthHabit.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: 'var(--sage-50)',
                    color: 'var(--sage-700)',
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Task Count */}
              {hasProfile && (
                <span
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                  style={{
                    background: 'var(--earth-100)',
                    color: 'var(--earth-700)',
                  }}
                >
                  <Icon name="Clipboard" size={12} weight="light" className="w-3 h-3" ariaLabel="tasks" />
                  {taskCount} task{taskCount !== 1 ? 's' : ''}
                </span>
              )}

              {/* Planted In */}
              {plant.planted_in && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {formatPlantedIn(plant.planted_in)}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'var(--stone-100)' }}
          >
            <Icon name="CaretRight" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--text-muted)' }} ariaLabel="open" />
          </div>
        </div>

        {/* Profile Status */}
        {!hasProfile && (
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--stone-100)' }}
          >
            <p
              className="text-sm flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <Icon name="Clock" size={16} weight="light" className="w-4 h-4" ariaLabel="pending" />
              Care profile pending
            </p>
          </div>
        )}

        {/* Summary Preview */}
        {careProfile?.summary && (
          <div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: 'var(--stone-100)' }}
          >
            <p
              className="text-sm line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {careProfile.summary}
            </p>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

function formatPlantedIn(plantedIn: string): string {
  const labels: Record<string, string> = {
    ground: 'In ground',
    pot: 'In pot',
    raised_bed: 'Raised bed',
  }
  return labels[plantedIn] || plantedIn
}
