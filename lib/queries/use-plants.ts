'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import type { Plant, TaskHistory, PlantTypeGroup } from '@/types/database'
import { groupPlantsByType } from '@/lib/utils/group-plants'

export function usePlants() {
  return useQuery({
    queryKey: ['plants'],
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<Plant[]> => {
      const response = await fetch('/api/plants')
      if (!response.ok) throw new Error('Failed to fetch plants')
      return response.json()
    },
  })
}

export function useTaskHistory() {
  return useQuery({
    queryKey: ['taskHistory'],
    queryFn: async (): Promise<TaskHistory[]> => {
      const response = await fetch('/api/tasks')
      if (!response.ok) throw new Error('Failed to fetch task history')
      return response.json()
    },
  })
}

export function usePlantTypeGroups(): {
  data: PlantTypeGroup[]
  isLoading: boolean
  error: Error | null
} {
  const { data: plants, isLoading, error } = usePlants()

  const groups = useMemo(() => {
    if (!plants) return []
    return groupPlantsByType(plants)
  }, [plants])

  return { data: groups, isLoading, error }
}
