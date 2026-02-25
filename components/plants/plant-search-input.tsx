'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Icon from '@/components/ui/icon'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import type { PlantSearchResult } from '@/types/database'

interface PlantSearchInputProps {
  onSelect: (plant: PlantSearchResult, searchQuery: string) => void
  onCustomEntry: (query: string) => void
  placeholder?: string
  initialValue?: string
}

interface SearchState {
  results: PlantSearchResult[]
  isLoading: boolean
  error: string | null
  source: 'perenual' | 'ai' | 'ai_verified' | 'web_discovery' | null
  message?: string
  suggestion?: {
    original: string
    corrected: string
  }
}

function VerificationBadge({ plant }: { plant: PlantSearchResult }) {
  if (!plant.verification) return null

  const { status, confidence, source_url } = plant.verification

  if (status === 'database') {
    return (
      <span
        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
        style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}
        title="Found in plant database"
      >
        <Icon name="Database" size={10} weight="fill" />
      </span>
    )
  }

  if (status === 'web_verified') {
    return (
      <a
        href={source_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded transition-colors hover:opacity-80"
        style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}
        title={source_url ? `Verified via ${new URL(source_url).hostname}` : 'Web verified'}
      >
        <Icon name="CheckCircle" size={10} weight="fill" />
        <span>Verified</span>
      </a>
    )
  }

  if (status === 'ai_identified') {
    return (
      <span
        className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded"
        style={{
          background: confidence === 'high' ? 'var(--sage-100)' : 'var(--earth-100)',
          color: confidence === 'high' ? 'var(--sage-700)' : 'var(--earth-700)',
        }}
        title={confidence === 'high' ? 'AI identified with high confidence' : 'AI identified'}
      >
        <Icon name="Sparkle" size={10} weight="fill" />
        <span>{confidence === 'high' ? 'Identified' : 'Likely'}</span>
      </span>
    )
  }

  return null
}

