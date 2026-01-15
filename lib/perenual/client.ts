// lib/perenual/client.ts
// Perenual API client with caching for plant search

import type { PlantSearchResult } from '@/types/database'

const PERENUAL_API_BASE = 'https://perenual.com/api'
const PERENUAL_API_KEY = process.env.PERENUAL_API_KEY || ''

// Simple in-memory cache for search results
const searchCache = new Map<string, { data: PlantSearchResult[]; timestamp: number }>()
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

interface PerenualPlant {
  id: number
  common_name: string
  scientific_name: string[]
  other_name: string[] | null
  cycle: string
  watering: string
  sunlight: string[]
  default_image: {
    license: number
    license_name: string
    license_url: string
    original_url: string
    regular_url: string
    medium_url: string
    small_url: string
    thumbnail: string
  } | null
}

interface PerenualSearchResponse {
  data: PerenualPlant[]
  to: number
  per_page: number
  current_page: number
  from: number
  last_page: number
  total: number
}

/**
 * Derives top_level and middle_level from Perenual plant data
 * Maps common plant names to our taxonomy structure
 */
function deriveTaxonomy(plant: PerenualPlant): { top_level: string; middle_level: string } {
  const commonName = plant.common_name.toLowerCase()
  const scientificName = plant.scientific_name[0]?.toLowerCase() || ''

  // Common plant family mappings for UK gardens
  const mappings: { patterns: RegExp[]; top_level: string }[] = [
    { patterns: [/\brose\b/, /^rosa\b/], top_level: 'Rose' },
    { patterns: [/\bhydrangea\b/], top_level: 'Hydrangea' },
    { patterns: [/\blavender\b/, /^lavandula\b/], top_level: 'Lavender' },
    { patterns: [/\bdahlia\b/], top_level: 'Dahlia' },
    { patterns: [/\bclematis\b/], top_level: 'Clematis' },
    { patterns: [/\bhosta\b/], top_level: 'Hosta' },
    { patterns: [/\bfuchsia\b/], top_level: 'Fuchsia' },
    { patterns: [/\bgeranium\b/, /\bpelargonium\b/], top_level: 'Geranium' },
    { patterns: [/\btomato\b/, /^solanum lycopersicum/], top_level: 'Tomato' },
    { patterns: [/\bpepper\b/, /\bcapsicum\b/], top_level: 'Pepper' },
    { patterns: [/\bcucumber\b/, /^cucumis sativus/], top_level: 'Cucumber' },
    { patterns: [/\bcourgette\b/, /\bzucchini\b/, /^cucurbita pepo/], top_level: 'Courgette' },
    { patterns: [/\bbean\b/, /^phaseolus\b/], top_level: 'Bean' },
    { patterns: [/\bpea\b/, /^pisum\b/], top_level: 'Pea' },
    { patterns: [/\blettuce\b/, /^lactuca\b/], top_level: 'Lettuce' },
    { patterns: [/\bcarrot\b/, /^daucus\b/], top_level: 'Carrot' },
    { patterns: [/\bonion\b/, /^allium cepa/], top_level: 'Onion' },
    { patterns: [/\bgarlic\b/, /^allium sativum/], top_level: 'Garlic' },
    { patterns: [/\bpotato\b/, /^solanum tuberosum/], top_level: 'Potato' },
    { patterns: [/\bstrawberry\b/, /^fragaria\b/], top_level: 'Strawberry' },
    { patterns: [/\braspberry\b/, /^rubus idaeus/], top_level: 'Raspberry' },
    { patterns: [/\bblueberry\b/, /^vaccinium\b/], top_level: 'Blueberry' },
    { patterns: [/\bapple\b/, /^malus domestica/], top_level: 'Apple' },
    { patterns: [/\bpear\b/, /^pyrus\b/], top_level: 'Pear' },
    { patterns: [/\bplum\b/, /^prunus domestica/], top_level: 'Plum' },
    { patterns: [/\bcherry\b/, /^prunus avium/, /^prunus cerasus/], top_level: 'Cherry' },
    { patterns: [/\bpeony\b/, /^paeonia\b/], top_level: 'Peony' },
    { patterns: [/\biris\b/], top_level: 'Iris' },
    { patterns: [/\btulip\b/, /^tulipa\b/], top_level: 'Tulip' },
    { patterns: [/\bdaffodil\b/, /\bnarcissus\b/], top_level: 'Daffodil' },
    { patterns: [/\bcrocus\b/], top_level: 'Crocus' },
    { patterns: [/\bsnowdrop\b/, /^galanthus\b/], top_level: 'Snowdrop' },
    { patterns: [/\ballium\b/], top_level: 'Allium' },
    { patterns: [/\blily\b/, /^lilium\b/], top_level: 'Lily' },
    { patterns: [/\bfern\b/], top_level: 'Fern' },
    { patterns: [/\bboxwood\b/, /\bbox\b/, /^buxus\b/], top_level: 'Box' },
    { patterns: [/\bprivet\b/, /^ligustrum\b/], top_level: 'Privet' },
    { patterns: [/\bheather\b/, /^calluna\b/, /^erica\b/], top_level: 'Heather' },
    { patterns: [/\bazalea\b/, /\brhododendron\b/], top_level: 'Rhododendron' },
    { patterns: [/\bcamellia\b/], top_level: 'Camellia' },
    { patterns: [/\bmagnolia\b/], top_level: 'Magnolia' },
    { patterns: [/\bwisteria\b/], top_level: 'Wisteria' },
    { patterns: [/\bjasmine\b/, /^jasminum\b/], top_level: 'Jasmine' },
    { patterns: [/\bhoneysuckle\b/, /^lonicera\b/], top_level: 'Honeysuckle' },
    { patterns: [/\bsunflower\b/, /^helianthus\b/], top_level: 'Sunflower' },
    { patterns: [/\bcosmos\b/], top_level: 'Cosmos' },
    { patterns: [/\bmarigold\b/, /^tagetes\b/], top_level: 'Marigold' },
    { patterns: [/\bpetunia\b/], top_level: 'Petunia' },
    { patterns: [/\bbegonia\b/], top_level: 'Begonia' },
    { patterns: [/\bimpatiens\b/, /\bbusy lizzie\b/], top_level: 'Impatiens' },
    { patterns: [/\bpansy\b/, /^viola\b/], top_level: 'Pansy' },
    { patterns: [/\bsweet pea\b/, /^lathyrus\b/], top_level: 'Sweet Pea' },
    { patterns: [/\bdelphinium\b/], top_level: 'Delphinium' },
    { patterns: [/\blupine?\b/, /^lupinus\b/], top_level: 'Lupin' },
    { patterns: [/\bfoxglove\b/, /^digitalis\b/], top_level: 'Foxglove' },
    { patterns: [/\bhollyhock\b/, /^alcea\b/], top_level: 'Hollyhock' },
    { patterns: [/\bechinacea\b/, /\bconeflower\b/], top_level: 'Echinacea' },
    { patterns: [/\bsedum\b/, /\bstonecrop\b/], top_level: 'Sedum' },
    { patterns: [/\bsalvia\b/, /\bsage\b/], top_level: 'Salvia' },
    { patterns: [/\brosemary\b/, /^salvia rosmarinus/], top_level: 'Rosemary' },
    { patterns: [/\bthyme\b/, /^thymus\b/], top_level: 'Thyme' },
    { patterns: [/\bmint\b/, /^mentha\b/], top_level: 'Mint' },
    { patterns: [/\bbasil\b/, /^ocimum\b/], top_level: 'Basil' },
    { patterns: [/\bparsley\b/, /^petroselinum\b/], top_level: 'Parsley' },
    { patterns: [/\bcoriander\b/, /\bcilantro\b/, /^coriandrum\b/], top_level: 'Coriander' },
    { patterns: [/\bchive\b/, /^allium schoenoprasum/], top_level: 'Chives' },
  ]

  // Find matching top_level
  let top_level = 'Plant' // Default fallback
  for (const mapping of mappings) {
    if (mapping.patterns.some(p => p.test(commonName) || p.test(scientificName))) {
      top_level = mapping.top_level
      break
    }
  }

  // Use the common name as middle_level, properly capitalized
  const middle_level = plant.common_name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')

  return { top_level, middle_level }
}

