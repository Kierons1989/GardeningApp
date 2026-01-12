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

import * as Phosphor from '@phosphor-icons/react'

interface IconProps {
  className?: string
  style?: React.CSSProperties
  size?: number | string
}

type IconComponent = any

function resolveIcon(candidates: string[], fallback = 'SquaresFour') {
  for (const name of candidates) {
    if ((Phosphor as any)[name]) return (Phosphor as any)[name]
    if ((Phosphor as any)[name + 'Icon']) return (Phosphor as any)[name + 'Icon']
  }
  return (Phosphor as any)[fallback] || null
}

export function getCategoryIcon(category: string, className?: string, style?: React.CSSProperties, size?: number | string) {
  const map: Record<string, string[]> = {
    pruning: ['Scissors', 'Scythe', 'Broom'],
    feeding: ['Spoon', 'BowlFood', 'ForkKnife'],
    pest_control: ['Bug', 'BugBeetle'],
    planting: ['Acorn', 'Avocado', 'Cactus'],
    watering: ['Droplet', 'Drop', 'Water', 'WaterDrop'],
    harvesting: ['Basket', 'BowlFood'],
    winter_care: ['Snowflake', 'SnowflakeIcon'],
    general: ['Clipboard', 'Note', 'Article'],
  }

  const candidates = map[category] || ['SquaresFour']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getPlantTypeIcon(plantType: string | null, className?: string, style?: React.CSSProperties, size?: number | string) {
  const type = plantType?.toLowerCase() || ''
  const map: Record<string, string[]> = {
    rose: ['Flower', 'Bouquet', 'FlowerLotus'],
    shrub: ['Bush', 'Cactus', 'Tree'],
    perennial: ['Flower', 'Leaf', 'Plant'],
    bulb: ['Lightbulb', 'Bulb', 'Light'],
    vegetable: ['Carrot', 'Avocado', 'BowlFood'],
    fruit: ['Avocado', 'AppleLogo', 'BowlFood'],
    tree: ['Tree', 'Barn', 'Cactus'],
    climber: ['Hook', 'Chain', 'Acorn'],
    herb: ['Leaf', 'Herb', 'Plant'],
    succulent: ['Cactus', 'CactusIcon', 'Leaf'],
  }

  const candidates = map[type] || ['Leaf', 'SquaresFour']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getPlantedInIcon(plantedIn: string | null, className?: string, style?: React.CSSProperties, size?: number | string) {
  const key = plantedIn || ''
  const map: Record<string, string[]> = {
    ground: ['Globe', 'GlobeSimple', 'Mountains'],
    pot: ['FlowerPot', 'PottedPlant', 'Flower'],
    raised_bed: ['Stack', 'Rows', 'Square'],
  }
  const candidates = map[key] || ['Square']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getLocationIcon(className?: string, style?: React.CSSProperties, size?: number | string) {
  const Component = resolveIcon(['MapPin', 'MapPinLine', 'MapPinDot'], 'MapPin')
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}
