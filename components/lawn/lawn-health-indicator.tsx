'use client'

import type { LawnHealthStatus } from '@/types/lawn'

interface LawnHealthIndicatorProps {
  status: LawnHealthStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

export default function LawnHealthIndicator({
  status,
  size = 'md',
  showLabel = true,
}: LawnHealthIndicatorProps) {
  const config = {
    healthy: {
      dots: 3,
      color: 'var(--lawn-500)',
      label: 'Healthy',
    },
    needs_attention: {
      dots: 2,
      color: 'var(--earth-500)',
      label: 'Needs Attention',
    },
    struggling: {
      dots: 1,
      color: 'var(--coral)',
      label: 'Struggling',
    },
  }

  const { dots, color, label } = config[status]

  const dotSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  }

  const gapSizes = {
    sm: 'gap-1',
    md: 'gap-1.5',
    lg: 'gap-2',
  }

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center ${gapSizes[size]}`}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`${dotSizes[size]} rounded-full transition-colors`}
            style={{
              background: i <= dots ? color : 'var(--stone-200)',
            }}
          />
        ))}
      </div>
      {showLabel && (
        <span
          className={`font-medium ${textSizes[size]}`}
          style={{ color }}
        >
          {label}
        </span>
      )}
    </div>
  )
}
