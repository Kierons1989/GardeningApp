'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant } from '@/types/database'
import PlantCard from './plant-card'
import { EmptyGardenIllustration, NoResultsIllustration } from '@/components/ui/empty-states'

interface PlantListProps {
  plants: Plant[]
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'
type ViewMode = 'grouped' | 'grid'

export default function PlantList({ plants }: PlantListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grouped')
  const [showFilters, setShowFilters] = useState(false)
  // Extract unique areas and types for filters
  const uniqueAreas = useMemo(() => {
    const areas = plants.map(p => p.area).filter(Boolean) as string[]
    return Array.from(new Set(areas)).sort()
  }, [plants])

  const uniqueTypes = useMemo(() => {
    const types = plants.map(p => p.plant_types?.top_level).filter(Boolean) as string[]
    return Array.from(new Set(types)).sort()
  }, [plants])

  // Filter and sort plants
  const filteredAndSortedPlants = useMemo(() => {
    let filtered = plants.filter(plant => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = plant.name?.toLowerCase().includes(query)
        const matchesCommon = plant.common_name?.toLowerCase().includes(query)
        const matchesSpecies = plant.species?.toLowerCase().includes(query)
        if (!matchesName && !matchesCommon && !matchesSpecies) return false
      }

      // Area filter
      if (selectedArea && plant.area !== selectedArea) return false

      // Type filter
      if (selectedType) {
        const plantType = plant.plant_types?.top_level
        if (plantType !== selectedType) return false
      }

      return true
    })

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [plants, searchQuery, selectedArea, selectedType, sortBy])

  // Group plants by top level (plant type group)
  const plantsByTopLevel = useMemo(() => {
    return filteredAndSortedPlants.reduce<Record<string, Plant[]>>((acc, plant) => {
      const topLevel = plant.plant_types?.top_level || 'Other Plants'
      if (!acc[topLevel]) acc[topLevel] = []
      acc[topLevel].push(plant)
      return acc
    }, {})
  }, [filteredAndSortedPlants])

  const topLevels = Object.keys(plantsByTopLevel).sort((a, b) => {
    if (a === 'Other Plants') return 1
    if (b === 'Other Plants') return -1
    return a.localeCompare(b)
  })

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

  const hasActiveFilters = searchQuery || selectedArea || selectedType

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-3xl md:text-4xl font-semibold mb-2"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              My Plants
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filteredAndSortedPlants.length} of {plants.length} plant{plants.length !== 1 ? 's' : ''}
            </p>
          </div>

          <Link href="/plants/new" className="btn btn-primary">
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="hidden sm:inline">Add Plant</span>
          </Link>
        </div>

        {/* Search and Controls */}
        {plants.length > 0 && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <input
                type="text"
                placeholder="Search plants by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-12"
              />
            </div>

            {/* Filter and Sort Bar */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: showFilters || hasActiveFilters ? 'var(--sage-100)' : 'var(--stone-100)',
                  color: showFilters || hasActiveFilters ? 'var(--sage-700)' : 'var(--text-secondary)',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Filters
                {hasActiveFilters && (
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ background: 'var(--sage-600)' }}
                  />
                )}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-4 py-2 rounded-lg text-sm font-medium border-0 cursor-pointer"
                style={{
                  background: 'var(--stone-100)',
                  color: 'var(--text-secondary)',
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'grouped' ? 'grid' : 'grouped')}
                className="ml-auto px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--stone-100)',
                  color: 'var(--text-secondary)',
                }}
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
                  {viewMode === 'grouped' ? (
                    <path d="M10 3H3v7h7V3zM21 3h-7v7h7V3zM21 14h-7v7h7v-7zM10 14H3v7h7v-7z" strokeLinecap="round" strokeLinejoin="round" />
                  ) : (
                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" strokeLinejoin="round" />
                  )}
                </svg>
              </button>
            </div>

            {/* Filter Dropdown */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div
                    className="p-4 rounded-xl space-y-4"
                    style={{
                      background: 'white',
                      border: '1px solid var(--stone-200)',
                    }}
                  >
                    <div className="grid sm:grid-cols-2 gap-4">
                      {/* Area Filter */}
                      <div>
                        <label className="label">Garden Area</label>
                        <select
                          value={selectedArea}
                          onChange={(e) => setSelectedArea(e.target.value)}
                          className="input"
                        >
                          <option value="">All areas</option>
                          {uniqueAreas.map((area) => (
                            <option key={area} value={area}>
                              {area}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Type Filter */}
                      <div>
                        <label className="label">Plant Type</label>
                        <select
                          value={selectedType}
                          onChange={(e) => setSelectedType(e.target.value)}
                          className="input"
                        >
                          <option value="">All types</option>
                          {uniqueTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedArea('')
                          setSelectedType('')
                        }}
                        className="text-sm font-medium"
                        style={{ color: 'var(--sage-600)' }}
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* No Results State */}
      {plants.length > 0 && filteredAndSortedPlants.length === 0 && (
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-12 text-center"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <NoResultsIllustration className="w-40 h-40 mx-auto mb-6" />
          <h2
            className="text-2xl font-semibold mb-3"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            No plants found
          </h2>
          <p
            className="mb-6 max-w-md mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            Try adjusting your filters or search query.
          </p>
          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedArea('')
              setSelectedType('')
            }}
            className="btn btn-secondary"
          >
            Clear all filters
          </button>
        </motion.div>
      )}

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
          <EmptyGardenIllustration className="w-48 h-48 mx-auto mb-6" />
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

      {/* Plants Grid */}
      {filteredAndSortedPlants.length > 0 && viewMode === 'grid' && (
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPlants.map((plant, index) => (
            <PlantCard key={plant.id} plant={plant} index={index} />
          ))}
        </motion.div>
      )}

      {/* Plants Grid by Top Level (Grouped) */}
      {filteredAndSortedPlants.length > 0 && viewMode === 'grouped' && (
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

              <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
