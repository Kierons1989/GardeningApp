import { createHash } from 'crypto'

/**
 * Generates a cache key for plant care profiles
 *
 * @param plantName - Plant type (e.g., "Hybrid Tea Rose", not cultivar "Peace Rose")
 * @param plantedIn - Where planted: 'ground', 'pot', or 'raised_bed'
 * @param climateZone - UK USDA hardiness zone (7-10), or null for generic UK
 * @param version - Cache schema version (increment to invalidate old caches)
 * @returns SHA-256 hash used as cache key
 *
 * @example
 * generateCacheKey("Tomato", "pot", null, 1)
 * // Returns: "a3f2b9c..."
 *
 * generateCacheKey("Tomato", "pot", 9, 2)
 * // Returns different hash (different version/zone)
 */
export function generateCacheKey(
  plantName: string,
  plantedIn: string | null,
  climateZone: number | null = null,
  version: number = 1
): string {
  // Normalize plant name for consistent caching
  const normalized = plantName.toLowerCase().trim()

  // Build cache key components
  const components = [
    normalized,
    plantedIn || 'unspecified',
    climateZone ? `zone-${climateZone}` : 'zone-8-default',
    `v${version}`
  ]

  // Generate deterministic hash
  return createHash('sha256')
    .update(components.join('|'))
    .digest('hex')
}

/**
 * Normalizes plant names to improve cache hit rates
 * Strips cultivar names and maps common variations to standard types
 *
 * @param plantName - User-provided plant name
 * @returns Normalized plant type name
 *
 * @example
 * normalizePlantName("Sungold Cherry Tomato")
 * // Returns: "Cherry Tomato"
 *
 * normalizePlantName("David Austin Rose 'Gertrude Jekyll'")
 * // Returns: "David Austin Rose"
 *
 * normalizePlantName("English Lavender")
 * // Returns: "Lavender"
 */
export function normalizePlantName(plantName: string): string {
  const name = plantName.trim()

  // Remove quoted cultivar names (e.g., 'Gertrude Jekyll')
  const withoutQuotes = name.replace(/['"][^'"]*['"]/g, '').trim()

  // Common mappings for better cache hits
  const mappings: Record<string, string> = {
    // Tomato varieties → types
    'sungold tomato': 'Cherry Tomato',
    'beefsteak tomato': 'Tomato',
    'cherry tomato': 'Cherry Tomato',
    'plum tomato': 'Tomato',

    // Rose types (keep general types as-is)
    'hybrid tea rose': 'Hybrid Tea Rose',
    'climbing rose': 'Climbing Rose',
    'shrub rose': 'Shrub Rose',
    'floribunda rose': 'Floribunda Rose',
    'david austin rose': 'David Austin Rose',

    // Lavender varieties → Lavender
    'english lavender': 'Lavender',
    'french lavender': 'French Lavender',

    // General cleanup patterns
    'english': '',  // Remove generic qualifiers
    'dwarf': '',
    'compact': '',
  }

  // Check for exact matches first
  const lowerName = withoutQuotes.toLowerCase()
  if (mappings[lowerName]) {
    return mappings[lowerName]
  }

  // Return cleaned name
  return withoutQuotes
}

/**
 * Cache version constant - increment when cache schema changes
 * Current version: 1 (no climate zones)
 * Future version: 2 (with climate zones)
 */
export const CURRENT_CACHE_VERSION = 1

/**
 * Default UK climate zone (Zone 8 covers most of England/Wales)
 * Used when no user location is specified
 */
export const DEFAULT_UK_ZONE = 8
