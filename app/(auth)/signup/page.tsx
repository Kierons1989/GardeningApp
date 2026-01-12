'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import Icon from '@/components/ui/icon'

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        {/* Success Icon */}
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: 'var(--sage-100)' }}
        >
          <Icon name="Check" size={28} weight="light" className="w-8 h-8" style={{ color: 'var(--sage-600)' }} ariaLabel="success" />
        </div>

        <h2
          className="text-3xl font-semibold mb-3"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)'
          }}
        >
          Check your email
        </h2>
        <p
          className="mb-8 max-w-sm mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          We&apos;ve sent a confirmation link to <strong>{email}</strong>.
          Click the link to activate your account.
        </p>

        <Link
          href="/login"
          className="btn btn-secondary"
        >
          Back to sign in
        </Link>
      </motion.div>
    )
  }

  return (
    <div>
      {/* Welcome Text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2
          className="text-3xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)'
          }}
        >
          Create your account
        </h2>
        <p
          className="mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Start your gardening journey with a personal companion
        </p>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mb-6 p-4 rounded-lg"
          style={{
            background: 'rgba(199, 81, 70, 0.1)',
            border: '1px solid rgba(199, 81, 70, 0.2)'
          }}
        >
          <p className="text-sm" style={{ color: 'var(--error)' }}>
            {error}
          </p>
        </motion.div>
      )}

      {/* Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="space-y-5"
      >
        <div>
          <label htmlFor="displayName" className="label">
            Your name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="How should we call you?"
            autoComplete="name"
          />
        </div>

        <div>
          <label htmlFor="email" className="label">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            placeholder="you@example.com"
            required
            autoComplete="email"
          />
        </div>

        <div>
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Create a strong password"
            required
            autoComplete="new-password"
            minLength={6}
          />
          <p
            className="mt-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            Must be at least 6 characters
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary w-full h-12 text-base relative overflow-hidden"
          style={{ marginTop: '24px' }}
        >
          {loading ? (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                style={{ animation: 'spin 1s linear infinite' }}
              />
            </motion.div>
          ) : (
            'Create account'
          )}
        </button>
      </motion.form>

      {/* Divider */}
      <div className="relative my-8">
        <div
          className="absolute inset-0 flex items-center"
          aria-hidden="true"
        >
          <div
            className="w-full border-t"
            style={{ borderColor: 'var(--stone-200)' }}
          />
        </div>
        <div className="relative flex justify-center">
          <span
            className="px-4 text-sm"
            style={{
              background: 'var(--bg-primary)',
              color: 'var(--text-muted)'
            }}
          >
            Already have an account?
          </span>
        </div>
      </div>

      {/* Sign In Link */}
      <Link
        href="/login"
        className="btn btn-secondary w-full h-12 text-base"
      >
        Sign in instead
      </Link>

      {/* Add keyframes for spinner */}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
