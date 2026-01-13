'use client'

import React from 'react'
import Icon from './icon'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div
          className="min-h-[400px] flex flex-col items-center justify-center p-8 rounded-xl"
          style={{ background: 'var(--stone-50)' }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
            style={{ background: 'var(--earth-100)' }}
          >
            <Icon name="Warning" size={32} weight="light" style={{ color: 'var(--earth-600)' }} />
          </div>
          <h2
            className="text-xl font-medium mb-2"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Something went wrong
          </h2>
          <p
            className="text-sm mb-6 text-center max-w-md"
            style={{ color: 'var(--text-muted)' }}
          >
            We encountered an unexpected error. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--sage-600)',
              color: 'white',
            }}
          >
            Refresh page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
