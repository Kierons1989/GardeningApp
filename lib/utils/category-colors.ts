/**
 * Get color scheme for task categories
 * Uses design system CSS custom properties
 */
export function getCategoryColor(category: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    pruning: { bg: 'var(--category-pruning-bg)', text: 'var(--category-pruning-text)' },
    feeding: { bg: 'var(--category-feeding-bg)', text: 'var(--category-feeding-text)' },
    pest_control: { bg: 'var(--category-pest-control-bg)', text: 'var(--category-pest-control-text)' },
    planting: { bg: 'var(--category-planting-bg)', text: 'var(--category-planting-text)' },
    watering: { bg: 'var(--category-watering-bg)', text: 'var(--category-watering-text)' },
    harvesting: { bg: 'var(--category-harvesting-bg)', text: 'var(--category-harvesting-text)' },
    winter_care: { bg: 'var(--category-winter-care-bg)', text: 'var(--category-winter-care-text)' },
    general: { bg: 'var(--category-general-bg)', text: 'var(--category-general-text)' },
  }
  return colors[category] || colors.general
}
