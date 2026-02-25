import type { GrowthStage } from '@/types/database'

export interface InferredGrowthStage {
  stage: GrowthStage
  label: string
  explanation: string
}

type SeasonalPattern = {
  dormant: number[]    // months when typically dormant
  flowering: number[]  // months when typically flowering
  fruiting: number[]   // months when typically fruiting
}

// Seasonal patterns by plant category (UK-specific)
// Months are 1-indexed (1=Jan, 12=Dec)
const SEASONAL_PATTERNS: Record<string, SeasonalPattern> = {
  // Roses — dormant Nov–Feb, flowering Jun–Oct
  rose: {
    dormant: [11, 12, 1, 2],
    flowering: [6, 7, 8, 9, 10],
    fruiting: [],
  },
  // Deciduous trees — dormant Nov–Mar
  tree: {
    dormant: [11, 12, 1, 2, 3],
    flowering: [4, 5],
    fruiting: [8, 9, 10],
  },
  // Fruit trees
  fruit: {
    dormant: [11, 12, 1, 2],
    flowering: [3, 4, 5],
    fruiting: [7, 8, 9, 10],
  },
  // Perennials — dormant Dec–Feb, flowering varies
  perennial: {
    dormant: [12, 1, 2],
    flowering: [5, 6, 7, 8, 9],
    fruiting: [],
  },
  // Bulbs — dormant Jun–Sep (spring bulbs), flowering Feb–May
  bulb: {
    dormant: [6, 7, 8, 9],
    flowering: [2, 3, 4, 5],
    fruiting: [],
  },
  // Shrubs — dormant Dec–Feb
  shrub: {
    dormant: [12, 1, 2],
    flowering: [4, 5, 6, 7],
    fruiting: [8, 9, 10],
  },
  // Climbers
  climber: {
    dormant: [12, 1, 2],
    flowering: [5, 6, 7, 8, 9],
    fruiting: [],
  },
  // Herbs — most are dormant/dead in winter
  herb: {
    dormant: [11, 12, 1, 2],
    flowering: [6, 7, 8],
    fruiting: [],
  },
  // Vegetables — seasonal, mostly sown in spring
  vegetable: {
    dormant: [],
    flowering: [6, 7],
    fruiting: [7, 8, 9, 10],
  },
  // Annuals — typically sown in spring, no dormancy
  annual: {
    dormant: [],
    flowering: [6, 7, 8, 9],
    fruiting: [],
  },
  // Grasses — dormant in winter
  grass: {
    dormant: [12, 1, 2],
    flowering: [6, 7, 8],
    fruiting: [],
  },
}

// Middle-level keywords that help refine the pattern
const MIDDLE_LEVEL_OVERRIDES: Record<string, string> = {
  'hybrid tea rose': 'rose',
  'floribunda rose': 'rose',
  'climbing rose': 'rose',
  'shrub rose': 'rose',
  'rambling rose': 'rose',
  'david austin rose': 'rose',
  'english rose': 'rose',
  'groundcover rose': 'rose',
  'miniature rose': 'rose',
  'patio rose': 'rose',
  'spring bulb': 'bulb',
  'summer bulb': 'bulb',
  'autumn bulb': 'bulb',
  'fruit tree': 'fruit',
  'apple tree': 'fruit',
  'pear tree': 'fruit',
  'plum tree': 'fruit',
  'cherry tree': 'fruit',
  'tomato': 'vegetable',
  'courgette': 'vegetable',
  'bean': 'vegetable',
  'pea': 'vegetable',
  'potato': 'vegetable',
  'carrot': 'vegetable',
  'lavender': 'shrub',
  'hydrangea': 'shrub',
  'clematis': 'climber',
  'wisteria': 'climber',
  'jasmine': 'climber',
}

function getCategory(topLevel: string, middleLevel: string): string {
  const middleLower = middleLevel.toLowerCase()
  const topLower = topLevel.toLowerCase()

  // Check middle-level overrides first (most specific)
  for (const [key, category] of Object.entries(MIDDLE_LEVEL_OVERRIDES)) {
    if (middleLower.includes(key)) return category
  }

  // Check top-level category
  for (const category of Object.keys(SEASONAL_PATTERNS)) {
    if (topLower.includes(category) || middleLower.includes(category)) {
      return category
    }
  }

  // Default to perennial (most common garden plant)
  return 'perennial'
}

function getMonthName(month: number): string {
  const names = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return names[month - 1] || 'Unknown'
}

export function inferGrowthStage(
  topLevel: string,
  middleLevel: string,
  currentMonth?: number
): InferredGrowthStage {
  const month = currentMonth || (new Date().getMonth() + 1)
  const category = getCategory(topLevel, middleLevel)
  const pattern = SEASONAL_PATTERNS[category]
  const monthName = getMonthName(month)
  const plantName = middleLevel || topLevel

  if (!pattern) {
    return {
      stage: 'mature',
      label: 'Established',
      explanation: `We've assumed your ${plantName} is an established plant.`,
    }
  }

  // Check seasonal states in priority order
  if (pattern.dormant.includes(month)) {
    return {
      stage: 'dormant',
      label: 'Dormant',
      explanation: `Your ${plantName} is likely dormant right now — it's ${monthName}.`,
    }
  }

  if (pattern.fruiting.includes(month)) {
    return {
      stage: 'fruiting',
      label: 'Fruiting',
      explanation: `Your ${plantName} is likely fruiting right now — it's ${monthName}.`,
    }
  }

  if (pattern.flowering.includes(month)) {
    return {
      stage: 'flowering',
      label: 'Flowering',
      explanation: `Your ${plantName} is likely in flower right now — it's ${monthName}.`,
    }
  }

  // Default: actively growing but not flowering/fruiting/dormant
  return {
    stage: 'mature',
    label: 'Growing',
    explanation: `Your ${plantName} is likely actively growing right now — it's ${monthName}.`,
  }
}

// Maps the override UI values back to a GrowthStage for storage
export function mapOverrideToGrowthStage(
  lifeStage: 'seed' | 'seedling' | 'young' | 'established',
  seasonalState?: 'growing' | 'flowering' | 'fruiting' | 'dormant'
): GrowthStage {
  if (lifeStage === 'seed') return 'seed'
  if (lifeStage === 'seedling') return 'seedling'
  if (lifeStage === 'young') return 'juvenile'

  // Established plant — use seasonal state
  switch (seasonalState) {
    case 'flowering': return 'flowering'
    case 'fruiting': return 'fruiting'
    case 'dormant': return 'dormant'
    default: return 'mature'
  }
}
