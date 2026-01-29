'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { AITask } from '@/types/database'
import { getCategoryColor } from '@/lib/utils/category-colors'
import Icon from '@/components/ui/icon'

interface SeasonalCareCalendarProps {
  tasks: AITask[]
}

type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface SeasonConfig {
  name: string
  months: number[]
  monthNames: string[]
  iconName: string
}

const SEASONS: Record<Season, SeasonConfig> = {
  spring: {
    name: 'Spring',
    months: [3, 4, 5],
    monthNames: ['March', 'April', 'May'],
    iconName: 'Plant',
  },
  summer: {
    name: 'Summer',
    months: [6, 7, 8],
    monthNames: ['June', 'July', 'August'],
    iconName: 'Sun',
  },
  autumn: {
    name: 'Autumn',
    months: [9, 10, 11],
    monthNames: ['September', 'October', 'November'],
    iconName: 'Leaf',
  },
  winter: {
    name: 'Winter',
    months: [12, 1, 2],
    monthNames: ['December', 'January', 'February'],
    iconName: 'Snowflake',
  },
}

const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter']

function getCurrentSeason(): Season {
  const month = new Date().getMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'autumn'
  return 'winter'
}

function getTasksForMonth(tasks: AITask[], month: number): AITask[] {
  return tasks.filter((task) => {
    const { month_start, month_end } = task
    if (month_start <= month_end) {
      return month >= month_start && month <= month_end
    }
    // Wraps around year (e.g., November to February)
    return month >= month_start || month <= month_end
  })
}

