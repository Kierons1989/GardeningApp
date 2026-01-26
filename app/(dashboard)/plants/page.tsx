'use client'

import { Suspense, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { usePlants } from '@/lib/queries/use-plants'
import PlantList from '@/components/plants/plant-list'
import PlantListSkeleton from '@/components/plants/plant-list-skeleton'
import { useToast } from '@/components/ui/toast'

function PlantsPageContent() {
  const { data: plants, isLoading } = usePlants()
  const searchParams = useSearchParams()
  const router = useRouter()
  const { showToast } = useToast()
  const toastShownRef = useRef<string | null>(null)

  // Show success toast when plant was just added
  useEffect(() => {
    const addedPlant = searchParams.get('added')
    if (addedPlant && toastShownRef.current !== addedPlant) {
      toastShownRef.current = addedPlant
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

export default function PlantsPage() {
  return (
    <Suspense fallback={<PlantListSkeleton />}>
      <PlantsPageContent />
    </Suspense>
  )
}
