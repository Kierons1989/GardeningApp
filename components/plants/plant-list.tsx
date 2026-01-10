'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Plant } from '@/types/database'
import PlantCard from './plant-card'

interface PlantListProps {
  plants: Plant[]
}

export default function PlantList({ plants }: PlantListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  // Group plants by top level (plant type group)
  const plantsByTopLevel = plants.reduce<Record<string, Plant[]>>((acc, plant) => {
    const topLevel = plant.plant_types?.top_level || plant.plant_type || 'Other Plants'
    if (!acc[topLevel]) acc[topLevel] = []
    acc[topLevel].push(plant)
    return acc
  }, {})

  const topLevels = Object.keys(plantsByTopLevel).sort((a, b) => {
    if (a === 'Other Plants') return 1
    if (b === 'Other Plants') return -1
    return a.localeCompare(b)
  })

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-semibold mb-2"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            My Plants
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            {plants.length} plant{plants.length !== 1 ? 's' : ''} in your collection
          </p>
        </div>

        <Link href="/plants/new" className="btn btn-primary">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Add Plant
        </Link>
      </motion.div>

      {/* Empty State */}
      {plants.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
            style={{ background: 'var(--sage-100)' }}
          >
            <svg
              viewBox="0 0 24 24"
              className="w-10 h-10"
              style={{ color: 'var(--sage-600)' }}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 22V8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5.5 11.5C5.5 9 7 4 12 4s6.5 5 6.5 7.5c0 3-2.5 4.5-6.5 4.5s-6.5-1.5-6.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            No plants yet
          </h2>
          <p
            className="mb-8 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Start building your garden by adding your first plant.
            We&apos;ll help you create a care schedule tailored to UK seasons.
          </p>
          <Link href="/plants/new" className="btn btn-primary">
            Add your first plant
          </Link>
        </motion.div>
      )}

      {/* Plants Grid by Top Level */}
      {plants.length > 0 && (
        <div className="space-y-10">
          {topLevels.map((topLevel) => (
            <motion.section key={topLevel} variants={itemVariants}>
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {topLevel}
                </h2>
                <span
                  className="text-sm px-2 py-1 rounded-full"
                  style={{
                    background: 'var(--stone-100)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {plantsByTopLevel[topLevel].length}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plantsByTopLevel[topLevel].map((plant, index) => (
                  <PlantCard key={plant.id} plant={plant} index={index} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      )}
    </motion.div>
  )
}