export default function SeasonalCareCalendar({ tasks }: SeasonalCareCalendarProps) {
  const currentMonth = new Date().getMonth() + 1
  const [selectedSeason, setSelectedSeason] = useState<Season>(getCurrentSeason)
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(() => new Set([currentMonth]))
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

  const seasonConfig = SEASONS[selectedSeason]

  // Get tasks organized by month for the selected season
  const tasksByMonth = useMemo(() => {
    return seasonConfig.months.map((month, index) => ({
      month,
      monthName: seasonConfig.monthNames[index],
      tasks: getTasksForMonth(tasks, month),
      isCurrent: month === currentMonth,
    }))
  }, [tasks, seasonConfig, currentMonth])

  // Count total tasks per season for the badges
  const taskCountBySeason = useMemo(() => {
    const counts: Record<Season, number> = {
      spring: 0,
      summer: 0,
      autumn: 0,
      winter: 0,
    }

    SEASON_ORDER.forEach((season) => {
      const seasonMonths = SEASONS[season].months
      const uniqueTasks = new Set<string>()
      seasonMonths.forEach((month) => {
        getTasksForMonth(tasks, month).forEach((task) => uniqueTasks.add(task.key))
      })
      counts[season] = uniqueTasks.size
    })

    return counts
  }, [tasks])

  const toggleMonth = (month: number) => {
    setExpandedMonths((prev) => {
      const next = new Set(prev)
      if (next.has(month)) {
        next.delete(month)
      } else {
        next.add(month)
      }
      return next
    })
  }

  const toggleTask = (taskKey: string) => {
    setExpandedTasks((prev) => {
      const next = new Set(prev)
      if (next.has(taskKey)) {
        next.delete(taskKey)
      } else {
        next.add(taskKey)
      }
      return next
    })
  }

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season)
    // Auto-expand current month if switching to current season
    if (season === getCurrentSeason()) {
      setExpandedMonths(new Set([currentMonth]))
    } else {
      // Expand first month of the season by default
      setExpandedMonths(new Set([SEASONS[season].months[0]]))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mt-4 sm:mt-6 rounded-2xl overflow-hidden"
      style={{
        background: 'white',
        boxShadow: 'var(--shadow-md)',
      }}
    >
      {/* Header */}
      <div className="p-4 sm:p-6 pb-0 sm:pb-0">
        <div className="flex items-center gap-2 mb-4">
          <Icon
            name="Calendar"
            size={20}
            weight="light"
            className="w-5 h-5"
            style={{ color: 'var(--sage-600)' }}
            ariaLabel="calendar"
          />
          <h2
            className="text-xl font-semibold"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            Care Calendar
          </h2>
        </div>

        {/* Season Selector */}
        <div className="flex gap-2 pb-4 sm:pb-6">
          {SEASON_ORDER.map((season) => {
            const config = SEASONS[season]
            const isSelected = season === selectedSeason
            const isCurrent = season === getCurrentSeason()
            const taskCount = taskCountBySeason[season]

            return (
              <button
                key={season}
                onClick={() => handleSeasonChange(season)}
                className="flex-1 relative py-2.5 px-2 sm:px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: isSelected ? 'var(--sage-600)' : 'var(--stone-100)',
                  color: isSelected ? 'white' : 'var(--text-secondary)',
                  border: isCurrent && !isSelected ? '2px solid var(--sage-300)' : '2px solid transparent',
                }}
              >
                <Icon
                  name={config.iconName}
                  size={16}
                  weight={isSelected ? 'fill' : 'light'}
                  className="flex-shrink-0"
                />
                <span className="hidden sm:inline">{config.name}</span>

                {/* Task count badge */}
                {taskCount > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center text-xs font-medium rounded-full px-1.5"
                    style={{
                      background: isSelected ? 'white' : 'var(--sage-600)',
                      color: isSelected ? 'var(--sage-700)' : 'white',
                    }}
                  >
                    {taskCount}
                  </span>
                )}

                {/* Current season indicator */}
                {isCurrent && !isSelected && (
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ background: 'var(--sage-500)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Season Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedSeason}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="px-4 sm:px-6 pb-4 sm:pb-6"
        >
          <div className="space-y-3">
            {tasksByMonth.map(({ month, monthName, tasks: monthTasks, isCurrent }) => {
              const isExpanded = expandedMonths.has(month)
              const hasNoTasks = monthTasks.length === 0

              return (
                <div
                  key={month}
                  className="rounded-xl overflow-hidden"
                  style={{
                    background: 'var(--stone-50)',
                    border: isCurrent ? '2px solid var(--sage-300)' : '1px solid var(--stone-200)',
                  }}
                >
                  {/* Month Header */}
                  <button
                    onClick={() => toggleMonth(month)}
                    className="w-full flex items-center justify-between p-4 text-left transition-colors hover:bg-stone-100"
                  >
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-semibold text-base"
                        style={{
                          fontFamily: 'var(--font-cormorant)',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {monthName}
                      </h3>
                      {isCurrent && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: 'var(--sage-100)',
                            color: 'var(--sage-700)',
                          }}
                        >
                          Now
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm"
                        style={{ color: hasNoTasks ? 'var(--text-muted)' : 'var(--text-secondary)' }}
                      >
                        {hasNoTasks ? 'No tasks' : `${monthTasks.length} task${monthTasks.length !== 1 ? 's' : ''}`}
                      </span>
                      <Icon
                        name="CaretDown"
                        size={16}
                        weight="light"
                        className="transition-transform"
                        style={{
                          color: 'var(--text-muted)',
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                        ariaLabel={isExpanded ? 'collapse' : 'expand'}
                      />
                    </div>
                  </button>

                  {/* Month Tasks */}
                  <AnimatePresence>
                    {isExpanded && monthTasks.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="px-4 pb-4 space-y-3"
                          style={{ borderTop: '1px solid var(--stone-200)' }}
                        >
                          <div className="pt-3 space-y-3">
                            {monthTasks.map((task) => {
                              const taskKey = `${month}-${task.key}`
                              const isTaskExpanded = expandedTasks.has(taskKey)

                              return (
                                <div
                                  key={task.key}
                                  className="rounded-lg overflow-hidden"
                                  style={{
                                    background: 'white',
                                    border: '1px solid var(--stone-200)',
                                  }}
                                >
                                  <div className="p-3 sm:p-4">
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
                                      <span
                                        className="px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 self-start"
                                        style={{
                                          background: getCategoryColor(task.category).bg,
                                          color: getCategoryColor(task.category).text,
                                        }}
                                      >
                                        {task.category.replace(/_/g, ' ')}
                                      </span>
                                      <div className="flex-1">
                                        <h4
                                          className="font-semibold mb-1"
                                          style={{ color: 'var(--text-primary)' }}
                                        >
                                          {task.title}
                                        </h4>
                                        {task.why_this_matters && (
                                          <p
                                            className="text-sm leading-relaxed"
                                            style={{ color: 'var(--text-secondary)' }}
                                          >
                                            {task.why_this_matters}
                                          </p>
                                        )}
                                      </div>
                                    </div>

                                    {task.how_to && (
                                      <button
                                        onClick={() => toggleTask(taskKey)}
                                        className="mt-3 flex items-center gap-2 text-sm font-medium transition-colors"
                                        style={{ color: 'var(--sage-600)' }}
                                      >
                                        <Icon
                                          name="CaretRight"
                                          size={16}
                                          weight="light"
                                          className="w-4 h-4 transition-transform"
                                          style={{
                                            transform: isTaskExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                                          }}
                                          ariaLabel="expand"
                                        />
                                        <span className="hidden sm:inline">
                                          {isTaskExpanded ? 'Hide detailed instructions' : 'Show detailed instructions'}
                                        </span>
                                        <span className="sm:hidden">
                                          {isTaskExpanded ? 'Hide instructions' : 'Show instructions'}
                                        </span>
                                      </button>
                                    )}
                                  </div>

                                  <AnimatePresence>
                                    {isTaskExpanded && task.how_to && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{
                                          borderTop: '1px solid var(--stone-200)',
                                          background: 'var(--stone-50)',
                                        }}
                                      >
                                        <div className="p-3 sm:p-4">
                                          <h5
                                            className="font-semibold mb-3 flex items-center gap-2"
                                            style={{ color: 'var(--text-primary)' }}
                                          >
                                            <Icon
                                              name="BookOpen"
                                              size={16}
                                              weight="light"
                                              className="w-4 h-4"
                                              ariaLabel="how-to"
                                            />
                                            How to do this
                                          </h5>
                                          <div
                                            className="text-sm leading-relaxed space-y-3"
                                            style={{ color: 'var(--text-secondary)' }}
                                          >
                                            {task.how_to.split('\n\n').map((paragraph: string, i: number) => (
                                              <p key={i}>{paragraph}</p>
                                            ))}
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
