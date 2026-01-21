/**
 * Get color scheme for task categories
 * Uses design system CSS custom properties
 */
export function getCategoryColor(category: string): { bg: string; text: string; border: string } {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    pruning: { bg: 'var(--category-pruning-bg)', text: 'var(--category-pruning-text)', border: 'var(--sage-400)' },
    feeding: { bg: 'var(--category-feeding-bg)', text: 'var(--category-feeding-text)', border: 'var(--earth-400)' },
    pest_control: { bg: 'var(--category-pest-control-bg)', text: 'var(--category-pest-control-text)', border: 'var(--earth-500)' },
    planting: { bg: 'var(--category-planting-bg)', text: 'var(--category-planting-text)', border: 'var(--sage-400)' },
    watering: { bg: 'var(--category-watering-bg)', text: 'var(--category-watering-text)', border: 'var(--sage-300)' },
    harvesting: { bg: 'var(--category-harvesting-bg)', text: 'var(--category-harvesting-text)', border: 'var(--earth-500)' },
    winter_care: { bg: 'var(--category-winter-care-bg)', text: 'var(--category-winter-care-text)', border: 'var(--stone-400)' },
    general: { bg: 'var(--category-general-bg)', text: 'var(--category-general-text)', border: 'var(--stone-400)' },
  }
  return colors[category] || colors.general
}
