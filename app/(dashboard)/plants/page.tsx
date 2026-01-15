'use client'

import { useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePlants } from '@/lib/queries/use-plants'
import PlantList from '@/components/plants/plant-list'
import PlantListSkeleton from '@/components/plants/plant-list-skeleton'
import { useToast } from '@/components/ui/toast'

export default function PlantsPage() {
  const { data: plants, isLoading } = usePlants()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()

  // Show success toast when plant was just added
  useEffect(() => {
    const addedPlant = searchParams.get('added')
    if (addedPlant) {
      showToast(`${addedPlant} added to your garden!`, 'success')
      // Clean up the URL without triggering a re-render
      router.replace('/plants', { scroll: false })
    }
  }, [searchParams, showToast, router])

  if (isLoading) {
    return <PlantListSkeleton />
  }

  return <PlantList plants={plants || []} />
}
