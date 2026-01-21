import type { LocationType, LocationProtection } from '@/types/database'

export function formatPlantedIn(plantedIn: string): string {
  const labels: Record<string, string> = {
    ground: 'In ground',
    pot: 'In pot',
    raised_bed: 'Raised bed',
  }
  return labels[plantedIn] || plantedIn
}

export function formatLocationType(type: LocationType): string {
  const labels: Record<LocationType, string> = {
    front_garden: 'Front garden',
    back_garden: 'Back garden',
    patio: 'Patio',
    other: 'Other',
  }
  return labels[type]
}

export function formatLocationProtection(protection: LocationProtection): string {
  const labels: Record<LocationProtection, string> = {
    greenhouse: 'Greenhouse',
    polytunnel: 'Polytunnel',
    cold_frame: 'Cold frame',
  }
  return labels[protection]
}

export function formatFullLocation(
  locationType: LocationType | null,
  locationCustom: string | null,
  locationProtection: LocationProtection | null,
  legacyArea?: string | null
): string {
  // Handle new structured location
  if (locationType) {
    const base = locationType === 'other' && locationCustom
      ? locationCustom
      : formatLocationType(locationType)

    if (locationProtection) {
      return `${base} (${formatLocationProtection(locationProtection)})`
    }
    return base
  }

  // Fallback to legacy area field
  if (legacyArea) {
    return legacyArea
  }

  return ''
}