export default function PlantSearchInput({
  onSelect,
  onCustomEntry,
  placeholder = 'Search for a plant...',
  initialValue = '',
}: PlantSearchInputProps) {
  const [query, setQuery] = useState(initialValue)
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const [searchState, setSearchState] = useState<SearchState>({
    results: [],
    isLoading: false,
    error: null,
    source: null,
  })

  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  // Search function with debouncing and request cancellation
  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSearchState({ results: [], isLoading: false, error: null, source: null })
      return
    }

    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller and increment request ID
    abortControllerRef.current = new AbortController()
    const currentRequestId = ++requestIdRef.current

    setSearchState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await fetch(`/api/plants/search?q=${encodeURIComponent(searchQuery)}`, {
        signal: abortControllerRef.current.signal,
      })

      // Ignore response if a newer request has been made
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()

      // Double-check we're still the current request before updating state
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      setSearchState({
        results: data.results || [],
        isLoading: false,
        error: null,
        source: data.source,
        message: data.message,
        suggestion: data.suggestion,
      })
      setIsOpen(true)
      setFocusedIndex(-1)
    } catch (error) {
      // Ignore abort errors - they're expected when cancelling requests
      if (error instanceof Error && error.name === 'AbortError') {
        return
      }

      // Only update error state if this is still the current request
      if (currentRequestId !== requestIdRef.current) {
        return
      }

      setSearchState({
        results: [],
        isLoading: false,
        error: 'Failed to search. Please try again.',
        source: null,
      })
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => {
        performSearch(query)
      }, 300)
    } else {
      setSearchState({ results: [], isLoading: false, error: null, source: null })
      setIsOpen(false)
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, performSearch])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalItems = searchState.results.length + (query.length >= 2 ? 1 : 0) // +1 for custom entry option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => (prev < totalItems - 1 ? prev + 1 : 0))
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => (prev > 0 ? prev - 1 : totalItems - 1))
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0) {
          if (focusedIndex < searchState.results.length) {
            handleSelect(searchState.results[focusedIndex])
          } else {
            handleCustomEntry()
          }
        } else if (searchState.results.length > 0) {
          handleSelect(searchState.results[0])
        } else if (query.length >= 2) {
          handleCustomEntry()
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleSelect = (plant: PlantSearchResult) => {
    const searchQuery = query // Capture current query before updating
    setQuery(plant.common_name)
    setIsOpen(false)
    onSelect(plant, searchQuery)
  }

  const handleCustomEntry = () => {
    setIsOpen(false)
    onCustomEntry(query)
  }

  const showCustomEntry = query.length >= 2 && !searchState.isLoading
  const hasResults = searchState.results.length > 0
  const showEmptyState = !hasResults && showCustomEntry && !searchState.error

  return (
    <div ref={containerRef} className="relative">
      {/* Search Input */}
      <div className="relative">
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        >
          {searchState.isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Icon name="CircleNotch" size={20} weight="regular" />
            </motion.div>
          ) : (
            <Icon name="MagnifyingGlass" size={20} weight="light" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="input pr-4"
          style={{
            fontSize: '16px',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingLeft: '48px',
          }}
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setSearchState({ results: [], isLoading: false, error: null, source: null })
              setIsOpen(false)
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Clear search"
          >
            <Icon name="X" size={16} weight="regular" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (hasResults || showCustomEntry || searchState.error) && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 left-0 right-0 mt-2 rounded-xl overflow-hidden"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--stone-200)',
              maxHeight: '400px',
              overflowY: 'auto',
            }}
          >
            {/* Error state */}
            {searchState.error && (
              <div className="p-4 text-center" style={{ color: 'var(--error)' }}>
                <Icon name="Warning" size={24} className="mx-auto mb-2" />
                <p className="text-sm">{searchState.error}</p>
              </div>
            )}

            {/* Results list */}
            {hasResults && (
              <div className="py-2">
                {/* Source indicator for AI results */}
                {(searchState.source === 'ai' || searchState.source === 'ai_verified') && (
                  <div
                    className="px-4 py-2 text-xs flex items-center gap-2"
                    style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--stone-100)' }}
                  >
                    <Icon name="Sparkle" size={12} weight="fill" style={{ color: 'var(--sage-500)' }} />
                    {searchState.source === 'ai_verified' ? 'Verified match' : 'AI-identified result'}
                  </div>
                )}

                {searchState.results.map((plant, index) => (
                  <button
                    key={`${plant.source}-${index}-${plant.common_name}`}
                    type="button"
                    onClick={() => handleSelect(plant)}
                    onMouseEnter={() => setFocusedIndex(index)}
                    className="w-full px-4 py-3 flex items-center gap-4 text-left transition-colors"
                    style={{
                      background: focusedIndex === index ? 'var(--sage-50)' : 'transparent',
                    }}
                  >
                    {/* Plant image or icon */}
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden"
                      style={{ background: 'var(--stone-100)' }}
                    >
                      {plant.image_url ? (
                        <Image
                          src={plant.image_url}
                          alt={plant.common_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized // External images from Perenual
                        />
                      ) : (
                        getPlantTypeIcon(plant.top_level, 'w-6 h-6', { color: 'var(--sage-600)' })
                      )}
                    </div>

                    {/* Plant info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="font-medium truncate"
                          style={{
                            fontFamily: 'var(--font-cormorant)',
                            color: 'var(--text-primary)',
                            fontSize: '17px',
                          }}
                        >
                          {plant.common_name}
                        </span>
                        {plant.top_level !== plant.common_name && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{
                              background: 'var(--sage-100)',
                              color: 'var(--sage-700)',
                            }}
                          >
                            {plant.top_level}
                          </span>
                        )}
                        <VerificationBadge plant={plant} />
                      </div>
                      {plant.scientific_name && (
                        <p
                          className="text-sm italic truncate"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {plant.scientific_name}
                        </p>
                      )}
                      {/* Care hints */}
                      <div className="flex items-center gap-3 mt-1">
                        {plant.sunlight.length > 0 && (
                          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <Icon name="Sun" size={12} weight="fill" style={{ color: 'var(--earth-400)' }} />
                            {plant.sunlight[0]}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                          <Icon name="Drop" size={12} weight="fill" style={{ color: 'var(--sage-400)' }} />
                          {plant.watering}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {plant.cycle}
                        </span>
                      </div>
                    </div>

                    {/* Selection indicator */}
                    <div
                      className="flex-shrink-0 opacity-0 transition-opacity"
                      style={{ opacity: focusedIndex === index ? 1 : 0, color: 'var(--sage-500)' }}
                    >
                      <Icon name="ArrowRight" size={18} weight="regular" />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Empty state with prominent custom entry */}
            {showEmptyState && (
              <div className="p-4">
                {/* Spelling suggestion */}
                {searchState.suggestion && (
                  <button
                    type="button"
                    onClick={() => setQuery(searchState.suggestion!.corrected)}
                    className="w-full mb-3 p-3 rounded-lg text-left transition-colors hover:opacity-90"
                    style={{ background: 'var(--sage-50)', border: '1px solid var(--sage-200)' }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon name="Lightbulb" size={18} weight="fill" style={{ color: 'var(--sage-600)' }} />
                      <span style={{ color: 'var(--text-muted)' }}>Did you mean </span>
                      <span style={{ color: 'var(--sage-700)', fontWeight: 600 }}>
                        {searchState.suggestion.corrected}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>?</span>
                    </div>
                  </button>
                )}

                <div
                  className="rounded-lg p-4 mb-3"
                  style={{ background: 'var(--stone-50)', border: '1px dashed var(--stone-200)' }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--stone-100)' }}
                    >
                      <Icon name="MagnifyingGlass" size={20} weight="light" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                        No exact match found
                      </p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        We couldn&apos;t find &quot;{query}&quot; in our database. You can add it as a custom plant and we&apos;ll identify it for you.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Custom entry button - more prominent */}
                <button
                  type="button"
                  onClick={handleCustomEntry}
                  onMouseEnter={() => setFocusedIndex(searchState.results.length)}
                  className="w-full px-4 py-4 flex items-center gap-4 text-left transition-all rounded-lg"
                  style={{
                    background: focusedIndex === searchState.results.length ? 'var(--sage-100)' : 'var(--sage-50)',
                    border: '1px solid var(--sage-200)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--sage-200)' }}
                  >
                    <Icon name="Plus" size={24} weight="bold" style={{ color: 'var(--sage-700)' }} />
                  </div>
                  <div className="flex-1">
                    <span
                      className="font-medium"
                      style={{
                        fontFamily: 'var(--font-cormorant)',
                        color: 'var(--sage-800)',
                        fontSize: '17px',
                      }}
                    >
                      Add &quot;{query}&quot; as custom plant
                    </span>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--sage-600)' }}>
                      We&apos;ll identify it and create a care profile for you
                    </p>
                  </div>
                  <div
                    className="flex-shrink-0 transition-transform"
                    style={{
                      color: 'var(--sage-600)',
                      transform: focusedIndex === searchState.results.length ? 'translateX(2px)' : 'translateX(0)',
                    }}
                  >
                    <Icon name="ArrowRight" size={20} weight="bold" />
                  </div>
                </button>
              </div>
            )}

            {/* Custom entry option when there ARE results */}
            {hasResults && showCustomEntry && (
              <button
                type="button"
                onClick={handleCustomEntry}
                onMouseEnter={() => setFocusedIndex(searchState.results.length)}
                className="w-full px-4 py-3 flex items-center gap-4 text-left transition-colors"
                style={{
                  background: focusedIndex === searchState.results.length ? 'var(--earth-50)' : 'transparent',
                  borderTop: '1px solid var(--stone-100)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--earth-100)' }}
                >
                  <Icon name="Plus" size={24} weight="regular" style={{ color: 'var(--earth-600)' }} />
                </div>
                <div className="flex-1">
                  <span
                    className="font-medium"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      color: 'var(--text-primary)',
                      fontSize: '16px',
                    }}
                  >
                    Add &quot;{query}&quot; as custom plant
                  </span>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Not what you&apos;re looking for? We&apos;ll identify it for you.
                  </p>
                </div>
                <div
                  className="flex-shrink-0 opacity-0 transition-opacity"
                  style={{ opacity: focusedIndex === searchState.results.length ? 1 : 0, color: 'var(--earth-500)' }}
                >
                  <Icon name="ArrowRight" size={18} weight="regular" />
                </div>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Helper text */}
      <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
        Type at least 2 characters to search for plants
      </p>
    </div>
  )
}
