'use client'

import { usePlants, useTaskHistory } from '@/lib/queries/use-plants'
import DashboardContent from '@/components/dashboard/dashboard-content'
import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton'

export default function DashboardPage() {
  const { data: plants, isLoading: plantsLoading } = usePlants()
  const { data: taskHistory, isLoading: historyLoading } = useTaskHistory()

  if (plantsLoading || historyLoading) {
    return <DashboardSkeleton />
  }

  return (
    <DashboardContent
      plants={plants || []}
      taskHistory={taskHistory || []}
    />
  )
}
