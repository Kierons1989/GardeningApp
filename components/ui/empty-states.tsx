/**
 * Simple empty states using Phosphor icons
 */

import { Plant, CheckCircle, MagnifyingGlass } from 'phosphor-react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
  className?: string
}

export function EmptyGardenIllustration({ className }: EmptyStateProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
        style={{ background: 'var(--sage-100)' }}
      >
        <Plant size={64} weight="light" color="var(--sage-600)" />
      </div>
    </motion.div>
  )
}

export function NoTasksIllustration({ className }: EmptyStateProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
        style={{ background: 'var(--sage-100)' }}
      >
        <CheckCircle size={64} weight="light" color="var(--sage-600)" />
      </div>
    </motion.div>
  )
}

export function NoResultsIllustration({ className }: EmptyStateProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="w-32 h-32 rounded-full mx-auto flex items-center justify-center"
        style={{ background: 'var(--stone-100)' }}
      >
        <MagnifyingGlass size={64} weight="light" color="var(--stone-600)" />
      </div>
    </motion.div>
  )
}
