'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLawn } from '@/lib/queries/use-lawn'
import LawnDetail from '@/components/lawn/lawn-detail'
import { GrowingPlantLoader } from '@/components/ui/botanical-loader'
import Icon from '@/components/ui/icon'

function LawnPageContent() {
  const { data: lawn, isLoading } = useLawn()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <GrowingPlantLoader size="lg" />
      </div>
    )
  }

  // No lawn yet - show setup prompt
  if (!lawn) {
    return <NoLawnState />
  }

  // Show lawn detail
  return <LawnDetail lawn={lawn} />
}

function NoLawnState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-4xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Lawn Care
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Get personalised lawn care guidance for UK conditions
        </p>
      </div>

      {/* Empty State Card */}
      <div
        className="rounded-2xl p-12 text-center"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Illustration */}
        <div className="mb-6">
          <div
            className="w-32 h-32 mx-auto rounded-full flex items-center justify-center"
            style={{
              background: 'var(--lawn-100)',
              border: '3px dashed var(--lawn-300)',
            }}
          >
            <svg
              viewBox="0 0 64 64"
              className="w-16 h-16"
              fill="none"
              style={{ color: 'var(--lawn-600)' }}
            >
              {/* Grass blades */}
              <path
                d="M20 48 L22 32 L24 48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M28 48 L32 28 L36 48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M40 48 L42 32 L44 48"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Ground line */}
              <path
                d="M12 48 H52"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <h2
          className="text-2xl font-semibold mb-3"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Set up your lawn
        </h2>
        <p
          className="mb-8 max-w-md mx-auto"
          style={{ color: 'var(--text-secondary)' }}
        >
          Tell us about your lawn and we&apos;ll create a personalised care plan
          with UK-specific seasonal guidance for mowing, feeding, aerating, and more.
        </p>

        <Link
          href="/lawn/new"
          className="btn inline-flex items-center gap-2"
          style={{
            background: 'var(--lawn-600)',
            color: 'white',
          }}
        >
          <Icon name="Plus" size={18} weight="light" className="w-5 h-5" />
          Set Up Your Lawn
        </Link>

        {/* Features preview */}
        <div className="mt-10 pt-8 border-t" style={{ borderColor: 'var(--stone-200)' }}>
          <p className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
            What you&apos;ll get:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--stone-50)' }}>
              <Icon name="Calendar" size={24} weight="light" style={{ color: 'var(--lawn-600)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Seasonal task calendar</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--stone-50)' }}>
              <Icon name="Scissors" size={24} weight="light" style={{ color: 'var(--lawn-600)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Mowing schedule</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-lg" style={{ background: 'var(--stone-50)' }}>
              <Icon name="Lightbulb" size={24} weight="light" style={{ color: 'var(--lawn-600)' }} />
              <span style={{ color: 'var(--text-secondary)' }}>Expert UK tips</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function LawnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <GrowingPlantLoader size="lg" />
      </div>
    }>
      <LawnPageContent />
    </Suspense>
  )
}
