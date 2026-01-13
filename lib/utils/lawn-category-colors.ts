import type { LawnTaskCategory } from '@/types/lawn'

/**
 * Get color scheme for lawn task categories
 * Uses design system CSS custom properties
 */
export function getLawnCategoryColor(category: LawnTaskCategory): { bg: string; text: string } {
  const colors: Record<LawnTaskCategory, { bg: string; text: string }> = {
    mowing: { bg: 'var(--category-mowing-bg)', text: 'var(--category-mowing-text)' },
    feeding: { bg: 'var(--category-feeding-bg)', text: 'var(--category-feeding-text)' },
    aeration: { bg: 'var(--category-aeration-bg)', text: 'var(--category-aeration-text)' },
    scarification: { bg: 'var(--category-scarification-bg)', text: 'var(--category-scarification-text)' },
    overseeding: { bg: 'var(--category-overseeding-bg)', text: 'var(--category-overseeding-text)' },
    moss_control: { bg: 'var(--category-moss-control-bg)', text: 'var(--category-moss-control-text)' },
    weed_management: { bg: 'var(--category-weed-management-bg)', text: 'var(--category-weed-management-text)' },
    watering: { bg: 'var(--category-watering-bg)', text: 'var(--category-watering-text)' },
    edging: { bg: 'var(--category-edging-bg)', text: 'var(--category-edging-text)' },
    winter_care: { bg: 'var(--category-winter-care-bg)', text: 'var(--category-winter-care-text)' },
  }
  return colors[category] || { bg: 'var(--stone-100)', text: 'var(--stone-700)' }
}

/**
 * Format lawn task category for display
 */
export function formatLawnCategory(category: LawnTaskCategory): string {
  const labels: Record<LawnTaskCategory, string> = {
    mowing: 'Mowing',
    feeding: 'Feeding',
    aeration: 'Aeration',
    scarification: 'Scarification',
    overseeding: 'Overseeding',
    moss_control: 'Moss Control',
    weed_management: 'Weed Management',
    watering: 'Watering',
    edging: 'Edging',
    winter_care: 'Winter Care',
  }
  return labels[category] || category.replace(/_/g, ' ')
}

/**
 * Get icon name for lawn task category
 * Returns Phosphor icon name
 */
export function getLawnCategoryIconName(category: LawnTaskCategory): string {
  const icons: Record<LawnTaskCategory, string> = {
    mowing: 'Scissors',
    feeding: 'Drop',
    aeration: 'Wind',
    scarification: 'Rake',
    overseeding: 'Grain',
    moss_control: 'Leaf',
    weed_management: 'Trash',
    watering: 'DropHalf',
    edging: 'Ruler',
    winter_care: 'Snowflake',
  }
  return icons[category] || 'Circle'
}
