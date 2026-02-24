'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import type { Plant, GrowthStage, PlantEnvironment, HealthStatus } from '@/types/database'
import Icon from '@/components/ui/icon'
import { SpinningLeafLoader } from '@/components/ui/botanical-loader'

interface PlantStateEditorProps {
  plant: Plant
  onUpdate?: (updatedPlant: Plant) => void
}

const GROWTH_STAGES: { value: GrowthStage; label: string; icon: string }[] = [
  { value: 'seed', label: 'Seed', icon: 'Grain' },
  { value: 'seedling', label: 'Seedling', icon: 'Sprout' },
  { value: 'juvenile', label: 'Young', icon: 'Plant' },
  { value: 'mature', label: 'Mature', icon: 'Tree' },
  { value: 'dormant', label: 'Dormant', icon: 'Moon' },
  { value: 'flowering', label: 'Flowering', icon: 'Flower' },
  { value: 'fruiting', label: 'Fruiting', icon: 'Orange' },
]

const ENVIRONMENTS: { value: PlantEnvironment; label: string; icon: string }[] = [
  { value: 'indoor', label: 'Indoor', icon: 'House' },
  { value: 'outdoor', label: 'Outdoor', icon: 'Sun' },
  { value: 'greenhouse', label: 'Greenhouse', icon: 'Warehouse' },
  { value: 'cold_frame', label: 'Cold frame', icon: 'Package' },
]

const HEALTH_STATUSES: { value: HealthStatus; label: string; color: string }[] = [
  { value: 'healthy', label: 'Healthy', color: 'var(--sage-600)' },
  { value: 'struggling', label: 'Struggling', color: 'var(--earth-600)' },
  { value: 'diseased', label: 'Diseased', color: 'var(--error)' },
  { value: 'recovering', label: 'Recovering', color: 'var(--sage-400)' },
]

