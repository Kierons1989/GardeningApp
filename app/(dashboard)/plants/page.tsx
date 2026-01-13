'use client'

import { usePlants } from '@/lib/queries/use-plants'
import PlantList from '@/components/plants/plant-list'
import PlantListSkeleton from '@/components/plants/plant-list-skeleton'

export default function PlantsPage() {
  const { data: plants, isLoading } = usePlants()

  if (isLoading) {
    return <PlantListSkeleton />
  }

  return <PlantList plants={plants || []} />
}
