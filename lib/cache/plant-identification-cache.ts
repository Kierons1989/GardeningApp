/**
 * In-memory cache for plant identification results
 * Reduces API costs by caching AI identification results
 */

import type { PlantVerificationResponse } from '@/lib/ai/prompts/plant-verification'

interface CacheEntry {
  result: PlantVerificationResponse
  timestamp: number
}

// Cache TTL: 24 hours (in milliseconds)
const CACHE_TTL = 24 * 60 * 60 * 1000

// Maximum cache size to prevent memory issues
const MAX_CACHE_SIZE = 1000

class PlantIdentificationCache {
  private cache: Map<string, CacheEntry> = new Map()

  private normalizeKey(query: string): string {
    return query.toLowerCase().trim()
  }

  get(query: string): PlantVerificationResponse | null {
    const key = this.normalizeKey(query)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.result
  }

  set(query: string, result: PlantVerificationResponse): void {
    const key = this.normalizeKey(query)

    // Evict oldest entries if cache is full
    if (this.cache.size >= MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }

    this.cache.set(key, {
      result,
      timestamp: Date.now(),
    })
  }

  // Clear expired entries (can be called periodically)
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_TTL) {
        this.cache.delete(key)
      }
    }
  }

  get size(): number {
    return this.cache.size
  }
}

// Singleton instance
export const plantIdentificationCache = new PlantIdentificationCache()
