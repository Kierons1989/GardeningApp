'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

interface TaskActionParams {
  plantId: string
  taskKey: string
  action: 'done' | 'skipped' | 'snoozed'
  snoozeUntil?: string
}

export function useTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ plantId, taskKey, action, snoozeUntil }: TaskActionParams) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantId,
          taskKey,
          action,
          snoozeUntil,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save task action')
      }

      return response.json()
    },
    onSuccess: () => {
      // Invalidate queries that depend on task history
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      queryClient.invalidateQueries({ queryKey: ['plant'] })
      queryClient.invalidateQueries({ queryKey: ['taskHistory'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
