'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'

interface PlantGridCardProps {
  plant: Plant
  index: number
}

export default function PlantGridCard({ plant, index }: PlantGridCardProps) {
  const hasPhoto = !!plant.photo_url
  const topLevel = plant.plant_types?.top_level
  const middleLevel = plant.plant_types?.middle_level
  const cultivarName = plant.cultivar_name

  // Display name: prefer top_level, then middle_level, then plant.name
  const displayName = topLevel || middleLevel || plant.name
  // Subtitle: show cultivar if available
  const subtitle = cultivarName

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.04, duration: 0.25 }}
    >
      <Link
        href={`/plants/${plant.id}`}
        className="block rounded-lg overflow-hidden transition-all hover:shadow-md group"
        style={{
          background: 'white',
          border: '1px solid var(--stone-200)',
        }}
      >
        {/* Image area */}
        <div
          className="aspect-square relative overflow-hidden"
          style={{ background: hasPhoto ? 'var(--stone-100)' : 'var(--sage-50)' }}
        >
          {hasPhoto ? (
            <Image
              src={plant.photo_url!}
              alt={plant.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              {getPlantTypeIcon(
                plant.plant_types?.top_level || '',
                'w-10 h-10',
                { color: 'var(--sage-300)' }
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-2 py-1.5">
          <h4
            className="font-medium text-sm leading-tight truncate"
            style={{ color: 'var(--text-primary)' }}
          >
            {displayName}
          </h4>
          {subtitle && (
            <p
              className="text-xs leading-tight truncate mt-0.5"
              style={{ color: 'var(--text-muted)' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  )
}

interface AddPlantCardProps {
  index: number
}

export function AddPlantCard({ index }: AddPlantCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 + index * 0.04, duration: 0.25 }}
    >
      <Link
        href="/plants/new"
        className="block relative rounded-lg overflow-hidden transition-all hover:shadow-md group"
        style={{
          background: 'var(--sage-50)',
          border: '2px dashed var(--sage-200)',
        }}
      >
        {/* Match the plant card structure exactly */}
        <div className="aspect-square" />
        <div className="px-2 py-1.5">
          <p className="text-sm leading-tight">&nbsp;</p>
        </div>

        {/* Centered content overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="w-9 h-9 rounded-full mx-auto mb-1.5 flex items-center justify-center transition-colors group-hover:bg-sage-200"
              style={{ background: 'var(--sage-100)' }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ color: 'var(--sage-600)' }}
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <span
              className="text-sm font-medium"
              style={{ color: 'var(--sage-600)' }}
            >
              Add plant
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
