'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { Plant, TaskHistory } from '@/types/database'
import { createClient } from '@/lib/supabase/client'
import TaskActions from '@/components/tasks/task-actions'
import PlantChat from '@/components/chat/plant-chat'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { formatPlantedIn, formatFullLocation } from '@/lib/utils/formatters'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'
import { getPlantedInIcon, getLocationIcon } from '@/components/ui/botanical-icons'
import ImageUpload from '@/components/plants/image-upload'
import SeasonalCareCalendar from '@/components/plants/seasonal-care-calendar'

interface PlantDetailProps {
  plant: Plant
  taskHistory: TaskHistory[]
}

export default function PlantDetail({ plant, taskHistory }: PlantDetailProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [showChat, setShowChat] = useState(false)
  const [currentTime] = useState(() => Date.now())
  const [showImageEdit, setShowImageEdit] = useState(false)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState(plant.photo_url)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id)
    })
  }, [])

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const supabase = createClient()

      // Delete storage files first if image exists
      if (currentPhotoUrl && userId) {
        const { data: files } = await supabase.storage
          .from('plant-images')
          .list(`${userId}/${plant.id}`)

        if (files && files.length > 0) {
          const paths = files.map(f => `${userId}/${plant.id}/${f.name}`)
          await supabase.storage.from('plant-images').remove(paths)
        }
      }

      const { error } = await supabase.from('plants').delete().eq('id', plant.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] })
      router.push('/plants')
    },
  })

  // Get care profile from plant_types relation
  const careProfile = plant.plant_types?.ai_care_profile

  const activeTasks = useMemo(() => {
    const currentMonth = new Date(currentTime).getMonth() + 1

    return careProfile?.tasks.filter((task) => {
      const inWindow = isTaskInWindow(task.month_start, task.month_end, currentMonth)
      if (!inWindow) return false

      // Check if already done recently
      const recentAction = taskHistory.find((h) => h.task_key === task.key)
      if (recentAction) {
        const daysSince = Math.floor(
          (currentTime - new Date(recentAction.created_at).getTime()) / (1000 * 60 * 60 * 24)
        )
        if (task.recurrence_type === 'weekly_in_window' && daysSince < 7) return false
        if (task.recurrence_type === 'once_per_window' && daysSince < 30) return false
        if (task.recurrence_type === 'monthly_in_window' && daysSince < 28) return false
      }
      return true
    }) || []
  }, [careProfile?.tasks, taskHistory, currentTime])

  function handleDelete() {
    if (!confirm('Are you sure you want to delete this plant? This cannot be undone.')) {
      return
    }
    deleteMutation.mutate()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/plants"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="CaretLeft" size={16} weight="light" className="w-4 h-4" ariaLabel="back" />
        Back to plants
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 sm:p-8 mb-6"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {/* Plant Image/Icon */}
          <button
            type="button"
            onClick={() => setShowImageEdit(!showImageEdit)}
            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex-shrink-0 overflow-hidden group"
            style={{ background: 'var(--sage-100)' }}
          >
            {currentPhotoUrl ? (
              <Image
                src={currentPhotoUrl}
                alt={plant.name}
                fill
                className="object-cover"
                unoptimized={currentPhotoUrl.includes('perenual.com')}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {getPlantTypeIcon(plant.plant_types?.top_level || '', 'w-8 h-8 sm:w-10 sm:h-10', { color: 'var(--sage-700)' })}
              </div>
            )}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.5)' }}
            >
              <Icon name="Camera" size={24} weight="light" style={{ color: 'white' }} ariaLabel="Edit photo" />
            </div>
          </button>

          {/* Plant Info */}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div>
                <h1
                  className="text-2xl sm:text-3xl font-semibold mb-1"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {plant.cultivar_name || plant.name}
                </h1>
                {plant.cultivar_name && (
                  <p style={{ color: 'var(--text-secondary)' }}>
                    {plant.name}
                  </p>
                )}
                {plant.species && (
                  <p className="italic text-sm" style={{ color: 'var(--text-muted)' }}>
                    {plant.species}
                  </p>
                )}
              </div>

              {/* Actions - hidden on mobile, shown in separate row */}
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="relative"
                  style={{
                    background: showChat ? 'var(--sage-600)' : 'var(--sage-100)',
                    color: showChat ? 'white' : 'var(--sage-700)',
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-crimson)',
                    fontWeight: '500',
                    fontSize: '15px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all var(--transition-fast)',
                    border: showChat ? 'none' : '1px solid var(--sage-200)',
                  }}
                >
                  <Icon name="Chat" size={20} weight="light" className="w-5 h-5" ariaLabel="chat" />
                  {showChat ? 'Hide Chat' : 'Ask AI'}
                  {!showChat && (
                    <span
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                      style={{ background: 'var(--coral)' }}
                    />
                  )}
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="btn-icon btn-icon-destructive"
                >
                  <Icon name="Trash" size={20} weight="light" ariaLabel="delete" />
                </button>
              </div>
            </div>

            {/* Meta Info */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 mt-4">
              {(plant.location_type || plant.area) && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {getLocationIcon('w-4 h-4', { color: 'var(--text-secondary)' }, 16)}
                  {formatFullLocation(plant.location_type, plant.location_custom, plant.location_protection, plant.area)}
                </span>
              )}
              {plant.planted_in && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {getPlantedInIcon(plant.planted_in, 'w-4 h-4', { color: 'var(--text-secondary)' }, 16)}
                  {formatPlantedIn(plant.planted_in)}
                </span>
              )}
              {careProfile?.uk_hardiness && (
                <span
                  className="inline-flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-full"
                  style={{
                    background: 'var(--sage-100)',
                    color: 'var(--sage-700)',
                  }}
                >
                  <Icon name="Snowflake" size={16} weight="light" className="w-4 h-4" ariaLabel="hardiness" />
                  {careProfile.uk_hardiness}
                </span>
              )}
            </div>

            {/* Mobile Actions - shown only on mobile */}
            <div className="flex sm:hidden items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setShowChat(!showChat)}
                className="relative flex-1"
                style={{
                  background: showChat ? 'var(--sage-600)' : 'var(--sage-100)',
                  color: showChat ? 'white' : 'var(--sage-700)',
                  padding: '10px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-crimson)',
                  fontWeight: '500',
                  fontSize: '15px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all var(--transition-fast)',
                  border: showChat ? 'none' : '1px solid var(--sage-200)',
                }}
              >
                <Icon name="Chat" size={20} weight="light" className="w-5 h-5" ariaLabel="chat" />
                {showChat ? 'Hide Chat' : 'Ask AI'}
                {!showChat && (
                  <span
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                    style={{ background: 'var(--coral)' }}
                  />
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="btn-icon btn-icon-destructive"
              >
                <Icon name="Trash" size={20} weight="light" ariaLabel="delete" />
              </button>
            </div>
          </div>
        </div>

        {/* Summary */}
        {careProfile?.summary && (
          <p
            className="mt-6 pt-6 border-t"
            style={{
              borderColor: 'var(--stone-200)',
              color: 'var(--text-secondary)',
            }}
          >
            {careProfile.summary}
          </p>
        )}

        {/* Notes */}
        {plant.notes && (
          <div
            className="mt-4 p-4 rounded-xl"
            style={{ background: 'var(--stone-50)' }}
          >
            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              Your notes
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>{plant.notes}</p>
          </div>
        )}

        {/* Image Edit Panel */}
        <AnimatePresence>
          {showImageEdit && userId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t"
              style={{ borderColor: 'var(--stone-200)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Update Photo
                </h3>
                <button
                  type="button"
                  onClick={() => setShowImageEdit(false)}
                  className="p-1 rounded"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name="X" size={16} weight="light" ariaLabel="Close" />
                </button>
              </div>
              <ImageUpload
                plantId={plant.id}
                userId={userId}
                currentImageUrl={currentPhotoUrl}
                onImageChange={(url) => {
                  setCurrentPhotoUrl(url)
                  queryClient.invalidateQueries({ queryKey: ['plants'] })
                  setShowImageEdit(false)
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Panel */}
      {showChat && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6"
        >
          <PlantChat plant={plant} taskHistory={taskHistory} />
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        {/* Current Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Current Tasks
          </h2>

          {activeTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No tasks due right now. Check back later!
            </p>
          ) : (
            <div className="space-y-4">
              {activeTasks.map((task) => (
                <div
                  key={task.key}
                  className="p-3 sm:p-4 rounded-xl"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-2">
                    <div className="order-2 sm:order-1">
                      <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </h3>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatMonthRange(task.month_start, task.month_end)}
                      </p>
                    </div>
                    <span
                      className="order-1 sm:order-2 text-xs px-2 py-1 rounded-full self-start flex-shrink-0"
                      style={{
                        background: getCategoryColor(task.category).bg,
                        color: getCategoryColor(task.category).text,
                      }}
                    >
                      {task.category.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                    {task.why_this_matters}
                  </p>
                  <TaskActions plantId={plant.id} taskKey={task.key} />
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Task History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <h2
            className="text-xl font-semibold mb-4"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Recent Activity
          </h2>

          {taskHistory.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>
              No activity recorded yet.
            </p>
          ) : (
            <div className="space-y-3">
              {taskHistory.slice(0, 10).map((history) => (
                <div
                  key={history.id}
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--stone-50)' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{
                      background: getActionColor(history.action).bg,
                      color: getActionColor(history.action).text,
                    }}
                  >
                    {history.action === 'done' && <Icon name="Check" size={16} weight="light" ariaLabel="done" />}
                    {history.action === 'skipped' && <Icon name="ArrowRight" size={16} weight="light" ariaLabel="skipped" />}
                    {history.action === 'snoozed' && <Icon name="Clock" size={16} weight="light" ariaLabel="snoozed" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                      {formatTaskKey(history.task_key)}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(history.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Seasonal Care Calendar */}
      {careProfile?.tasks && careProfile.tasks.length > 0 && (
        <SeasonalCareCalendar tasks={careProfile.tasks} />
      )}

      {/* Care Tips */}
      {careProfile?.tips && careProfile.tips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 sm:mt-6 rounded-2xl p-4 sm:p-6"
          style={{
            background: 'white',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Lightbulb" size={20} weight="light" className="w-5 h-5" style={{ color: 'var(--sage-600)' }} ariaLabel="tips" />
            <h2
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Care Tips
            </h2>
          </div>
          <ul className="space-y-2">
            {careProfile.tips.map((tip, i) => (
              <li key={i} className="flex gap-2 text-sm sm:text-base" style={{ color: 'var(--text-secondary)' }}>
                <span>•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </div>
  )
}

// Helper functions
function isTaskInWindow(monthStart: number, monthEnd: number, currentMonth: number): boolean {
  if (monthStart <= monthEnd) {
    return currentMonth >= monthStart && currentMonth <= monthEnd
  }
  return currentMonth >= monthStart || currentMonth <= monthEnd
}

function formatMonthRange(start: number, end: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (start === end) {
    return months[start - 1]
  }
  return `${months[start - 1]} - ${months[end - 1]}`
}

function getActionColor(action: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    done: { bg: 'var(--sage-100)', text: 'var(--sage-700)' },
    skipped: { bg: 'var(--stone-200)', text: 'var(--stone-600)' },
    snoozed: { bg: 'var(--earth-100)', text: 'var(--earth-700)' },
  }
  return colors[action] || colors.done
}

function formatTaskKey(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

