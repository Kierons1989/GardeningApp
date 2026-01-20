'use client'

import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Plant, TaskHistory, PlantTypeGroup } from '@/types/database'
import { groupPlantsByType } from '@/lib/utils/group-plants'

export function usePlants() {
  return useQuery({
    queryKey: ['plants'],
    placeholderData: (previousData) => previousData,
    queryFn: async (): Promise<Plant[]> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      const { data } = await supabase
        .from('plants')
        .select(`
          *,
          plant_types (
            id,
            top_level,
            middle_level,
            growth_habit,
            ai_care_profile
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      return data || []
    },
  })
}

export function useTaskHistory() {
  return useQuery({
    queryKey: ['taskHistory'],
    queryFn: async (): Promise<TaskHistory[]> => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return []

      const { data } = await supabase
        .from('task_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      return data || []
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
