'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { Plant, TaskHistory } from '@/types/database'
import { useCalendarTasks, getMonthName } from './use-calendar-tasks'
import type { CalendarTask } from './use-calendar-tasks'
import Icon from '@/components/ui/icon'
import TaskActions from '@/components/tasks/task-actions'
import { getCategoryColor } from '@/lib/utils/category-colors'
import { getCategoryIcon } from '@/components/ui/botanical-icons'

interface MonthlyCalendarProps {
  plants: Plant[]
  taskHistory: TaskHistory[]
}

export default function MonthlyCalendar({ plants, taskHistory }: MonthlyCalendarProps) {
  const [viewingMonth, setViewingMonth] = useState(() => new Date())
  const [direction, setDirection] = useState(0)

  const tasks = useCalendarTasks(plants, taskHistory, viewingMonth)

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const isCurrentMonth =
    viewingMonth.getMonth() === currentMonth &&
    viewingMonth.getFullYear() === currentYear

  const handlePreviousMonth = useCallback(() => {
    setDirection(-1)
    setViewingMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() - 1)
      return newDate
    })
  }, [])

  const handleNextMonth = useCallback(() => {
    setDirection(1)
    setViewingMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + 1)
      return newDate
    })
  }, [])

  const handleGoToCurrentMonth = useCallback(() => {
    const now = new Date()
    setDirection(viewingMonth > now ? -1 : 1)
    setViewingMonth(now)
  }, [viewingMonth])

  // Group tasks by category for visual organization
  const tasksByCategory = tasks.reduce((acc, calendarTask) => {
    const category = calendarTask.task.category
    if (!acc[category]) acc[category] = []
    acc[category].push(calendarTask)
    return acc
  }, {} as Record<string, CalendarTask[]>)

  const categories = Object.keys(tasksByCategory).sort()

  // Month transition variants
  const monthVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 40 : -40,
      opacity: 0,
    }),
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="max-w-3xl"
    >
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{
            fontFamily: 'var(--font-cormorant)',
            color: 'var(--text-primary)',
          }}
        >
          Monthly Tasks
        </h2>

        {!isCurrentMonth && (
          <button
            onClick={handleGoToCurrentMonth}
            className="text-xs px-3 py-1.5 rounded-lg transition-all hover:bg-sage-100 active:scale-95"
            style={{ color: 'var(--sage-600)' }}
          >
            Back to {getMonthName(currentMonth)}
          </button>
        )}
      </div>

      {/* Calendar card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        {/* Month header with navigation */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            borderBottom: '1px solid var(--stone-200)',
          }}
        >
          <button
            onClick={handlePreviousMonth}
            className="p-2 rounded-lg transition-all hover:bg-stone-100 active:scale-95"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Previous month"
          >
            <Icon name="CaretLeft" size={20} weight="light" />
          </button>

          <div className="text-center">
            <h3
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
              }}
            >
              {getMonthName(viewingMonth.getMonth())}
              {viewingMonth.getFullYear() !== currentYear && (
                <span
                  className="ml-2 text-base font-normal"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {viewingMonth.getFullYear()}
                </span>
              )}
            </h3>
            {isCurrentMonth && (
              <span
                className="text-xs"
                style={{ color: 'var(--sage-600)' }}
              >
                Current month
              </span>
            )}
          </div>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-lg transition-all hover:bg-stone-100 active:scale-95"
            style={{ color: 'var(--text-secondary)' }}
            aria-label="Next month"
          >
            <Icon name="CaretRight" size={20} weight="light" />
          </button>
        </div>

        {/* Task count summary */}
        <div
          className="px-5 py-3 flex items-center gap-3"
          style={{
            background: 'var(--stone-50)',
            borderBottom: '1px solid var(--stone-200)',
          }}
        >
          <span
            className="text-sm"
            style={{ color: 'var(--text-secondary)' }}
          >
            {tasks.length === 0
              ? 'No tasks scheduled'
              : `${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} to do`}
          </span>

          {/* Category dots summary */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 ml-auto">
              {categories.slice(0, 5).map((category) => {
                const colors = getCategoryColor(category)
                const count = tasksByCategory[category].length
                return (
                  <div
                    key={category}
                    className="flex items-center gap-1"
                    title={`${category}: ${count} ${count === 1 ? 'task' : 'tasks'}`}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: colors.text }}
                    />
                  </div>
                )
              })}
              {categories.length > 5 && (
                <span
                  className="text-xs"
                  style={{ color: 'var(--text-muted)' }}
                >
                  +{categories.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Task list */}
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={`${viewingMonth.getFullYear()}-${viewingMonth.getMonth()}`}
            custom={direction}
            variants={monthVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            className="p-5"
          >
            {tasks.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: 'var(--text-muted)' }}
              >
                <Icon
                  name="CheckCircle"
                  size={40}
                  weight="light"
                  className="mx-auto mb-3 opacity-40"
                />
                <p className="text-sm">No seasonal tasks this month</p>
                <p className="text-xs mt-1 opacity-70">
                  Routine care like watering is shown above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((calendarTask, index) => (
                  <CalendarTaskCard
                    key={`${calendarTask.plant.id}-${calendarTask.task.key}`}
                    calendarTask={calendarTask}
                    index={index}
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.section>
  )
}

interface CalendarTaskCardProps {
  calendarTask: CalendarTask
  index: number
}

function CalendarTaskCard({ calendarTask, index }: CalendarTaskCardProps) {
  const { task, plant } = calendarTask
  const colors = getCategoryColor(task.category)

  const effortColors = {
    high: { border: 'var(--coral)' },
    medium: { border: 'var(--earth-400)' },
    low: { border: 'var(--sage-300)' },
  }
  const effortColor = effortColors[task.effort_level] || effortColors.medium

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      className="rounded-xl p-4"
      style={{
        background: 'var(--stone-50)',
        border: '1px solid var(--stone-200)',
        borderLeft: `4px solid ${effortColor.border}`,
      }}
    >
      {/* Header with icon and title */}
      <div className="flex items-start gap-3 mb-2">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg }}
        >
          {getCategoryIcon(task.category, 'w-4 h-4', { color: colors.text })}
        </div>

        <div className="flex-1 min-w-0">
          <h4
            className="font-medium text-sm leading-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </h4>
          <Link
            href={`/plants/${plant.id}`}
            className="text-xs hover:underline truncate block mt-0.5"
            style={{ color: 'var(--sage-600)' }}
          >
            {plant.name}
          </Link>
        </div>

        {/* Recurrence badge */}
        <span
          className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: 'var(--stone-100)',
            color: 'var(--text-muted)',
          }}
        >
          {task.recurrence_type === 'weekly_in_window'
            ? 'Weekly'
            : task.recurrence_type === 'monthly_in_window'
              ? 'Monthly'
              : 'Once'}
        </span>
      </div>

      {/* Brief description */}
      <p
        className="text-xs mb-3 line-clamp-2"
        style={{ color: 'var(--text-muted)' }}
      >
        {task.why_this_matters}
      </p>

      {/* Task actions */}
      <div className="flex items-center gap-1.5">
        <TaskActions
          plantId={plant.id}
          taskKey={task.key}
        />
      </div>
    </motion.div>
  )
}
