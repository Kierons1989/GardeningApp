'use client'

import { useQuery } from '@tanstack/react-query'
import type { Profile } from '@/types/database'

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<Profile | null> => {
      const response = await fetch('/api/profile')
      if (!response.ok) return null
      return response.json()
    },
  })
}
