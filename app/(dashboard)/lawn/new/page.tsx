'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { GrowingPlantLoader } from '@/components/ui/botanical-loader'
import LawnSetupForm from '@/components/lawn/lawn-setup-form'
import Icon from '@/components/ui/icon'

function NewLawnPageContent() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Back Link */}
      <Link
        href="/lawn"
        className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors"
        style={{ color: 'var(--text-muted)' }}
      >
        <Icon name="CaretLeft" size={16} weight="light" className="w-4 h-4" />
        Back to lawn care
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-3xl font-semibold mb-2"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Set Up Your Lawn
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Tell us about your lawn so we can create a personalised care plan
        </p>
      </div>

      {/* Setup Form */}
      <LawnSetupForm />
    </div>
  )
}

export default function NewLawnPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <GrowingPlantLoader size="lg" />
      </div>
    }>
      <NewLawnPageContent />
    </Suspense>
  )
}
