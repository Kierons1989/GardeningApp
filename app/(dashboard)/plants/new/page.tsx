'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import type { AICareProfile, PlantIdentification, PlantType } from '@/types/database'
import { getCategoryIcon } from '@/components/ui/botanical-icons'
import { SpinningLeafLoader, GrowingPlantLoader } from '@/components/ui/botanical-loader'
import Icon from '@/components/ui/icon'

type Step = 'input' | 'identifying' | 'confirm' | 'generating' | 'review'

export default function NewPlantPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('input')

  // Form state
  const [userInput, setUserInput] = useState('')
  const [area, setArea] = useState('')
  const [plantedIn, setPlantedIn] = useState<'ground' | 'pot' | 'raised_bed' | ''>('')
  const [notes, setNotes] = useState('')

  // Plant identification state
  const [identification, setIdentification] = useState<PlantIdentification | null>(null)
  const [plantType, setPlantType] = useState<PlantType | null>(null)

  // Editable taxonomy (after identification, user can edit)
  const [topLevel, setTopLevel] = useState('')
  const [middleLevel, setMiddleLevel] = useState('')
  const [cultivarName, setCultivarName] = useState('')
  const [growthHabit, setGrowthHabit] = useState<string[]>([])

  // AI state
  const [careProfile, setCareProfile] = useState<AICareProfile | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Loading state
  const [saving, setSaving] = useState(false)

  async function handleIdentifyPlant(e: React.FormEvent) {
    e.preventDefault()
    setStep('identifying')
    setAiError(null)

    try {
      const response = await fetch('/api/ai/identify-plant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInput }),
      })

      if (!response.ok) {
        throw new Error('Failed to identify plant')
      }

      const data: PlantIdentification = await response.json()
      setIdentification(data)
      setTopLevel(data.top_level)
      setMiddleLevel(data.middle_level)
      setCultivarName(data.cultivar_name || '')
      setGrowthHabit(data.growth_habit)
      setStep('confirm')
    } catch {
      setAiError('Failed to identify plant. Please try again.')
      setStep('input')
    }
  }

  async function handleConfirmAndGenerate() {
    setStep('generating')
    setAiError(null)

    try {
      // Step 1: Generate the care profile for this plant type
      const typeResponse = await fetch('/api/ai/generate-type-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topLevel,
          middleLevel,
          growthHabit,
          area: area || undefined,
          planted_in: plantedIn || undefined,
        }),
      })

      if (!typeResponse.ok) {
        const data = await typeResponse.json()
        throw new Error(data.error || 'Failed to generate care profile')
      }

      const { plantType: generatedType, careProfile: generatedProfile } = await typeResponse.json()

      // Step 2: Create the plant record linked to this plant type
      const plantResponse = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: generatedProfile?.common_name || middleLevel || userInput,
          common_name: generatedProfile?.common_name,
          species: generatedProfile?.species,
          plant_type_id: generatedType?.id,
          cultivar_name: cultivarName || undefined,
          area: area || undefined,
          planted_in: plantedIn || undefined,
          notes: notes || undefined,
        }),
      })

      if (!plantResponse.ok) {
        const data = await plantResponse.json()
        throw new Error(data.error || 'Failed to save plant')
      }

      router.push('/plants')
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      setAiError(err instanceof Error ? err.message : 'Failed to save plant. Please try again.')
      setStep('confirm') // Go back to confirm step so user can retry
    }
  }

  async function handleSave() {
    setSaving(true)
    setAiError(null)

    try {
      const response = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: careProfile?.common_name || middleLevel || userInput,
          common_name: careProfile?.common_name,
          species: careProfile?.species,
          plant_type_id: plantType?.id,
          cultivar_name: cultivarName || undefined,
          area: area || undefined,
          planted_in: plantedIn || undefined,
          notes: notes || undefined,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save plant')
      }

      router.push('/plants')
      router.refresh()
    } catch (err) {
      console.error('Save error:', err)
      setAiError(err instanceof Error ? err.message : 'Failed to save plant. Please try again.')
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      <Link
        href="/plants"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="CaretLeft" size={16} weight="light" className="w-4 h-4" ariaLabel="back" />
        Back to plants
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1
          className="text-4xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Add a Plant
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Tell us what you&apos;re growing and we&apos;ll create a personalised care schedule
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto">
        {['input', 'confirm', 'review'].map((s, i) => {
          const steps = ['input', 'identifying', 'confirm', 'generating', 'review']
          const currentIndex = steps.indexOf(step)
          const stepIndex = steps.indexOf(s)
          const isActive = currentIndex >= stepIndex

          return (
            <div key={s} className="flex items-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                style={{
                  background: isActive ? 'var(--sage-600)' : 'var(--stone-200)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                }}
              >
                {i + 1}
              </div>
              {i < 2 && (
                <div
                  className="w-12 h-0.5 mx-2"
                  style={{
                    background: currentIndex > stepIndex ? 'var(--sage-600)' : 'var(--stone-200)',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {aiError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 rounded-lg"
            style={{
              background: 'rgba(199, 81, 70, 0.1)',
              border: '1px solid rgba(199, 81, 70, 0.2)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {aiError}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* Step 1: Input */}
        {step === 'input' && (
          <motion.form
            key="input"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleIdentifyPlant}
            className="rounded-2xl p-8"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="space-y-6">
              <div>
                <label htmlFor="userInput" className="label">
                  What are you growing? *
                </label>
                <input
                  id="userInput"
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  className="input"
                  placeholder="e.g., Iceberg Rose, Cherry Tomato, Runaway Bride Hydrangea"
                  required
                />
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Type the name as it appears on the label - we&apos;ll identify it for you
                </p>
              </div>

              <div>
                <label htmlFor="area" className="label">
                  Where is it? (optional)
                </label>
                <input
                  id="area"
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="input"
                  placeholder="e.g., Front garden, Back border"
                />
              </div>

              <div>
                <label className="label">
                  Planted in (optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'ground', label: 'Ground', iconName: 'Mountains' },
                    { value: 'pot', label: 'Pot', iconName: 'Flower' },
                    { value: 'raised_bed', label: 'Raised bed', iconName: 'Stack' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPlantedIn(plantedIn === option.value ? '' : option.value as typeof plantedIn)}
                      className="p-4 rounded-xl border-2 transition-all text-center"
                      style={{
                        borderColor: plantedIn === option.value ? 'var(--sage-500)' : 'var(--stone-200)',
                        background: plantedIn === option.value ? 'var(--sage-50)' : 'white',
                        color: plantedIn === option.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                      }}
                    >
                      <div className="mb-2 flex justify-center">
                        <Icon
                          name={option.iconName}
                          size={24}
                          weight="light"
                          style={{ color: plantedIn === option.value ? 'var(--sage-600)' : 'var(--text-muted)' }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="notes" className="label">
                  Any notes? (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="e.g., Planted last spring"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" className="btn btn-primary">
                Identify plant
                <Icon name="ArrowRight" size={18} weight="light" className="w-5 h-5" ariaLabel="identify" />
              </button>
            </div>
          </motion.form>
        )}

        {/* Step 2: Identifying */}
        {step === 'identifying' && (
          <motion.div
            key="identifying"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--sage-100)' }}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <SpinningLeafLoader size="lg" />
              </div>
            </div>

            <h2
              className="text-2xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Identifying your plant
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Analyzing &quot;{userInput}&quot;...
            </p>
          </motion.div>
        )}

        {/* Step 3: Confirm Identification */}
        {step === 'confirm' && identification && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="rounded-2xl p-8"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <h2
              className="text-2xl font-semibold mb-6"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              We identified your plant
            </h2>

            <div className="space-y-6">
              <div
                className="p-6 rounded-xl"
                style={{ background: 'var(--sage-50)', border: '1px solid var(--sage-200)' }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="MagnifyingGlass" size={28} weight="light" className="w-10 h-10" style={{ color: 'var(--sage-600)' }} ariaLabel="identified" />
                  <div>
                    <div className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {topLevel}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {middleLevel}
                    </div>
                  </div>
                </div>

                {cultivarName && (
                  <div className="mb-4">
                    <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                      Variety: {cultivarName}
                    </span>
                  </div>
                )}

                {growthHabit.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {growthHabit.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ background: 'white', color: 'var(--sage-700)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Looks good? You can edit the details below if needed.
                </p>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="topLevel" className="label text-sm">
                      Plant Group
                    </label>
                    <input
                      id="topLevel"
                      type="text"
                      value={topLevel}
                      onChange={(e) => setTopLevel(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="middleLevel" className="label text-sm">
                      Plant Type
                    </label>
                    <input
                      id="middleLevel"
                      type="text"
                      value={middleLevel}
                      onChange={(e) => setMiddleLevel(e.target.value)}
                      className="input"
                    />
                  </div>

                  <div>
                    <label htmlFor="cultivarName" className="label text-sm">
                      Variety/Cultivar (optional)
                    </label>
                    <input
                      id="cultivarName"
                      type="text"
                      value={cultivarName}
                      onChange={(e) => setCultivarName(e.target.value)}
                      className="input"
                      placeholder="e.g., Iceberg"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="btn btn-secondary flex-1"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={handleConfirmAndGenerate}
                className="btn btn-primary flex-1"
              >
                Generate care profile
                <Icon name="ArrowRight" size={18} weight="light" className="w-5 h-5" ariaLabel="generate" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Generating Care Profile */}
        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-2xl p-12 text-center"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="relative w-28 h-28 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--sage-100)' }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <GrowingPlantLoader size="lg" />
              </div>
            </div>

            <h2
              className="text-2xl font-semibold mb-3"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              Creating your care profile
            </h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Generating UK-specific care advice for {middleLevel}...
            </p>
          </motion.div>
        )}

        {/* Step 5: Review */}
        {step === 'review' && careProfile && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <div className="flex items-start gap-4 mb-6">
                <div
                  className="w-16 h-16 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--sage-100)' }}
                >
                  <Icon name="Seedling" size={28} weight="light" className="w-8 h-8" style={{ color: 'var(--sage-600)' }} ariaLabel="plant" />
                </div>
                <div>
                  <h2
                    className="text-2xl font-semibold"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {careProfile.common_name || middleLevel}
                  </h2>
                  {careProfile.species && (
                    <p className="italic" style={{ color: 'var(--text-muted)' }}>
                      {careProfile.species}
                    </p>
                  )}
                  {growthHabit.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {growthHabit.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 rounded-full text-xs"
                          style={{ background: 'var(--sage-50)', color: 'var(--sage-700)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {careProfile.summary}
              </p>

              <div
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg"
                style={{ background: 'var(--sage-50)' }}
              >
                <Icon name="Thermometer" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--sage-600)' }} ariaLabel="hardiness" />
                <span className="text-sm font-medium" style={{ color: 'var(--sage-700)' }}>
                  {careProfile.uk_hardiness}
                </span>
              </div>
            </div>

            <div
              className="rounded-2xl p-8"
              style={{
                background: 'white',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <h3
                className="text-xl font-semibold mb-4"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                Care Schedule
              </h3>
              <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
                {careProfile.tasks.length} tasks throughout the year
              </p>

              <div className="space-y-3">
                {careProfile.tasks.slice(0, 4).map((task) => (
                  <div
                    key={task.key}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: 'var(--stone-50)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'var(--sage-100)' }}
                    >
                      {getCategoryIcon(task.category, 'w-5 h-5', { color: 'var(--sage-600)' })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                        {task.title}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {formatMonthRange(task.month_start, task.month_end)}
                      </p>
                    </div>
                  </div>
                ))}
                {careProfile.tasks.length > 4 && (
                  <p className="text-sm text-center pt-2" style={{ color: 'var(--text-muted)' }}>
                    +{careProfile.tasks.length - 4} more tasks
                  </p>
                )}
              </div>
            </div>

            {careProfile.tips.length > 0 && (
              <div
                className="rounded-2xl p-8"
                style={{
                  background: 'var(--earth-50)',
                  border: '1px solid var(--earth-200)',
                }}
              >
                <h3
                  className="text-lg font-semibold mb-4"
                  style={{
                    fontFamily: 'var(--font-cormorant)',
                    color: 'var(--text-primary)',
                  }}

                >
                  <Icon name="Lightbulb" size={20} weight="light" className="w-5 h-5 inline mr-2" style={{ color: 'var(--earth-600)' }} ariaLabel="tips" />
                  Quick Tips
                </h3>
                <ul className="space-y-2">
                  {careProfile.tips.slice(0, 3).map((tip, i) => (
                    <li key={i} className="flex gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span>•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('input')}
                className="btn btn-secondary flex-1"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary flex-1"
              >
                {saving ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    Add to garden
                    <Icon name="Check" size={20} weight="light" className="w-5 h-5" ariaLabel="add" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function formatMonthRange(start: number, end: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (start === end) {
    return months[start - 1]
  }
  return `${months[start - 1]} - ${months[end - 1]}`
}
