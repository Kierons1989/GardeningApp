/**
 * Custom illustrated empty states with botanical theme
 */

import { motion } from 'framer-motion'

interface EmptyStateProps {
  className?: string
}

export function EmptyGardenIllustration({ className }: EmptyStateProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Pot */}
      <motion.path
        d="M60 120 L50 170 L150 170 L140 120 Z"
        fill="var(--earth-200)"
        stroke="var(--earth-600)"
        strokeWidth="2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      />
      <motion.ellipse
        cx="100"
        cy="120"
        rx="42"
        ry="8"
        fill="var(--earth-300)"
        stroke="var(--earth-600)"
        strokeWidth="2"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      />

      {/* Soil */}
      <motion.path
        d="M60 120 L62 135 L138 135 L140 120 Z"
        fill="var(--stone-600)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      />

      {/* Small sprout emerging */}
      <motion.g
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
      >
        <path
          d="M100 135 L100 105"
          stroke="var(--sage-600)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M100 115 Q90 110 85 115 Q90 120 100 118"
          fill="var(--sage-400)"
          stroke="var(--sage-600)"
          strokeWidth="1.5"
        />
        <path
          d="M100 115 Q110 110 115 115 Q110 120 100 118"
          fill="var(--sage-400)"
          stroke="var(--sage-600)"
          strokeWidth="1.5"
        />
      </motion.g>

      {/* Floating particles */}
      <motion.circle
        cx="70"
        cy="90"
        r="2"
        fill="var(--sage-300)"
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.circle
        cx="130"
        cy="95"
        r="2"
        fill="var(--sage-300)"
        animate={{
          y: [0, -10, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          delay: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </svg>
  )
}

export function NoTasksIllustration({ className }: EmptyStateProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Hammock between two plants */}
      <motion.g
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Left plant */}
        <path
          d="M40 150 L40 100"
          stroke="var(--sage-600)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="40" cy="95" r="12" fill="var(--sage-400)" />
        <circle cx="35" cy="90" r="8" fill="var(--sage-300)" />
        <circle cx="45" cy="88" r="8" fill="var(--sage-300)" />
      </motion.g>

      <motion.g
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Right plant */}
        <path
          d="M160 150 L160 100"
          stroke="var(--sage-600)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="160" cy="95" r="12" fill="var(--sage-400)" />
        <circle cx="155" cy="90" r="8" fill="var(--sage-300)" />
        <circle cx="165" cy="88" r="8" fill="var(--sage-300)" />
      </motion.g>

      {/* Hammock */}
      <motion.g
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <path
          d="M45 120 Q100 130 155 120"
          stroke="var(--earth-400)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M45 120 L45 110 M155 120 L155 110"
          stroke="var(--earth-600)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <motion.path
          d="M45 125 Q100 135 155 125"
          stroke="var(--earth-300)"
          strokeWidth="8"
          strokeLinecap="round"
          animate={{
            d: [
              'M45 125 Q100 135 155 125',
              'M45 125 Q100 138 155 125',
              'M45 125 Q100 135 155 125',
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.g>

      {/* Sun */}
      <motion.g
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{ transformOrigin: '100px 50px' }}
      >
        <circle cx="100" cy="50" r="15" fill="var(--earth-500)" opacity="0.3" />
        <circle cx="100" cy="50" r="10" fill="var(--earth-400)" />
      </motion.g>
    </svg>
  )
}

export function NoResultsIllustration({ className }: EmptyStateProps) {
  return (
    <svg viewBox="0 0 200 200" className={className} fill="none">
      {/* Magnifying glass */}
      <motion.g
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: 'spring' }}
      >
        <circle
          cx="80"
          cy="80"
          r="35"
          fill="none"
          stroke="var(--sage-600)"
          strokeWidth="4"
        />
        <circle
          cx="80"
          cy="80"
          r="30"
          fill="var(--sage-50)"
          opacity="0.5"
        />
        <motion.line
          x1="105"
          y1="105"
          x2="135"
          y2="135"
          stroke="var(--sage-600)"
          strokeWidth="6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        />
      </motion.g>

      {/* Question marks floating */}
      <motion.text
        x="75"
        y="85"
        fontSize="24"
        fill="var(--text-muted)"
        fontWeight="600"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        ?
      </motion.text>

      {/* Small plant icons around magnifying glass */}
      <motion.g
        animate={{
          rotate: [0, 5, 0, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '140px 60px' }}
      >
        <path
          d="M140 70 L140 60"
          stroke="var(--sage-400)"
          strokeWidth="2"
        />
        <circle cx="140" cy="58" r="4" fill="var(--sage-300)" />
      </motion.g>

      <motion.g
        animate={{
          rotate: [0, -5, 0, 5, 0],
        }}
        transition={{
          duration: 4,
          delay: 1,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '50px 120px' }}
      >
        <path
          d="M50 130 L50 120"
          stroke="var(--sage-400)"
          strokeWidth="2"
        />
        <circle cx="50" cy="118" r="4" fill="var(--sage-300)" />
      </motion.g>
    </svg>
  )
}
