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
import type { IconProps as PhosphorIconProps } from '@phosphor-icons/react'

type IconComponent = React.ComponentType<PhosphorIconProps>

// Cache resolved icons for performance
const iconCache: Record<string, IconComponent | null> = {}

function resolveIcon(candidates: string[], fallback = 'SquaresFour'): IconComponent | null {
  const cacheKey = candidates.join(',') + '|' + fallback

  if (cacheKey in iconCache) {
    return iconCache[cacheKey]
  }

  const icons = Phosphor as Record<string, unknown>

  for (const name of candidates) {
    const component = icons[name] || icons[name + 'Icon']
    if (component && typeof component === 'function') {
      iconCache[cacheKey] = component as IconComponent
      return component as IconComponent
    }
  }

  const fallbackComponent = icons[fallback]
  if (fallbackComponent && typeof fallbackComponent === 'function') {
    iconCache[cacheKey] = fallbackComponent as IconComponent
    return fallbackComponent as IconComponent
  }

  iconCache[cacheKey] = null
  return null
}

export function getCategoryIcon(category: string, className?: string, style?: React.CSSProperties, size?: number | string) {
  const map: Record<string, string[]> = {
    pruning: ['Scissors'],
    feeding: ['CookingPot', 'Bowl'],
    pest_control: ['Bug', 'Skull'],
    planting: ['Plant', 'Leaf'],
    watering: ['Drop', 'Droplet'],
    harvesting: ['Basket', 'Package'],
    winter_care: ['Snowflake', 'ThermometerCold'],
    general: ['ClipboardText', 'Clipboard', 'Note'],
  }

  const candidates = map[category] || ['SquaresFour']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getPlantTypeIcon(plantType: string | null, className?: string, style?: React.CSSProperties, size?: number | string) {
  const type = plantType?.toLowerCase() || ''
  const map: Record<string, string[]> = {
    rose: ['Flower', 'FlowerLotus'],
    shrub: ['Tree', 'Plant'],
    perennial: ['Flower', 'Leaf', 'Plant'],
    bulb: ['CircleWavyWarning', 'Leaf'],
    vegetable: ['Carrot', 'Plant'],
    fruit: ['Orange', 'AppleLogo', 'Plant'],
    tree: ['Tree', 'TreeEvergreen'],
    climber: ['ArrowsOutLineVertical', 'Plant'],
    herb: ['Leaf', 'Plant'],
    succulent: ['Cactus', 'Leaf'],
  }

  const candidates = map[type] || ['Leaf', 'Plant']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getPlantedInIcon(plantedIn: string | null, className?: string, style?: React.CSSProperties, size?: number | string) {
  const key = plantedIn || ''
  const map: Record<string, string[]> = {
    ground: ['Mountains', 'Leaf'],
    pot: ['FlowerPot', 'Flower'],
    raised_bed: ['Rows', 'Stack', 'Square'],
  }
  const candidates = map[key] || ['Square']
  const Component = resolveIcon(candidates)
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}

export function getLocationIcon(className?: string, style?: React.CSSProperties, size?: number | string) {
  const Component = resolveIcon(['MapPin', 'MapPinLine', 'MapPinDot'], 'MapPin')
  return Component ? <Component weight="light" size={size} className={className} style={style} /> : null
}