export default function PlantStateEditor({ plant, onUpdate }: PlantStateEditorProps) {
  const queryClient = useQueryClient()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state — initialise from existing plant state or defaults
  const [growthStage, setGrowthStage] = useState<GrowthStage>(
    plant.plant_state?.growth_stage || 'mature'
  )
  const [environment, setEnvironment] = useState<PlantEnvironment>(
    plant.plant_state?.environment || 'outdoor'
  )
  const [healthStatus, setHealthStatus] = useState<HealthStatus>(
    plant.plant_state?.health_status || 'healthy'
  )
  const [healthNotes, setHealthNotes] = useState(
    plant.plant_state?.health_notes || ''
  )
  const [datePlanted, setDatePlanted] = useState(
    plant.plant_state?.date_planted || ''
  )

  const hasChanges = !plant.plant_state || (
    growthStage !== plant.plant_state.growth_stage ||
    environment !== plant.plant_state.environment ||
    healthStatus !== plant.plant_state.health_status ||
    healthNotes !== (plant.plant_state.health_notes || '') ||
    datePlanted !== (plant.plant_state.date_planted || '')
  )

  async function handleUpdate() {
    setIsUpdating(true)
    setError(null)

    try {
      const response = await fetch(`/api/plants/${plant.id}/state`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          growth_stage: growthStage,
          environment,
          health_status: healthStatus,
          health_notes: healthNotes || undefined,
          date_planted: datePlanted || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update plant state')
      }

      const updatedPlant = await response.json()

      // Invalidate queries so the dashboard and task lists refresh
      await queryClient.invalidateQueries({ queryKey: ['plants'] })

      onUpdate?.(updatedPlant)
      setIsExpanded(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsUpdating(false)
    }
  }

  const currentState = plant.plant_state
  const stageInfo = GROWTH_STAGES.find(s => s.value === (currentState?.growth_stage || growthStage))
  const envInfo = ENVIRONMENTS.find(e => e.value === (currentState?.environment || environment))
  const healthInfo = HEALTH_STATUSES.find(h => h.value === (currentState?.health_status || healthStatus))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Collapsed header — always visible */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 sm:p-5 flex items-center gap-3 text-left transition-colors"
        style={{ background: isExpanded ? 'var(--sage-50)' : 'white' }}
      >
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--sage-100)' }}
        >
          <Icon name="Pulse" size={18} weight="light" style={{ color: 'var(--sage-700)' }} ariaLabel="Plant state" />
        </div>

        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Plant Status
          </h3>
          {currentState ? (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--sage-100)', color: 'var(--sage-700)' }}
              >
                <Icon name={stageInfo?.icon || 'Plant'} size={12} weight="light" />
                {stageInfo?.label}
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'var(--earth-100)', color: 'var(--earth-700)' }}
              >
                <Icon name={envInfo?.icon || 'Sun'} size={12} weight="light" />
                {envInfo?.label}
              </span>
              <span
                className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: healthInfo?.value === 'healthy' ? 'var(--sage-100)' : 'var(--earth-100)',
                  color: healthInfo?.color || 'var(--sage-700)',
                }}
              >
                {healthInfo?.label}
              </span>
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Set your plant&apos;s current state to get tailored care advice
            </p>
          )}
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <Icon
            name="CaretDown"
            size={18}
            weight="light"
            style={{ color: 'var(--text-muted)' }}
            ariaLabel={isExpanded ? 'Collapse' : 'Expand'}
          />
        </motion.div>
      </button>

      {/* Expanded editor */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div
              className="px-4 sm:px-5 pb-5 space-y-5 border-t"
              style={{ borderColor: 'var(--stone-200)' }}
            >
              {/* Growth Stage */}
              <div className="pt-5">
                <label className="text-sm font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Growth stage
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {GROWTH_STAGES.map((stage) => (
                    <button
                      key={stage.value}
                      type="button"
                      onClick={() => setGrowthStage(stage.value)}
                      className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: growthStage === stage.value ? 'var(--sage-500)' : 'var(--stone-200)',
                        background: growthStage === stage.value ? 'var(--sage-50)' : 'white',
                      }}
                    >
                      <Icon
                        name={stage.icon}
                        size={20}
                        weight="light"
                        style={{
                          color: growthStage === stage.value ? 'var(--sage-600)' : 'var(--text-muted)',
                        }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{
                          color: growthStage === stage.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        {stage.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Environment */}
              <div>
                <label className="text-sm font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Environment
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ENVIRONMENTS.map((env) => (
                    <button
                      key={env.value}
                      type="button"
                      onClick={() => setEnvironment(env.value)}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: environment === env.value ? 'var(--sage-500)' : 'var(--stone-200)',
                        background: environment === env.value ? 'var(--sage-50)' : 'white',
                      }}
                    >
                      <Icon
                        name={env.icon}
                        size={18}
                        weight="light"
                        style={{
                          color: environment === env.value ? 'var(--sage-600)' : 'var(--text-muted)',
                        }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: environment === env.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        {env.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Status */}
              <div>
                <label className="text-sm font-medium mb-2.5 block" style={{ color: 'var(--text-secondary)' }}>
                  Health
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {HEALTH_STATUSES.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setHealthStatus(status.value)}
                      className="flex items-center gap-2 p-3 rounded-xl border-2 transition-all"
                      style={{
                        borderColor: healthStatus === status.value ? 'var(--sage-500)' : 'var(--stone-200)',
                        background: healthStatus === status.value ? 'var(--sage-50)' : 'white',
                      }}
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: status.color }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: healthStatus === status.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        {status.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Health Notes — only show when not healthy */}
              <AnimatePresence>
                {healthStatus !== 'healthy' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    <label htmlFor="healthNotes" className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                      Health notes
                    </label>
                    <textarea
                      id="healthNotes"
                      value={healthNotes}
                      onChange={(e) => setHealthNotes(e.target.value)}
                      className="input min-h-[80px] resize-none"
                      placeholder="Describe any issues, e.g., yellowing leaves, aphids spotted..."
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date Planted */}
              <div>
                <label htmlFor="datePlanted" className="text-sm font-medium mb-2 block" style={{ color: 'var(--text-secondary)' }}>
                  Date planted (optional)
                </label>
                <input
                  id="datePlanted"
                  type="date"
                  value={datePlanted}
                  onChange={(e) => setDatePlanted(e.target.value)}
                  className="input"
                  style={{ maxWidth: '200px' }}
                />
              </div>

              {/* Error */}
              {error && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: 'rgba(199, 81, 70, 0.1)',
                    color: 'var(--error)',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Update Button */}
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isUpdating || !hasChanges}
                className="btn btn-primary w-full flex items-center justify-center gap-2"
                style={{
                  opacity: (!hasChanges && !isUpdating) ? 0.5 : 1,
                }}
              >
                {isUpdating ? (
                  <>
                    <SpinningLeafLoader size="sm" />
                    Regenerating care plan...
                  </>
                ) : (
                  <>
                    <Icon name="ArrowsClockwise" size={18} weight="light" />
                    {plant.plant_state ? 'Update & refresh care plan' : 'Set state & generate care plan'}
                  </>
                )}
              </button>

              {hasChanges && !isUpdating && (
                <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                  This will regenerate your care plan based on the current state
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
