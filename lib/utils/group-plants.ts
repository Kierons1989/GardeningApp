import type { Plant, PlantType, PlantTypeGroup } from '@/types/database'

export function groupPlantsByType(plants: Plant[]): PlantTypeGroup[] {
  const grouped = new Map<string, PlantTypeGroup>()
  const ungrouped: PlantTypeGroup[] = []

  for (const plant of plants) {
    if (plant.plant_type_id && plant.plant_types) {
      const key = plant.plant_type_id
      if (!grouped.has(key)) {
        grouped.set(key, {
          plantType: plant.plant_types,
          cultivars: [],
        })
      }
      grouped.get(key)!.cultivars.push(plant)
    } else {
      // Plants without plant_type_id become their own "group" of 1
      const syntheticType: PlantType = {
        id: plant.id,
        top_level: plant.name,
        middle_level: '',
        growth_habit: [],
        ai_care_profile: null,
        created_at: plant.created_at,
        updated_at: plant.updated_at,
      }
      ungrouped.push({
        plantType: syntheticType,
        cultivars: [plant],
      })
    }
  }

  // Sort groups by top_level, then middle_level
  const result = [...grouped.values()].sort((a, b) => {
    const topCompare = a.plantType.top_level.localeCompare(b.plantType.top_level)
    if (topCompare !== 0) return topCompare
    return a.plantType.middle_level.localeCompare(b.plantType.middle_level)
  })

  return [...result, ...ungrouped]
}
