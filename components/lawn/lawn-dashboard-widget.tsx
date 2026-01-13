'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useLawn, useDaysSinceLastMow, useLogMowing } from '@/lib/queries/use-lawn'
import LawnHealthIndicator from './lawn-health-indicator'
import Icon from '@/components/ui/icon'
import type { LawnTask } from '@/types/lawn'

export function LawnDashboardWidget() {
  const { data: lawn, isLoading } = useLawn()
  const daysSinceLastMow = useDaysSinceLastMow()
  const logMowing = useLogMowing()

  const currentTasks = useMemo(() => {
    if (!lawn?.ai_care_profile?.tasks) return []

    const currentMonth = new Date().getMonth() + 1
    return lawn.ai_care_profile.tasks.filter((task: LawnTask) => {
      if (task.month_start <= task.month_end) {
        return currentMonth >= task.month_start && currentMonth <= task.month_end
      }
      return currentMonth >= task.month_start || currentMonth <= task.month_end
    }).slice(0, 2)
  }, [lawn])

  async function handleQuickMow() {
    if (!lawn) return
    await logMowing.mutateAsync({
      lawn_id: lawn.id,
      mowed_at: new Date().toISOString(),
    })
  }

  if (isLoading) {
    return (
      <div
        className="rounded-xl p-4 animate-pulse"
        style={{ background: 'white', border: '1px solid var(--stone-100)' }}
      >
        <div className="h-4 bg-stone-200 rounded w-24 mb-4" />
        <div className="h-16 bg-stone-100 rounded" />
      </div>
    )
  }

  if (!lawn) {
    return (
      <Link
        href="/lawn/new"
        className="flex items-center gap-4 p-4 rounded-xl card-hover"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--stone-100)',
        }}
      >
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--lawn-100)' }}
        >
          <Icon name="Leaf" size={20} weight="light" className="w-6 h-6" style={{ color: 'var(--lawn-600)' }} />
        </div>
        <div>
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            Set up lawn care
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Get AI lawn advice
          </p>
        </div>
      </Link>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--stone-100)',
      }}
    >
      <Link
        href="/lawn"
        className="flex items-center justify-between p-4 transition-colors hover:bg-stone-50"
        style={{ borderBottom: '1px solid var(--stone-100)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--lawn-100)' }}
          >
            <Icon name="Leaf" size={18} weight="light" className="w-5 h-5" style={{ color: 'var(--lawn-600)' }} />
          </div>
          <div>
            <h3
              className="font-medium"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              {lawn.name}
            </h3>
            <div className="flex items-center gap-2">
              <LawnHealthIndicator status={lawn.health_status} size="sm" showLabel={false} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {lawn.health_status === 'healthy' ? 'Healthy' : lawn.health_status === 'needs_attention' ? 'Needs attention' : 'Struggling'}
              </span>
            </div>
          </div>
        </div>
        <Icon name="CaretRight" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
      </Link>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>
              Last Mowed
            </p>
            <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
              {daysSinceLastMow === null
                ? 'Not logged'
                : daysSinceLastMow === 0
                  ? 'Today'
                  : daysSinceLastMow === 1
                    ? 'Yesterday'
                    : `${daysSinceLastMow} days ago`}
            </p>
          </div>
          <button
            onClick={handleQuickMow}
            disabled={logMowing.isPending}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 active:scale-95"
            style={{
              background: 'var(--lawn-100)',
              color: 'var(--lawn-700)',
            }}
          >
            {logMowing.isPending ? (
              <motion.div
                className="w-4 h-4 border-2 rounded-full"
                style={{ borderColor: 'var(--lawn-300)', borderTopColor: 'var(--lawn-700)' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              <Icon name="Scissors" size={16} weight="light" />
            )}
            Mowed
          </button>
        </div>

        {currentTasks.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
              Current Tasks
            </p>
            <div className="space-y-2">
              {currentTasks.map((task: LawnTask) => (
                <Link
                  key={task.key}
                  href="/lawn"
                  className="flex items-center gap-2 p-2 rounded-lg transition-colors hover:bg-stone-50"
                >
                  <div
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ background: 'var(--lawn-100)' }}
                  >
                    <Icon name="Check" size={12} weight="light" className="w-3 h-3" style={{ color: 'var(--lawn-600)' }} />
                  </div>
                  <span className="text-sm" style={{ color: 'var(--text-primary)' }}>
                    {task.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
