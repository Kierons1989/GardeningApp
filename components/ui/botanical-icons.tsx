/**
 * Replace custom SVG icons with Phosphor icons (light weight)
 *
 * Note: install the Phosphor React package in your project:
 *
 *   npm install phosphor-react
 *
 * This module exposes the same helper functions used across the app:
 * - `getCategoryIcon(category)`
 * - `getPlantTypeIcon(type)`
 *
 * Each helper returns a Phosphor icon rendered with `weight="light"`.
 */

import * as Phosphor from 'phosphor-react'

interface IconProps {
  className?: string
  style?: React.CSSProperties
  size?: number | string
}

function renderPhosphorIcon(name: string, { className, style, size }: IconProps = {}) {
  const Icon = (Phosphor as any)[name]
  if (!Icon) return null
  const props: Record<string, any> = { weight: 'light' }
  if (className) props.className = className
  if (style) props.style = style
  if (size) props.size = size
  return <Icon {...props} />
}

export function getCategoryIcon(category: string, className?: string, style?: React.CSSProperties) {
  const props = { className, style }
  const map: Record<string, string> = {
    pruning: 'Scissors',
    feeding: 'Spoon',
    pest_control: 'Bug',
    planting: 'Seedling',
    watering: 'Drop',
    harvesting: 'Basket',
    winter_care: 'Snowflake',
    general: 'Clipboard',
  }
  const name = map[category] || 'SquaresFour'
  return renderPhosphorIcon(name, props)
}

export function getPlantTypeIcon(plantType: string | null, className?: string, style?: React.CSSProperties) {
  const props = { className, style }
  const type = plantType?.toLowerCase() || ''
  const map: Record<string, string> = {
    rose: 'Flower',
    shrub: 'Tree',
    perennial: 'Flower',
    bulb: 'Lightbulb',
    vegetable: 'Carrot',
    fruit: 'Apple',
    tree: 'Tree',
    climber: 'Seedling',
    herb: 'Leaf',
    succulent: 'Seedling',
  }
  const name = map[type] || 'Leaf'
  return renderPhosphorIcon(name, props)
}
