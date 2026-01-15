'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { Plant } from '@/types/database'
import PlantCard from './plant-card'
import PlantTypeCard from './plant-type-card'
import { EmptyGardenIllustration, NoResultsIllustration } from '@/components/ui/empty-states'
import Icon from '@/components/ui/icon'
import { groupPlantsByType } from '@/lib/utils/group-plants'

interface PlantListProps {
  plants: Plant[]
}

type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc'
type ViewMode = 'byType' | 'individual'

export default function PlantList({ plants }: PlantListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedArea, setSelectedArea] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('byType')
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
    const filtered = plants.filter(plant => {
      // Search filter (includes cultivar_name)
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesName = plant.name?.toLowerCase().includes(query)
        const matchesCommon = plant.common_name?.toLowerCase().includes(query)
        const matchesSpecies = plant.species?.toLowerCase().includes(query)
        const matchesCultivar = plant.cultivar_name?.toLowerCase().includes(query)
        const matchesMiddleLevel = plant.plant_types?.middle_level?.toLowerCase().includes(query)
        if (!matchesName && !matchesCommon && !matchesSpecies && !matchesCultivar && !matchesMiddleLevel) return false
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

  // Group plants by plant_type_id (for byType view)
  const plantTypeGroups = useMemo(() => {
    return groupPlantsByType(filteredAndSortedPlants)
  }, [filteredAndSortedPlants])

  // Group plant type cards by top_level category (e.g., "Rose", "Tomato")
  const categorizedGroups = useMemo(() => {
    const categories = new Map<string, typeof plantTypeGroups>()

    for (const group of plantTypeGroups) {
      const category = group.plantType.top_level || 'Other'
      if (!categories.has(category)) {
        categories.set(category, [])
      }
      categories.get(category)!.push(group)
    }

    // Sort categories alphabetically
    return Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [plantTypeGroups])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
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
            <Icon name="Plus" size={20} weight="light" className="w-5 h-5" ariaLabel="add plant" />
            <span className="hidden sm:inline">Add Plant</span>
          </Link>
        </div>

        {/* Search and Controls */}
        {plants.length > 0 && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <Icon name="MagnifyingGlass" size={20} weight="light" className="w-5 h-5" ariaLabel="search" style={{ color: 'var(--text-secondary)' }} />
              </div>
              <input
                type="text"
                placeholder="Search plants by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input"
                style={{ paddingLeft: '48px' }}
              />
            </div>

            {/* Filter and Sort Bar */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: showFilters || hasActiveFilters ? 'var(--sage-100)' : 'var(--stone-200)',
                  color: showFilters || hasActiveFilters ? 'var(--sage-700)' : 'var(--text-primary)',
                  border: '1px solid var(--stone-300)',
                }}
              >
                <Icon name="Funnel" size={16} weight="light" className="w-4 h-4" ariaLabel="filters" />
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
                className="px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors"
                style={{
                  background: 'var(--stone-200)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--stone-300)',
                }}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
              </select>

              <button
                onClick={() => setViewMode(viewMode === 'byType' ? 'individual' : 'byType')}
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  background: 'var(--stone-200)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--stone-300)',
                }}
              >
                {viewMode === 'byType' ? (
                  <>
                    <Icon name="SquaresFour" size={16} weight="light" ariaLabel="individual view" />
                    <span className="hidden sm:inline">Individual</span>
                  </>
                ) : (
                  <>
                    <Icon name="Stack" size={16} weight="light" ariaLabel="by type view" />
                    <span className="hidden sm:inline">By Type</span>
                  </>
                )}
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

      {/* Individual View - each cultivar as separate card */}
      {filteredAndSortedPlants.length > 0 && viewMode === 'individual' && (
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedPlants.map((plant, index) => (
            <PlantCard key={plant.id} plant={plant} index={index} />
          ))}
        </motion.div>
      )}

      {/* By Type View - grouped by top-level category with section headers */}
      {filteredAndSortedPlants.length > 0 && viewMode === 'byType' && (
        <motion.div variants={itemVariants} className="space-y-6 md:space-y-8">
          {categorizedGroups.map(([category, groups], categoryIndex) => (
            <section key={category}>
              <h2
                className="text-lg md:text-xl font-semibold mb-3 md:mb-4 flex items-center gap-2"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                {category}
                <span
                  className="text-xs md:text-sm font-normal px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--stone-100)', color: 'var(--text-muted)' }}
                >
                  {groups.reduce((acc, g) => acc + g.cultivars.length, 0)}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                {groups.map((group, index) => (
                  <PlantTypeCard
                    key={group.plantType.id}
                    group={group}
                    index={categoryIndex * 10 + index}
                    defaultExpanded={plantTypeGroups.length === 1}
                  />
                ))}
              </div>
            </section>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}
