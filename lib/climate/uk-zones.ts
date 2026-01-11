/**
 * UK Climate Zone Mapping
 * Maps UK locations to USDA hardiness zones (7-10)
 *
 * USDA Zones for UK:
 * - Zone 7 (-17°C to -12°C): Scottish Highlands, northern areas
 * - Zone 8 (-12°C to -6°C): Most of England and Wales
 * - Zone 9 (-6°C to -1°C): Southern England, coastal areas
 * - Zone 10 (-1°C to 4°C): Scilly Isles, far southwest Cornwall
 */

// Location to zone mapping (case-insensitive lookup)
const LOCATION_ZONES: Record<string, number> = {
  // Zone 10 (Warmest - Scilly Isles, far SW)
  'scilly isles': 10,
  'st mary\'s': 10,
  'tresco': 10,

  // Zone 9 (Southern England, coastal)
  'penzance': 9,
  'falmouth': 9,
  'truro': 9,
  'plymouth': 9,
  'torquay': 9,
  'exeter': 9,
  'bournemouth': 9,
  'brighton': 9,
  'hastings': 9,
  'eastbourne': 9,
  'portsmouth': 9,
  'southampton': 9,
  'isle of wight': 9,
  'dover': 9,
  'margate': 9,
  'swansea': 9,
  'tenby': 9,
  'jersey': 9,
  'guernsey': 9,

  // Zone 8 (Most of England and Wales)
  'london': 8,
  'birmingham': 8,
  'manchester': 8,
  'liverpool': 8,
  'leeds': 8,
  'sheffield': 8,
  'bristol': 8,
  'cardiff': 8,
  'nottingham': 8,
  'leicester': 8,
  'coventry': 8,
  'bradford': 8,
  'wolverhampton': 8,
  'newcastle': 8,
  'sunderland': 8,
  'norwich': 8,
  'cambridge': 8,
  'oxford': 8,
  'reading': 8,
  'northampton': 8,
  'milton keynes': 8,
  'peterborough': 8,
  'ipswich': 8,
  'colchester': 8,
  'canterbury': 8,
  'gloucester': 8,
  'bath': 8,
  'salisbury': 8,
  'winchester': 8,
  'guildford': 8,
  'maidstone': 8,
  'tunbridge wells': 8,
  'york': 8,
  'hull': 8,
  'derby': 8,
  'stoke-on-trent': 8,
  'wrexham': 8,
  'chester': 8,
  'warrington': 8,
  'preston': 8,
  'blackpool': 8,
  'lancaster': 8,
  'carlisle': 8,
  'durham': 8,
  'middlesbrough': 8,
  'lincoln': 8,
  'aberystwyth': 8,
  'bangor': 8,
  'newport': 8,

  // Zone 7 (Colder - Scottish Highlands, northern areas)
  'edinburgh': 7,
  'glasgow': 7,
  'aberdeen': 7,
  'dundee': 7,
  'inverness': 7,
  'perth': 7,
  'stirling': 7,
  'fort william': 7,
  'oban': 7,
  'wick': 7,
  'thurso': 7,
  'stornoway': 7,
  'lerwick': 7,
  'kirkwall': 7,
  'aviemore': 7,
  'braemar': 7,
  'pitlochry': 7,
}

// Regional defaults (broader areas)
const REGIONAL_ZONES: Record<string, number> = {
  'scotland': 7,
  'scottish highlands': 7,
  'highlands': 7,
  'orkney': 7,
  'shetland': 7,
  'hebrides': 7,

  'cornwall': 9,
  'devon': 9,
  'dorset': 9,
  'kent': 9,
  'sussex': 9,
  'east sussex': 9,
  'west sussex': 9,
  'hampshire': 9,

  'england': 8,
  'wales': 8,
  'northern ireland': 8,
  'midlands': 8,
  'north west': 8,
  'north east': 8,
  'east anglia': 8,
  'yorkshire': 8,
  'lancashire': 8,
}

/**
 * Get USDA hardiness zone for a UK location
 * @param location - Town, city, or region name
 * @returns USDA zone (7-10), defaults to 8 if location not found
 */
export function getClimateZone(location: string): number {
  if (!location || typeof location !== 'string') {
    return 8 // Default to Zone 8 (most common in UK)
  }

  const normalized = location.trim().toLowerCase()

  // Check exact city/town matches first
  if (LOCATION_ZONES[normalized]) {
    return LOCATION_ZONES[normalized]
  }

  // Check regional matches
  if (REGIONAL_ZONES[normalized]) {
    return REGIONAL_ZONES[normalized]
  }

  // Check if location contains a known area
  for (const [key, zone] of Object.entries(LOCATION_ZONES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return zone
    }
  }

  for (const [key, zone] of Object.entries(REGIONAL_ZONES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return zone
    }
  }

  // Default to Zone 8 (covers most of England and Wales)
  return 8
}

/**
 * Get friendly description of a USDA zone
 */
export function getZoneDescription(zone: number): string {
  const descriptions: Record<number, string> = {
    7: 'Cold winters - Scottish Highlands and northern areas',
    8: 'Mild winters - Most of England and Wales',
    9: 'Warm winters - Southern England and coastal areas',
    10: 'Very mild winters - Scilly Isles and far southwest',
  }

  return descriptions[zone] || descriptions[8]
}

/**
 * Get temperature range for a USDA zone
 */
export function getZoneTemperatureRange(zone: number): string {
  const ranges: Record<number, string> = {
    7: '-17°C to -12°C',
    8: '-12°C to -6°C',
    9: '-6°C to -1°C',
    10: '-1°C to 4°C',
  }

  return ranges[zone] || ranges[8]
}
