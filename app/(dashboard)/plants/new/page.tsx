'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlantIdentification, PlantSearchResult, LocationType, LocationProtection } from '@/types/database'
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
  hasGenericEntry?: boolean
}

export default function NewPlantPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>('search')
  const [userId, setUserId] = useState<string | null>(null)
  const imageUploadRef = useRef<ImageUploadRef>(null)

  // Form state
  const [userInput, setUserInput] = useState('')
  const [locationType, setLocationType] = useState<LocationType | null>(null)
  const [locationCustom, setLocationCustom] = useState('')
  const [locationProtection, setLocationProtection] = useState<LocationProtection | null>(null)
  const [plantedIn, setPlantedIn] = useState<'ground' | 'pot' | 'raised_bed' | ''>('')
  const [notes, setNotes] = useState('')
  const [pendingImage, setPendingImage] = useState<Blob | null>(null)

  // Selected plant from search (if any)
  const [selectedPlant, setSelectedPlant] = useState<PlantSearchResult | null>(null)

  // Editable taxonomy (after identification/selection, user can edit)
  const [topLevel, setTopLevel] = useState('')
  const [middleLevel, setMiddleLevel] = useState('')
  const [cultivarName, setCultivarName] = useState('')
  const [cultivarFromSearch, setCultivarFromSearch] = useState(false) // Track if cultivar was pre-filled from search
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

  // Fallback function to upload image directly if ImageUpload component is unmounted
  async function uploadImageDirectly(blob: Blob, targetUserId: string, plantId: string): Promise<string | null> {
    try {
      const supabase = createClient()
      const timestamp = Date.now()
      const random = Math.random().toString(36).substring(2, 8)
      const extension = blob.type === 'image/webp' ? 'webp' : 'jpg'
      const filePath = `${targetUserId}/${plantId}/${timestamp}-${random}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('plant-images')
        .upload(filePath, blob, {
          contentType: blob.type,
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('plant-images')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (err) {
      console.error('Direct upload error:', err)
      return null
    }
  }

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
  // Handles various input patterns:
  // - "Mister Lincoln hybrid tea rose" -> "Mister Lincoln"
  // - "hybrid tea rose Mister Lincoln" -> "Mister Lincoln" (reversed)
  // - "Mister Lincoln" (just cultivar) -> "Mister Lincoln"
  // - "Graham Thomas rose" -> "Graham Thomas"
  function extractCultivarFromQuery(searchQuery: string, plant: PlantSearchResult): string {
    const query = searchQuery.trim()
    const queryLower = query.toLowerCase()

    const commonName = plant.common_name.toLowerCase()
    const middleLevel = plant.middle_level.toLowerCase()
    const topLevel = plant.top_level.toLowerCase()

    // If query exactly matches common_name or middle_level, no cultivar
    if (queryLower === commonName || queryLower === middleLevel || queryLower === topLevel) {
      return ''
    }

    // Common plant type suffixes that shouldn't be part of cultivar names
    const plantSuffixes = ['rose', 'roses', 'tree', 'trees', 'plant', 'plants', 'flower', 'flowers',
                          'shrub', 'shrubs', 'bush', 'bushes', 'vine', 'vines', 'herb', 'herbs',
                          'fern', 'ferns', 'palm', 'palms', 'grass', 'grasses', 'bulb', 'bulbs']

    // Build word-boundary-aware patterns from plant names
    // These are the plant type identifiers we want to separate from the cultivar
    const plantTypePatterns: string[] = []

    // Add full phrases first (more specific matches take priority)
    const baseNames = [middleLevel, commonName, topLevel]
    for (const name of baseNames) {
      if (name.length >= 3) {
        plantTypePatterns.push(name)
      }
      // Add version without trailing suffix
      for (const suffix of plantSuffixes) {
        const withoutSuffix = name.replace(new RegExp(`\\s+${suffix}s?$`, 'i'), '').trim()
        if (withoutSuffix !== name && withoutSuffix.length >= 3) {
          plantTypePatterns.push(withoutSuffix)
        }
      }
    }

    // Add individual significant words (3+ chars, not common suffixes)
    const significantWords: string[] = []
    for (const name of [middleLevel, commonName]) {
      for (const word of name.split(/\s+/)) {
        if (word.length >= 3 && !plantSuffixes.includes(word.toLowerCase())) {
          significantWords.push(word.toLowerCase())
        }
      }
    }

    // Helper: Find pattern at word boundary (not inside another word)
    function findAtWordBoundary(text: string, pattern: string): number {
      const regex = new RegExp(`(?:^|\\s)(${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?:\\s|$)`, 'i')
      const match = text.match(regex)
      if (match && match.index !== undefined) {
        // Return the start of the actual pattern (after any leading space)
        return match[0].startsWith(' ') ? match.index + 1 : match.index
      }
      return -1
    }

    // Helper: Clean extracted cultivar text
    function cleanCultivar(text: string): string {
      return text
        .replace(/^[\s,\-]+|[\s,\-]+$/g, '') // Trim punctuation and whitespace
        .replace(new RegExp(`\\s+(${plantSuffixes.join('|')})s?$`, 'i'), '') // Remove trailing plant words
        .trim()
    }

    // Strategy 1: Find plant type pattern and extract what's BEFORE it (cultivar first)
    // e.g., "Mister Lincoln hybrid tea rose" -> find "hybrid tea rose", extract "Mister Lincoln"
    for (const pattern of plantTypePatterns) {
      const index = findAtWordBoundary(queryLower, pattern.toLowerCase())
      if (index > 0) {
        const beforePattern = query.substring(0, index)
        const cleaned = cleanCultivar(beforePattern)
        if (cleaned.length >= 2) {
          return cleaned
        }
      }
    }

    // Strategy 2: Find plant type pattern and extract what's AFTER it (type first)
    // e.g., "hybrid tea rose Mister Lincoln" -> find "hybrid tea rose", extract "Mister Lincoln"
    for (const pattern of plantTypePatterns) {
      const index = findAtWordBoundary(queryLower, pattern.toLowerCase())
      if (index >= 0) {
        const afterPattern = query.substring(index + pattern.length)
        const cleaned = cleanCultivar(afterPattern)
        if (cleaned.length >= 2) {
          return cleaned
        }
      }
    }

    // Strategy 3: Try matching individual significant words at word boundaries
    // e.g., query has "climbing" from "Climbing Rose"
    for (const word of significantWords) {
      const index = findAtWordBoundary(queryLower, word)
      if (index > 0) {
        // Check if there's meaningful text before this word
        const beforeWord = query.substring(0, index)
        const cleaned = cleanCultivar(beforeWord)
        if (cleaned.length >= 2) {
          return cleaned
        }
      }
      if (index >= 0) {
        // Check if there's meaningful text after this word
        const afterWord = query.substring(index + word.length)
        const cleaned = cleanCultivar(afterWord)
        if (cleaned.length >= 2) {
          return cleaned
        }
      }
    }

    // Strategy 4: If query doesn't contain any plant type words at all,
    // it might be entirely a cultivar name (e.g., user searched just "Mister Lincoln")
    const allPlantWords = [...new Set([
      ...plantTypePatterns.flatMap(p => p.toLowerCase().split(/\s+/)),
      ...plantSuffixes
    ])]

    const queryWords = queryLower.split(/\s+/)
    const hasAnyPlantWord = queryWords.some(qWord =>
      allPlantWords.some(pWord => pWord.length >= 3 && qWord === pWord)
    )

    if (!hasAnyPlantWord && query.length >= 2) {
      // Query contains no plant type words - it's likely just the cultivar name
      return query
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

    // Use cultivar from search result if available, otherwise try to extract from query
    if (plant.cultivar_name) {
      setCultivarName(plant.cultivar_name)
      setCultivarFromSearch(true) // Mark as pre-filled from search
    } else {
      // Fallback: try to extract cultivar name from the original search query
      const extractedCultivar = extractCultivarFromQuery(searchQuery, plant)
      setCultivarName(extractedCultivar)
      setCultivarFromSearch(!!extractedCultivar) // Mark as pre-filled if extracted
    }

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
    setCultivarFromSearch(false)

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
        // Build area string for care profile context
        const locationLabels: Record<string, string> = {
          front_garden: 'Front garden',
          back_garden: 'Back garden',
          patio: 'Patio',
        }
        const areaForContext = locationType
          ? locationType === 'other'
            ? locationCustom || undefined
            : locationLabels[locationType]
          : undefined

        // Step 1: Generate the care profile for this plant type
        const typeResponse = await fetch('/api/ai/generate-type-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topLevel,
            middleLevel,
            growthHabit,
            area: areaForContext,
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
          location_type: locationType || undefined,
          location_custom: locationType === 'other' ? locationCustom || undefined : undefined,
          location_protection: locationProtection || undefined,
          planted_in: plantedIn || undefined,
          notes: notes || undefined,
          image_url: selectedPlant?.image_url || undefined,
        }),
      })

      if (!plantResponse.ok) {
        const data = await plantResponse.json()
        throw new Error(data.error || 'Failed to save plant')
      }

      const plant = await plantResponse.json()

      // Step 3: Upload pending image if exists and save URL to database
      if (pendingImage) {
        try {
          // Upload image to storage - pass the blob directly since component may have unmounted
          const imageUrl = imageUploadRef.current
            ? await imageUploadRef.current.uploadPendingImage(plant.id, pendingImage)
            : await uploadImageDirectly(pendingImage, userId!, plant.id)

          if (imageUrl) {
            const patchResponse = await fetch(`/api/plants/${plant.id}/image`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ photo_url: imageUrl }),
            })

            if (!patchResponse.ok) {
              console.error('Failed to save image URL to database')
              // Don't throw - plant was created successfully, just image didn't save
            }
          }
        } catch (imageErr) {
          console.error('Image upload error:', imageErr)
          // Don't throw - plant was created successfully, just image didn't upload
        }
      }

      // Invalidate the plants query so the list refreshes with the new plant
      await queryClient.invalidateQueries({ queryKey: ['plants'] })

      // Navigate with success param to trigger toast on plants page
      router.push('/plants?added=' + encodeURIComponent(cultivarName || middleLevel || userInput))
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
              hasGenericEntry={existingTypeInfo.hasGenericEntry || false}
              currentCultivarName={cultivarName}
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
                      {cultivarName || middleLevel || userInput}
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
                  {/* Show plant type as subtitle when we have a cultivar */}
                  {cultivarName && middleLevel && (
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {middleLevel}
                    </p>
                  )}
                  {/* Show top level only when no cultivar and top_level differs from middle_level */}
                  {!cultivarName && topLevel && topLevel !== middleLevel && (
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
                    setCultivarFromSearch(false)
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
                {cultivarFromSearch && cultivarName ? (
                  <div>
                    <label className="label">
                      Variety/Cultivar
                    </label>
                    <div
                      className="px-4 py-3 rounded-lg"
                      style={{
                        background: 'var(--sage-50)',
                        border: '1px solid var(--sage-200)',
                      }}
                    >
                      <span
                        className="font-medium"
                        style={{ color: 'var(--sage-700)' }}
                      >
                        {cultivarName}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                      Cultivar identified from your search
                    </p>
                  </div>
                ) : (
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
                )}

                <div>
                  <label className="label">
                    Where is it? (optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 'front_garden', label: 'Front garden', iconName: 'House' },
                      { value: 'back_garden', label: 'Back garden', iconName: 'Tree' },
                      { value: 'patio', label: 'Patio', iconName: 'GridFour' },
                      { value: 'other', label: 'Other', iconName: 'DotsThree' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocationType(locationType === option.value ? null : option.value as LocationType)}
                        className="p-4 rounded-xl border-2 transition-all text-center"
                        style={{
                          borderColor: locationType === option.value ? 'var(--sage-500)' : 'var(--stone-200)',
                          background: locationType === option.value ? 'var(--sage-50)' : 'white',
                          color: locationType === option.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="mb-2 flex justify-center">
                          <Icon
                            name={option.iconName}
                            size={24}
                            weight="light"
                            style={{ color: locationType === option.value ? 'var(--sage-600)' : 'var(--text-muted)' }}
                          />
                        </div>
                        <span className="text-sm font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                  {locationType === 'other' && (
                    <input
                      type="text"
                      value={locationCustom}
                      onChange={(e) => setLocationCustom(e.target.value)}
                      className="input mt-3"
                      placeholder="Enter custom location..."
                    />
                  )}
                </div>

                <div>
                  <label className="label">
                    Protected? (optional)
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'greenhouse', label: 'Greenhouse', iconName: 'Warehouse' },
                      { value: 'polytunnel', label: 'Polytunnel', iconName: 'Tent' },
                      { value: 'cold_frame', label: 'Cold frame', iconName: 'Package' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocationProtection(locationProtection === option.value ? null : option.value as LocationProtection)}
                        className="p-3 rounded-xl border-2 transition-all text-center"
                        style={{
                          borderColor: locationProtection === option.value ? 'var(--sage-500)' : 'var(--stone-200)',
                          background: locationProtection === option.value ? 'var(--sage-50)' : 'white',
                          color: locationProtection === option.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="mb-1.5 flex justify-center">
                          <Icon
                            name={option.iconName}
                            size={20}
                            weight="light"
                            style={{ color: locationProtection === option.value ? 'var(--sage-600)' : 'var(--text-muted)' }}
                          />
                        </div>
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
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
                    setCultivarFromSearch(false)
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
