'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useCreateLawn } from '@/lib/queries/use-lawn'
import { useToast } from '@/components/ui/toast'
import Icon from '@/components/ui/icon'
import type { LawnSetupFormData } from '@/types/lawn'
import {
  LAWN_SIZES,
  LAWN_PRIMARY_USES,
  LAWN_GRASS_TYPES,
  LAWN_SOIL_TYPES,
  LAWN_CONDITIONS,
  LAWN_CARE_GOALS,
  LAWN_KNOWN_ISSUES,
} from '@/types/lawn'

type Step = 1 | 2 | 3

export default function LawnSetupForm() {
  const router = useRouter()
  const { showToast } = useToast()
  const createLawn = useCreateLawn()
  const [step, setStep] = useState<Step>(1)
  const [generatingProfile, setGeneratingProfile] = useState(false)

  // Form state
  const [formData, setFormData] = useState<Partial<LawnSetupFormData>>({
    name: '',
    size: 'medium',
    primary_use: 'family',
    grass_type: 'mixed',
    soil_type: 'unknown',
    current_condition: 'good',
    care_goal: 'family_friendly',
    known_issues: [],
    notes: '',
  })

  const updateField = <K extends keyof LawnSetupFormData>(
    field: K,
    value: LawnSetupFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleIssue = (issue: string) => {
    setFormData((prev) => {
      const issues = prev.known_issues || []
      if (issues.includes(issue)) {
        return { ...prev, known_issues: issues.filter((i) => i !== issue) }
      }
      return { ...prev, known_issues: [...issues, issue] }
    })
  }

  const canProceed = (): boolean => {
    if (step === 1) return !!formData.name?.trim()
    if (step === 2) return !!formData.grass_type && !!formData.soil_type
    return true
  }

  const handleNext = () => {
    if (step < 3) setStep((s) => (s + 1) as Step)
  }

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as Step)
  }

  const handleSubmit = async () => {
    if (!formData.name?.trim()) {
      showToast('Please enter a name for your lawn', 'error')
      return
    }

    setGeneratingProfile(true)

    try {
      // Generate AI care profile
      const profileResponse = await fetch('/api/ai/generate-lawn-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      let aiCareProfile = null
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        aiCareProfile = profileData.profile
      } else {
        console.warn('Failed to generate AI profile, creating lawn without it')
      }

      // Create the lawn
      const lawn = await createLawn.mutateAsync({
        ...(formData as LawnSetupFormData),
        ai_care_profile: aiCareProfile,
      })

      showToast('Lawn created successfully!', 'success')
      router.push(`/lawn/${lawn.id}`)
    } catch (error) {
      console.error('Error creating lawn:', error)
      showToast('Failed to create lawn. Please try again.', 'error')
    } finally {
      setGeneratingProfile(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-6 sm:p-8"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            Step {step} of 3
          </span>
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Grass & Soil'}
            {step === 3 && 'Goals & Issues'}
          </span>
        </div>
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ background: 'var(--stone-200)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'var(--lawn-500)' }}
            initial={{ width: '33%' }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Lawn Name */}
            <div>
              <label className="label">Lawn Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Back Garden, Front Lawn"
                value={formData.name || ''}
                onChange={(e) => updateField('name', e.target.value)}
              />
            </div>

            {/* Size */}
            <div>
              <label className="label">Approximate Size</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {LAWN_SIZES.map((size) => (
                  <button
                    key={size.value}
                    type="button"
                    onClick={() => updateField('size', size.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.size === size.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.size === size.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {size.label}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {size.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Use */}
            <div>
              <label className="label">Primary Use</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAWN_PRIMARY_USES.map((use) => (
                  <button
                    key={use.value}
                    type="button"
                    onClick={() => updateField('primary_use', use.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.primary_use === use.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.primary_use === use.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {use.label}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {use.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Grass Type */}
            <div>
              <label className="label">Grass Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAWN_GRASS_TYPES.map((grass) => (
                  <button
                    key={grass.value}
                    type="button"
                    onClick={() => updateField('grass_type', grass.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.grass_type === grass.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.grass_type === grass.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {grass.label}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {grass.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Soil Type */}
            <div>
              <label className="label">Soil Type</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAWN_SOIL_TYPES.map((soil) => (
                  <button
                    key={soil.value}
                    type="button"
                    onClick={() => updateField('soil_type', soil.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.soil_type === soil.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.soil_type === soil.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {soil.label}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {soil.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Current Condition */}
            <div>
              <label className="label">Current Condition</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LAWN_CONDITIONS.map((condition) => (
                  <button
                    key={condition.value}
                    type="button"
                    onClick={() => updateField('current_condition', condition.value)}
                    className="p-4 rounded-xl text-center transition-all"
                    style={{
                      background: formData.current_condition === condition.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.current_condition === condition.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
                      {condition.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Care Goal */}
            <div>
              <label className="label">What matters most to you?</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {LAWN_CARE_GOALS.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => updateField('care_goal', goal.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: formData.care_goal === goal.value ? 'var(--lawn-100)' : 'var(--stone-50)',
                      border: `2px solid ${formData.care_goal === goal.value ? 'var(--lawn-400)' : 'transparent'}`,
                    }}
                  >
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {goal.label}
                    </p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {goal.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Known Issues */}
            <div>
              <label className="label">Any known issues? (optional)</label>
              <div className="flex flex-wrap gap-2">
                {LAWN_KNOWN_ISSUES.map((issue) => (
                  <button
                    key={issue.value}
                    type="button"
                    onClick={() => toggleIssue(issue.value)}
                    className="px-4 py-2 rounded-full text-sm transition-all"
                    style={{
                      background: formData.known_issues?.includes(issue.value) ? 'var(--lawn-100)' : 'var(--stone-100)',
                      color: formData.known_issues?.includes(issue.value) ? 'var(--lawn-700)' : 'var(--text-secondary)',
                      border: `1px solid ${formData.known_issues?.includes(issue.value) ? 'var(--lawn-300)' : 'var(--stone-200)'}`,
                    }}
                  >
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="label">Additional notes (optional)</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Anything else we should know about your lawn?"
                value={formData.notes || ''}
                onChange={(e) => updateField('notes', e.target.value)}
                style={{ resize: 'none' }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--stone-200)' }}>
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="btn btn-secondary"
          >
            <Icon name="CaretLeft" size={18} weight="light" />
            Back
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="btn"
            style={{
              background: canProceed() ? 'var(--lawn-600)' : 'var(--stone-300)',
              color: 'white',
              opacity: canProceed() ? 1 : 0.6,
            }}
          >
            Next
            <Icon name="CaretRight" size={18} weight="light" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={generatingProfile || createLawn.isPending}
            className="btn"
            style={{
              background: 'var(--lawn-600)',
              color: 'white',
            }}
          >
            {generatingProfile || createLawn.isPending ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                Generating Care Plan...
              </>
            ) : (
              <>
                <Icon name="Sparkle" size={18} weight="light" />
                Generate Care Plan
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
