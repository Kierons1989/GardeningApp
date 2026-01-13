'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Lawn, LawnTaskHistory, LawnMowingLog, LawnHealthCheck, LawnSetupFormData, LawnHealthStatus, LawnCareProfile } from '@/types/lawn'

// Fetch user's lawn
export function useLawn() {
  return useQuery({
    queryKey: ['lawn'],
    queryFn: async (): Promise<Lawn | null> => {
      const response = await fetch('/api/lawn')
      if (!response.ok) {
        if (response.status === 404) return null
        throw new Error('Failed to fetch lawn')
      }
      return response.json()
    },
  })
}

// Fetch lawn task history
export function useLawnTaskHistory() {
  return useQuery({
    queryKey: ['lawnTaskHistory'],
    queryFn: async (): Promise<LawnTaskHistory[]> => {
      const response = await fetch('/api/lawn/tasks')
      if (!response.ok) {
        throw new Error('Failed to fetch task history')
      }
      return response.json()
    },
  })
}

// Fetch mowing log
export function useLawnMowingLog() {
  return useQuery({
    queryKey: ['lawnMowingLog'],
    queryFn: async (): Promise<LawnMowingLog[]> => {
      const response = await fetch('/api/lawn/mowing')
      if (!response.ok) {
        throw new Error('Failed to fetch mowing log')
      }
      return response.json()
    },
  })
}

// Fetch health check history
export function useLawnHealthChecks() {
  return useQuery({
    queryKey: ['lawnHealthChecks'],
    queryFn: async (): Promise<LawnHealthCheck[]> => {
      const response = await fetch('/api/lawn/health')
      if (!response.ok) {
        throw new Error('Failed to fetch health checks')
      }
      return response.json()
    },
  })
}

// Create lawn mutation
export function useCreateLawn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LawnSetupFormData & { ai_care_profile?: LawnCareProfile }): Promise<Lawn> => {
      const response = await fetch('/api/lawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create lawn')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawn'] })
    },
  })
}

// Update lawn mutation
export function useUpdateLawn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Lawn>): Promise<Lawn> => {
      const response = await fetch('/api/lawn', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update lawn')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawn'] })
    },
  })
}

// Delete lawn mutation
export function useDeleteLawn() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const response = await fetch('/api/lawn', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete lawn')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawn'] })
      queryClient.invalidateQueries({ queryKey: ['lawnTaskHistory'] })
      queryClient.invalidateQueries({ queryKey: ['lawnMowingLog'] })
      queryClient.invalidateQueries({ queryKey: ['lawnHealthChecks'] })
    },
  })
}

// Log mowing mutation
export function useLogMowing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      lawn_id: string
      mowed_at?: string
      height_mm?: number
      notes?: string
    }): Promise<LawnMowingLog> => {
      const response = await fetch('/api/lawn/mowing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to log mowing')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawnMowingLog'] })
    },
  })
}

// Record lawn task action mutation
export function useLawnTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      lawn_id: string
      task_key: string
      action: 'done' | 'skipped' | 'snoozed'
      snooze_until?: string
      notes?: string
    }): Promise<LawnTaskHistory> => {
      const response = await fetch('/api/lawn/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record task action')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawnTaskHistory'] })
    },
  })
}

// Record health check mutation
export function useRecordHealthCheck() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: {
      lawn_id: string
      health_status: LawnHealthStatus
      issues_reported?: string[]
      notes?: string
    }): Promise<LawnHealthCheck> => {
      const response = await fetch('/api/lawn/health', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record health check')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lawn'] })
      queryClient.invalidateQueries({ queryKey: ['lawnHealthChecks'] })
    },
  })
}

// Helper to calculate days since last mow
export function useDaysSinceLastMow(): number | null {
  const { data: mowingLog } = useLawnMowingLog()

  if (!mowingLog || mowingLog.length === 0) {
    return null
  }

  const lastMow = mowingLog[0]
  const lastMowDate = new Date(lastMow.mowed_at)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  lastMowDate.setHours(0, 0, 0, 0)

  const daysSince = Math.floor(
    (today.getTime() - lastMowDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSince
}
