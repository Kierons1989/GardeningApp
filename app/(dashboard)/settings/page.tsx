'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { getZoneDescription, getZoneTemperatureRange } from '@/lib/climate/uk-zones'
import type { Profile } from '@/types/database'
import Icon from '@/components/ui/icon'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [location, setLocation] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setProfile(data)
        setLocation(data.location || '')
      }
      setLoading(false)
    }

    loadProfile()
  }, [supabase])

  async function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault()
    if (!location.trim()) {
      setMessage({ type: 'error', text: 'Please enter a location' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const response = await fetch('/api/profile/update-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location }),
      })

      if (!response.ok) {
        throw new Error('Failed to update location')
      }

      const data = await response.json()
      setProfile((prev) => prev ? { ...prev, location: data.location, climate_zone: data.climate_zone } : null)
      setMessage({ type: 'success', text: 'Location updated successfully!' })
    } catch {
      setMessage({ type: 'error', text: 'Failed to update location. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          className="w-12 h-12 border-4 rounded-full"
          style={{
            borderColor: 'var(--sage-200)',
            borderTopColor: 'var(--sage-600)',
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto"
    >
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
          Settings
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Manage your garden profile and preferences
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
          Location & Climate Zone
        </h2>

        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Tell us where you&apos;re gardening to get personalized, location-specific plant care advice.
        </p>

        <form onSubmit={handleSaveLocation} className="space-y-6">
          <div>
            <label htmlFor="location" className="label">
              Your Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input"
              placeholder="e.g., Birmingham, Edinburgh, Brighton"
            />
            <p className="mt-2 text-sm" style={{ color: 'var(--text-muted)' }}>
              Enter your town or city for best results
            </p>
          </div>

          {profile?.climate_zone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-6 rounded-xl"
              style={{
                background: 'var(--sage-50)',
                border: '1px solid var(--sage-200)',
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--sage-100)' }}
                >
                  <Icon name="Thermometer" size={20} weight="light" className="w-6 h-6" style={{ color: 'var(--sage-600)' }} ariaLabel="zone" />
                </div>
                <div className="flex-1">
                  <h3
                    className="font-semibold mb-2"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    USDA Zone {profile.climate_zone}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {getZoneDescription(profile.climate_zone)}
                  </p>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    Average minimum temperature: {getZoneTemperatureRange(profile.climate_zone)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 rounded-lg"
              style={{
                background: message.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(199, 81, 70, 0.1)',
                border: `1px solid ${message.type === 'success' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(199, 81, 70, 0.2)'}`,
              }}
            >
              <p
                className="text-sm"
                style={{ color: message.type === 'success' ? 'rgb(76, 175, 80)' : 'var(--error)' }}
              >
                {message.text}
              </p>
            </motion.div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? (
                <motion.div
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <>
                  Save Location
                  <Icon name="Check" size={20} weight="light" className="w-5 h-5" ariaLabel="save" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 p-6 rounded-xl"
        style={{
          background: 'white',
          border: '1px solid var(--stone-200)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Icon name="Globe" size={20} weight="light" className="w-5 h-5" style={{ color: 'var(--sage-600)' }} ariaLabel="about climate zones" />
          <h3
            className="font-semibold"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            About Climate Zones
          </h3>
        </div>
        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
          We use USDA hardiness zones to provide location-specific care advice. These zones are based on average minimum winter temperatures.
        </p>
        <ul className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
          <li>• <strong>Zone 7:</strong> Scottish Highlands and coldest areas</li>
          <li>• <strong>Zone 8:</strong> Most of England and Wales</li>
          <li>• <strong>Zone 9:</strong> Southern England and coastal areas</li>
          <li>• <strong>Zone 10:</strong> Scilly Isles and far southwest</li>
        </ul>
      </motion.div>
    </motion.div>
  )
}
