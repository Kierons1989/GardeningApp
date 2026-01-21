'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import PlantGridCard, { AddPlantCard } from './plant-grid-card'

interface YourGardenProps {
  plants: Plant[]
}

const MAX_DISPLAY = 7

export default function YourGarden({ plants }: YourGardenProps) {
  const displayPlants = plants.slice(0, MAX_DISPLAY)
  const hasMore = plants.length > MAX_DISPLAY

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Your Garden
        </h2>
        <div className="flex items-center gap-3">
          {/* Mobile add button */}
          <Link
            href="/plants/new"
            className="md:hidden flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: 'var(--sage-600)' }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add
          </Link>
          {hasMore && (
            <Link
              href="/plants"
              className="text-sm font-medium hover:underline"
              style={{ color: 'var(--sage-600)' }}
            >
              View all {plants.length}
            </Link>
          )}
        </div>
      </div>

      <div
        className="grid gap-2.5"
        style={{
          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 180px))',
        }}
      >
        {displayPlants.map((plant, index) => (
          <PlantGridCard key={plant.id} plant={plant} index={index} />
        ))}
        {/* Hide add card on mobile, show on md+ */}
        <div className="hidden md:block">
          <AddPlantCard index={displayPlants.length} />
        </div>
      </div>
    </motion.section>
  )
}
