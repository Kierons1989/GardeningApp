'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { AICareProfile } from '@/types/database'

type Step = 'details' | 'generating' | 'review'

export default function NewPlantPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('details')

  // Form state
  const [name, setName] = useState('')
  const [area, setArea] = useState('')
  const [plantedIn, setPlantedIn] = useState<'ground' | 'pot' | 'raised_bed' | ''>('')
  const [notes, setNotes] = useState('')

  // AI state
  const [careProfile, setCareProfile] = useState<AICareProfile | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)

  // Loading state
  const [saving, setSaving] = useState(false)

  async function handleGenerateProfile(e: React.FormEvent) {
    e.preventDefault()
    setStep('generating')
    setAiError(null)

    try {
      const response = await fetch('/api/ai/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plantName: name,
          area,
          plantedIn,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate care profile')
      }

      const data = await response.json()
      setCareProfile(data)
      setStep('review')
    } catch {
      setAiError('Failed to generate care profile. Please try again.')
      setStep('details')
    }
  }

  async function handleSave() {
    setSaving(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error } = await supabase.from('plants').insert({
      user_id: user.id,
      name,
      common_name: careProfile?.common_name || null,
      species: careProfile?.species || null,
      plant_type: careProfile?.plant_type || null,
      area: area || null,
      planted_in: plantedIn || null,
      notes: notes || null,
      ai_care_profile: careProfile,
    })

    if (error) {
      setAiError('Failed to save plant. Please try again.')
      setSaving(false)
      return
    }

    router.push('/plants')
    router.refresh()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Back Link */}
      <Link
        href="/plants"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to plants
      </Link>

      {/* Header */}
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
          Tell us about your plant and we&apos;ll create a personalised care schedule
        </p>
      </motion.div>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {['details', 'generating', 'review'].map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              style={{
                background: step === s || ['generating', 'review'].indexOf(step) > ['details', 'generating', 'review'].indexOf(s)
                  ? 'var(--sage-600)'
                  : 'var(--stone-200)',
                color: step === s || ['generating', 'review'].indexOf(step) > ['details', 'generating', 'review'].indexOf(s)
                  ? 'white'
                  : 'var(--text-muted)',
              }}
            >
              {i + 1}
            </div>
            {i < 2 && (
              <div
                className="w-12 h-0.5 mx-2"
                style={{
                  background: ['generating', 'review'].indexOf(step) > i
                    ? 'var(--sage-600)'
                    : 'var(--stone-200)',
                }}
              />
            )}
          </div>
        ))}
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
        {step === 'details' && (
          <motion.form
            key="details"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleGenerateProfile}
            className="rounded-2xl p-8"
            style={{
              background: 'white',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <div className="space-y-6">
              {/* Plant Name */}
              <div>
                <label htmlFor="name" className="label">
                  What are you growing? *
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input"
                  placeholder="e.g., David Austin roses, Cherry tomatoes, Lawn"
                  required
                />
                <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  Be as specific as you like - variety names help us give better advice
                </p>
              </div>

              {/* Area */}
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
                  placeholder="e.g., Front garden, Back border, Greenhouse"
                />
              </div>

              {/* Planted In */}
              <div>
                <label className="label">
                  Planted in (optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'ground', label: 'Ground', icon: '🌍' },
                    { value: 'pot', label: 'Pot', icon: '🪴' },
                    { value: 'raised_bed', label: 'Raised bed', icon: '📦' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPlantedIn(plantedIn === option.value ? '' : option.value as typeof plantedIn)}
                      className="p-4 rounded-xl border-2 transition-all text-center"
                      style={{
                        borderColor: plantedIn === option.value ? 'var(--sage-500)' : 'var(--stone-200)',
                        background: plantedIn === option.value ? 'var(--sage-50)' : 'white',
                      }}
                    >
                      <span className="text-2xl mb-2 block">{option.icon}</span>
                      <span
                        className="text-sm font-medium"
                        style={{
                          color: plantedIn === option.value ? 'var(--sage-700)' : 'var(--text-secondary)',
                        }}
                      >
                        {option.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="label">
                  Any notes? (optional)
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-[100px] resize-none"
                  placeholder="e.g., Planted last spring, North-facing spot"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="submit" className="btn btn-primary">
                Generate care profile
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </motion.form>
        )}

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
            {/* Animated Plant Icon */}
            <div className="relative w-24 h-24 mx-auto mb-8">
              <motion.div
                className="absolute inset-0 rounded-full"
                style={{ background: 'var(--sage-100)' }}
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center"
              >
                <motion.span
                  className="text-4xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🌱
                </motion.span>
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
              We&apos;re generating UK-specific care advice for your {name}...
            </p>
          </motion.div>
        )}

        {step === 'review' && careProfile && (
          <motion.div
            key="review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Profile Summary Card */}
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
                  <span className="text-3xl">🌱</span>
                </div>
                <div>
                  <h2
                    className="text-2xl font-semibold"
                    style={{
                      fontFamily: 'var(--font-cormorant)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {careProfile.common_name || name}
                  </h2>
                  {careProfile.species && (
                    <p className="italic" style={{ color: 'var(--text-muted)' }}>
                      {careProfile.species}
                    </p>
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
                <span className="text-sm font-medium" style={{ color: 'var(--sage-700)' }}>
                  🌡️ {careProfile.uk_hardiness}
                </span>
              </div>
            </div>

            {/* Tasks Preview */}
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
                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
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

            {/* Tips Preview */}
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
                  💡 Quick Tips
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

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="btn btn-secondary flex-1"
              >
                Edit details
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
                    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
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

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    pruning: '✂️',
    feeding: '🌿',
    pest_control: '🐛',
    planting: '🌱',
    watering: '💧',
    harvesting: '🧺',
    winter_care: '❄️',
    general: '📋',
  }
  return icons[category] || '📋'
}

function formatMonthRange(start: number, end: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  if (start === end) {
    return months[start - 1]
  }
  return `${months[start - 1]} - ${months[end - 1]}`
}