/**
 * Derives growth habit from Perenual plant data
 */
function deriveGrowthHabit(plant: PerenualPlant): string[] {
  const habits: string[] = []

  // Map cycle to growth habit
  if (plant.cycle) {
    const cycle = plant.cycle.toLowerCase()
    if (cycle.includes('perennial')) habits.push('Perennial')
    else if (cycle.includes('annual')) habits.push('Annual')
    else if (cycle.includes('biennial')) habits.push('Biennial')
  }

  // Add watering preference as a characteristic
  if (plant.watering) {
    const watering = plant.watering.toLowerCase()
    if (watering === 'minimum' || watering === 'none') habits.push('Drought-tolerant')
  }

  // Check common name for growth form hints
  const commonName = plant.common_name.toLowerCase()
  if (commonName.includes('climbing') || commonName.includes('climber')) habits.push('Climber')
  if (commonName.includes('bush') || commonName.includes('shrub')) habits.push('Shrub')
  if (commonName.includes('tree')) habits.push('Tree')
  if (commonName.includes('ground cover') || commonName.includes('groundcover')) habits.push('Ground Cover')
  if (commonName.includes('dwarf') || commonName.includes('compact')) habits.push('Compact')

  return habits
}

/**
 * Transform Perenual API response to our PlantSearchResult format
 */
