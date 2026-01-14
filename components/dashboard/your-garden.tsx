'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import PlantGridCard, { AddPlantCard } from './plant-grid-card'

interface YourGardenProps {
  plants: Plant[]
}

const MAX_DISPLAY = 7 // 7 plants + 1 add card = 8 total for even grid

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

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2.5">
        {displayPlants.map((plant, index) => (
          <PlantGridCard key={plant.id} plant={plant} index={index} />
        ))}
        <AddPlantCard index={displayPlants.length} />
      </div>
    </motion.section>
  )
}
