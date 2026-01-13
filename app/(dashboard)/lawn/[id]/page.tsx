'use client'

import { Suspense } from 'react'
import { useParams, redirect } from 'next/navigation'
import { useLawn } from '@/lib/queries/use-lawn'
import LawnDetail from '@/components/lawn/lawn-detail'
import { GrowingPlantLoader } from '@/components/ui/botanical-loader'

function LawnDetailPageContent() {
  const params = useParams()
  const lawnId = params.id as string
  const { data: lawn, isLoading } = useLawn()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <GrowingPlantLoader size="lg" />
      </div>
    )
  }

  // If lawn doesn't exist or ID doesn't match, redirect to main lawn page
  if (!lawn || lawn.id !== lawnId) {
    redirect('/lawn')
  }

  return <LawnDetail lawn={lawn} />
}

export default function LawnDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <GrowingPlantLoader size="lg" />
      </div>
    }>
      <LawnDetailPageContent />
    </Suspense>
  )
}
