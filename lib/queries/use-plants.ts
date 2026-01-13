'use client'

import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import type { Plant, TaskHistory } from '@/types/database'

export function usePlants() {
  return useQuery({
    queryKey: ['plants'],
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
