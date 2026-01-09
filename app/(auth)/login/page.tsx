'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
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
          Welcome back
        </h2>
        <p
          className="mb-8"
          style={{ color: 'var(--text-secondary)' }}
        >
          Sign in to continue to your garden
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
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="label mb-0">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-medium transition-colors"
              style={{ color: 'var(--sage-600)' }}
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input"
            placeholder="Enter your password"
            required
            autoComplete="current-password"
          />
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
            'Sign in'
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
            New to Tend?
          </span>
        </div>
      </div>

      {/* Sign Up Link */}
      <Link
        href="/signup"
        className="btn btn-secondary w-full h-12 text-base"
      >
        Create an account
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
