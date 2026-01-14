'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useProfile } from '@/lib/queries/use-profile'
import {
  getTimeOfDayGreeting,
  getCurrentSeason,
  getSeasonDisplayName,
  getSeasonalTip,
  getSeasonColor,
} from '@/lib/utils/time-greetings'
import Icon from '@/components/ui/icon'

interface JournalHeroProps {
  taskCount?: number
  allCaughtUp?: boolean
}

export default function JournalHero({ taskCount = 0, allCaughtUp = false }: JournalHeroProps) {
  const { data: profile } = useProfile()

  const greeting = getTimeOfDayGreeting()
  const season = getCurrentSeason()
  const seasonColors = getSeasonColor(season)

  const tip = useMemo(() => getSeasonalTip(season), [season])

  const displayName = profile?.display_name || 'Gardener'

  const seasonIcons: Record<string, string> = {
    spring: 'Flower',
    summer: 'Sun',
    autumn: 'Leaf',
    winter: 'Snowflake',
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="flex flex-col gap-4">
        <div>
          <h1
            className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-2 tracking-tight"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            {greeting}, {displayName}
          </h1>

          {allCaughtUp ? (
            <p
              className="text-lg"
              style={{ color: 'var(--sage-600)' }}
            >
              All caught up! Your garden is in great shape.
            </p>
          ) : taskCount > 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>
              You have {taskCount} task{taskCount !== 1 ? 's' : ''} to tend to
            </p>
          ) : null}
        </div>

        <div
          className="inline-flex items-center gap-3 px-4 py-3 rounded-xl w-fit"
          style={{
            background: seasonColors.bg,
            border: `1px solid ${seasonColors.accent}20`,
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: `${seasonColors.accent}20` }}
          >
            <Icon
              name={seasonIcons[season]}
              size={18}
              weight="fill"
              style={{ color: seasonColors.text }}
            />
          </div>
          <div className="flex flex-col">
            <span
              className="text-sm font-medium"
              style={{ color: seasonColors.text }}
            >
              {getSeasonDisplayName(season)}
            </span>
            <span
              className="text-sm"
              style={{
                color: seasonColors.text,
                opacity: 0.8,
                fontFamily: 'var(--font-crimson)',
                fontStyle: 'italic',
              }}
            >
              {tip}
            </span>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
