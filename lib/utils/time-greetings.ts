/**
 * Time and season utilities for personalized greetings
 */

export function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

export function getSeasonDisplayName(season: Season): string {
  return season.charAt(0).toUpperCase() + season.slice(1)
}

const seasonalTips: Record<Season, string[]> = {
  spring: [
    'Perfect time to prepare beds and sow seeds indoors.',
    'Watch for late frosts before planting tender seedlings.',
    'Start hardening off indoor seedlings for planting out.',
    'Prune early-flowering shrubs after they finish blooming.',
  ],
  summer: [
    'Water in the early morning to reduce evaporation.',
    'Deadhead flowers regularly to encourage more blooms.',
    'Keep on top of weeding while soil is moist.',
    'Harvest crops regularly to encourage more growth.',
  ],
  autumn: [
    'Great time for planting trees and shrubs.',
    'Collect fallen leaves for composting.',
    'Plant spring-flowering bulbs now.',
    'Divide and transplant perennials while soil is warm.',
  ],
  winter: [
    "Plan next year's garden while things are quiet.",
    'Check stored bulbs and tubers for rot.',
    'Order seeds early for the best selection.',
    'Clean and sharpen tools ready for spring.',
  ],
}

export function getSeasonalTip(season?: Season): string {
  const currentSeason = season || getCurrentSeason()
  const tips = seasonalTips[currentSeason]
  return tips[Math.floor(Math.random() * tips.length)]
}

export function getSeasonColor(season: Season): {
  bg: string
  text: string
  accent: string
} {
  const colors: Record<Season, { bg: string; text: string; accent: string }> = {
    spring: {
      bg: 'var(--sage-100)',
      text: 'var(--sage-700)',
      accent: 'var(--sage-500)',
    },
    summer: {
      bg: 'var(--lawn-100)',
      text: 'var(--lawn-700)',
      accent: 'var(--lawn-500)',
    },
    autumn: {
      bg: 'var(--earth-100)',
      text: 'var(--earth-700)',
      accent: 'var(--earth-500)',
    },
    winter: {
      bg: 'var(--stone-200)',
      text: 'var(--stone-700)',
      accent: 'var(--stone-500)',
    },
  }
  return colors[season]
}
