'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlantIdentification, PlantSearchResult } from '@/types/database'
import { SpinningLeafLoader, GrowingPlantLoader } from '@/components/ui/botanical-loader'
import Icon from '@/components/ui/icon'
import ImageUpload, { type ImageUploadRef } from '@/components/plants/image-upload'
import PlantSearchInput from '@/components/plants/plant-search-input'
import MergePrompt from '@/components/plants/merge-prompt'
import { createClient } from '@/lib/supabase/client'

type Step = 'search' | 'identifying' | 'merge' | 'details' | 'generating' | 'review'

interface ExistingTypeInfo {
  exists: boolean
  plantTypeId?: string
  existingCultivars?: string[]
}

export default function NewPlantPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('search')
  const [userId, setUserId] = useState<string | null>(null)
  const imageUploadRef = useRef<ImageUploadRef>(null)

  // Form state
  const [userInput, setUserInput] = useState('')
  const [area, setArea] = useState('')
  const [plantedIn, setPlantedIn] = useState<'ground' | 'pot' | 'raised_bed' | ''>('')
  const [notes, setNotes] = useState('')
  const [pendingImage, setPendingImage] = useState<Blob | null>(null)

  // Selected plant from search (if any)
  const [selectedPlant, setSelectedPlant] = useState<PlantSearchResult | null>(null)

  // Editable taxonomy (after identification/selection, user can edit)
  const [topLevel, setTopLevel] = useState('')
  const [middleLevel, setMiddleLevel] = useState('')
  const [cultivarName, setCultivarName] = useState('')
  const [growthHabit, setGrowthHabit] = useState<string[]>([])

  // Error state
  const [aiError, setAiError] = useState<string | null>(null)

  // Merge flow state
  const [existingTypeInfo, setExistingTypeInfo] = useState<ExistingTypeInfo | null>(null)
  const [useExistingTypeId, setUseExistingTypeId] = useState<string | null>(null)

  // Get user ID on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  // Check if user already has plants of this type
  async function checkExistingType(top: string, middle: string): Promise<ExistingTypeInfo | null> {
    try {
      const res = await fetch(
        `/api/plants/check-type?topLevel=${encodeURIComponent(top)}&middleLevel=${encodeURIComponent(middle)}`
      )
      if (!res.ok) return null
      const data = await res.json()
      return data
    } catch {
      return null
    }
  }

  // Extract potential cultivar name from search query
  // e.g., "Graham Thomas hybrid tea rose" with middle_level "Hybrid Tea Rose" -> "Graham Thomas"
  function extractCultivarFromQuery(searchQuery: string, plant: PlantSearchResult): string {
    const query = searchQuery.trim()
    const commonName = plant.common_name.toLowerCase()
    const middleLevel = plant.middle_level.toLowerCase()
    const topLevel = plant.top_level.toLowerCase()

    // Normalize the query for comparison
    const queryLower = query.toLowerCase()

    // If query exactly matches common_name or middle_level, no cultivar
    if (queryLower === commonName || queryLower === middleLevel) {
      return ''
    }

    // Try to find where the plant type name appears in the query
    // and extract what comes before it as the cultivar
    const patterns = [
      middleLevel,
      commonName,
      topLevel,
      // Also try without common suffixes
      middleLevel.replace(/ rose$/, ''),
      middleLevel.replace(/ tree$/, ''),
      middleLevel.replace(/ plant$/, ''),
    ].filter(p => p.length > 2)

    for (const pattern of patterns) {
      const index = queryLower.indexOf(pattern)
      if (index > 0) {
        // Extract what comes before the pattern
        const potential = query.substring(0, index).trim()
        // Clean up common connecting words
        const cleaned = potential
          .replace(/\s+(rose|tree|plant|flower|shrub)$/i, '')
          .replace(/\s*[-,]\s*$/, '')
          .trim()
        if (cleaned.length > 1) {
          return cleaned
        }
      }
    }

    // If no pattern match, check if query is longer and starts differently
    // This handles cases like "Graham Thomas" when common_name is "Hybrid Tea Rose"
    if (query.length > commonName.length && !queryLower.startsWith(commonName)) {
      // The query might be entirely the cultivar name if it doesn't match plant type at all
      const hasPlantTypeWord = [topLevel, middleLevel, commonName].some(
        name => queryLower.includes(name.split(' ')[0])
      )
      if (!hasPlantTypeWord) {
        // Query doesn't contain any plant type words, likely a cultivar name
        return query
      }
    }

    return ''
  }

  // Handle selection from plant search
  async function handlePlantSelect(plant: PlantSearchResult, searchQuery: string) {
    setSelectedPlant(plant)
    setUserInput(plant.common_name)
    setTopLevel(plant.top_level)
    setMiddleLevel(plant.middle_level)
    setGrowthHabit(plant.growth_habit)
    setUseExistingTypeId(null)

    // Try to extract cultivar name from the original search query
    const extractedCultivar = extractCultivarFromQuery(searchQuery, plant)
    setCultivarName(extractedCultivar)

    // Check for existing plants of this type
    const existing = await checkExistingType(plant.top_level, plant.middle_level)
    if (existing?.exists) {
      setExistingTypeInfo(existing)
      setStep('merge')
    } else {
      setStep('details')
    }
  }

  // Handle custom entry (plant not found in search)
  async function handleCustomEntry(query: string) {
    setUserInput(query)
    setSelectedPlant(null)
    setStep('identifying')
    setAiError(null)
    setUseExistingTypeId(null)

    try {
      const response = await fetch('/api/ai/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput: query }),
      })

      if (!response.ok) {
        throw new Error('Failed to identify plant')
      }

      const data: PlantIdentification = await response.json()
      setTopLevel(data.top_level)
      setMiddleLevel(data.middle_level)
      setCultivarName(data.cultivar_name || '')
      setGrowthHabit(data.growth_habit)

      // Check for existing plants of this type
      const existing = await checkExistingType(data.top_level, data.middle_level)
      if (existing?.exists) {
        setExistingTypeInfo(existing)
        setStep('merge')
      } else {
        setStep('details')
      }
    } catch {
      setAiError('Failed to identify plant. Please try again.')
      setStep('search')
    }
  }

  async function handleConfirmAndGenerate() {
    setStep('generating')
    setAiError(null)

    try {
      let plantTypeId = useExistingTypeId
      let careProfileCommonName: string | undefined
      let careProfileSpecies: string | undefined

      // Only generate care profile if we don't have an existing type to use
      if (!plantTypeId) {
        // Step 1: Generate the care profile for this plant type
        const typeResponse = await fetch('/api/ai/generate-type-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topLevel,
            middleLevel,
            growthHabit,
            area: area || undefined,
            planted_in: plantedIn || undefined,
          }),
        })

        if (!typeResponse.ok) {
          const data = await typeResponse.json()
          throw new Error(data.error || 'Failed to generate care profile')
        }

        const { plantType: generatedType, careProfile: generatedProfile } = await typeResponse.json()
        plantTypeId = generatedType?.id
        careProfileCommonName = generatedProfile?.common_name
        careProfileSpecies = generatedProfile?.species
      }

      // Step 2: Create the plant record linked to this plant type
      const plantResponse = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: careProfileCommonName || middleLevel || userInput,
          common_name: careProfileCommonName,
          species: careProfileSpecies,
          plant_type_id: plantTypeId,
          cultivar_name: cultivarName || undefined,
          area: area || undefined,
          planted_in: plantedIn || undefined,
          notes: notes || undefined,
        }),
      })

      if (!plantResponse.ok) {
        const data = await plantResponse.json()
        throw new Error(data.error || 'Failed to save plant')
      }

      const plant = await plantResponse.json()

      // Step 3: Upload pending image if exists and save URL to database
      if (pendingImage && imageUploadRef.current) {
        const imageUrl = await imageUploadRef.current.uploadPendingImage(plant.id)
        if (imageUrl) {
          await fetch(`/api/plants/${plant.id}/image`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ photo_url: imageUrl }),
          })
        }
      }

      // Navigate with success param to trigger toast on plants page
      router.push('/plants?added=' + encodeURIComponent(cultivarName || middleLevel || userInput))
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      setAiError(err instanceof Error ? err.message : 'Failed to save plant. Please try again.')
      setStep('details') // Go back to details step so user can retry
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Link
        href="/plants"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="CaretLeft" size={16} weight="light" className="w-4 h-4" ariaLabel="back" />
        Back to plants
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-4xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Add a Plant
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Tell us what you&apos;re growing and we&apos;ll create a personalised care schedule
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {[
          { key: 'search', label: 'Find' },
          { key: 'details', label: 'Details' },
          { key: 'generating', label: 'Create' },
        ].map((s, i) => {
          const stepOrder = ['search', 'identifying', 'merge', 'details', 'generating', 'review']
          const currentIndex = stepOrder.indexOf(step)
          const stepIndex = stepOrder.indexOf(s.key)
          const isActive = currentIndex >= stepIndex

          return (
            <div key={s.key} className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{
                  background: isActive ? 'var(--sage-600)' : 'var(--stone-200)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className="w-12 h-0.5 mx-2"
                  style={{
                    background: currentIndex > stepIndex ? 'var(--sage-600)' : 'var(--stone-200)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-lg"
            style={{
              background: 'rgba(199, 81, 70, 0.1)',
              border: '1px solid rgba(199, 81, 70, 0.2)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {aiError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Search */}
        {step === 'search' && (
          <motion.div
            key="search"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="rounded-2xl p-8"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="space-y-6">
              <div>
                <label className="label">
                  What are you growing? *
                </label>
                <PlantSearchInput
                  onSelect={(plant, searchQuery) => handlePlantSelect(plant, searchQuery)}
                  onCustomEntry={handleCustomEntry}
                  placeholder="Search for a plant, e.g., Climbing Rose, Lavender, Tomato..."
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Identifying */}
        {step === 'identifying' && (
          <motion.div
            key="identifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--sage-100)' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <SpinningLeafLoader size="lg" />
              </div>
            </div>

            <h2
              className="text-2xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Identifying your plant
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Analyzing &quot;{userInput}&quot;...
            </p>
          </motion.div>
        )}

        {/* Step 2.5: Merge Prompt */}
        {step === 'merge' && existingTypeInfo && (
          <motion.div
            key="merge"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <MergePrompt
              plantTypeName={middleLevel || topLevel}
              existingCultivars={existingTypeInfo.existingCultivars || []}
              onAddToExisting={() => {
                setUseExistingTypeId(existingTypeInfo.plantTypeId || null)
                setStep('details')
              }}
              onCreateSeparate={() => {
                setUseExistingTypeId(null)
                setStep('details')
              }}
            />
          </motion.div>
        )}

        {/* Step 3: Details */}
        {step === 'details' && (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Selected plant card */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="flex items-start gap-4">
                {/* Plant image or icon */}
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden"
                  style={{ background: 'var(--sage-100)' }}
                >
                  {selectedPlant?.image_url ? (
                    <Image
                      src={selectedPlant.image_url}
                      alt={selectedPlant.common_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <Icon name="Seedling" size={28} weight="light" style={{ color: 'var(--sage-600)' }} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2
                      className="text-xl font-semibold truncate"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        color: 'var(--text-primary)',
                      }}
                    >
                      {middleLevel || userInput}
                    </h2>
                    {selectedPlant?.source === 'ai' && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: 'var(--earth-100)', color: 'var(--earth-700)' }}
                      >
                        AI identified
                      </span>
                    )}
                  </div>
                  {topLevel && topLevel !== middleLevel && (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {topLevel}
                    </p>
                  )}
                  {growthHabit.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {growthHabit.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: 'var(--sage-50)', color: 'var(--sage-700)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlant(null)
                    setStep('search')
                  }}
                  className="btn-icon btn-icon-secondary btn-icon-sm"
                  aria-label="Change plant"
                >
                  <Icon name="PencilSimple" size={16} weight="regular" />
                </button>
              </div>
            </div>

            {/* Additional details form */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h3
                className="text-lg font-semibold mb-6"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                Add details
              </h3>

              <div className="space-y-6">
                <div>
                  <label htmlFor="cultivarName" className="label">
                    Variety/Cultivar name (optional)
                  </label>
                  <input
                    id="cultivarName"
                    type="text"
                    value={cultivarName}
                    onChange={(e) => setCultivarName(e.target.value)}
                    className="input"
                    placeholder="e.g., Iceberg, Graham Thomas, Sungold"
                  />
                  <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                    The specific variety name if you know it
                  </p>
                </div>

                <div>
                  <label htmlFor="area" className="label">
                    Where is it? (optional)
                  </label>
                  <input
                    id="area"
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="input"
                    placeholder="e.g., Front garden, Back border, Patio"
                  />
                </div>

                <div>
                  <label className="label">
                    Planted in (optional)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'ground', label: 'Ground', iconName: 'Mountains' },
                      { value: 'pot', label: 'Pot', iconName: 'Flower' },
                      { value: 'raised_bed', label: 'Raised bed', iconName: 'Stack' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPlantedIn(plantedIn === option.value ? '' : option.value as typeof plantedIn)}
                        className="p-4 rounded-xl border-2 transition-all text-center"
                        style={{
                          borderColor: plantedIn === option.value ? 'var(--sage-500)' : 'var(--stone-200)',
                          background: plantedIn === option.value ? 'var(--sage-50)' : 'white',
                          color: plantedIn === option.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="mb-2 flex justify-center">
                          <Icon
                            name={option.iconName}
                            size={24}
                            weight="light"
                            style={{ color: plantedIn === option.value ? 'var(--sage-600)' : 'var(--text-muted)' }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="label">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input min-h-[100px] resize-none"
                    placeholder="e.g., Planted last spring, gift from mum"
                  />
                </div>

                {userId && (
                  <ImageUpload
                    ref={imageUploadRef}
                    userId={userId}
                    onPendingImageChange={setPendingImage}
                  />
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlant(null)
                    setStep('search')
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAndGenerate}
                  className="btn btn-primary flex-1"
                >
                  Add plant
                  <Icon name="ArrowRight" size={18} weight="light" className="w-5 h-5" ariaLabel="add" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Generating Care Profile */}
        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="relative w-28 h-28 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--sage-100)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <GrowingPlantLoader size="lg" />
              </div>
            </div>

            <h2
              className="text-2xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Creating your care profile
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Generating UK-specific care advice for {middleLevel}...
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  )
}