function transformToSearchResult(plant: PerenualPlant): PlantSearchResult {
  const { top_level, middle_level } = deriveTaxonomy(plant)

  return {
    id: plant.id,
    common_name: plant.common_name,
    scientific_name: plant.scientific_name[0] || null,
    image_url: plant.default_image?.thumbnail || plant.default_image?.small_url || null,
    top_level,
    middle_level,
    cycle: plant.cycle || 'Unknown',
    watering: plant.watering || 'Average',
    sunlight: plant.sunlight || [],
    growth_habit: deriveGrowthHabit(plant),
    source: 'perenual',
  }
}

/**
 * Search for plants using the Perenual API
 * Returns cached results if available and not expired
 */
export async function searchPlants(query: string): Promise<PlantSearchResult[]> {
  const normalizedQuery = query.toLowerCase().trim()

  // Check cache first
  const cached = searchCache.get(normalizedQuery)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }

  // If no API key, return empty (will trigger AI fallback)
  if (!PERENUAL_API_KEY) {
    console.warn('PERENUAL_API_KEY not set, search will return empty results')
    return []
  }

  try {
    const url = new URL(`${PERENUAL_API_BASE}/species-list`)
    url.searchParams.set('key', PERENUAL_API_KEY)
    url.searchParams.set('q', normalizedQuery)

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    })

    if (response.status === 429) {
      // Rate limited - return empty to trigger AI fallback
      console.warn('Perenual API rate limited')
      return []
    }

    if (!response.ok) {
      console.error(`Perenual API error: ${response.status}`)
      return []
    }

    const data: PerenualSearchResponse = await response.json()
    const results = data.data.map(transformToSearchResult)

    // Cache the results
    searchCache.set(normalizedQuery, {
      data: results,
      timestamp: Date.now(),
    })

    return results
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      console.warn('Perenual API timeout')
    } else {
      console.error('Perenual API error:', error)
    }
    return []
  }
}

/**
 * Clear the search cache (useful for testing or manual refresh)
 */
export function clearSearchCache(): void {
  searchCache.clear()
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: searchCache.size,
    keys: Array.from(searchCache.keys()),
  }
}
