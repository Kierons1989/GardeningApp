/**
 * Botanical-themed loading animations
 */

import { motion } from 'framer-motion'

interface LoaderProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function GrowingPlantLoader({ className, size = 'md' }: LoaderProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  }

  return (
    <svg viewBox="0 0 100 100" className={`${sizes[size]} ${className}`} fill="none">
      {/* Stem growing */}
      <motion.path
        d="M50 80 L50 40"
        stroke="var(--sage-600)"
        strokeWidth="3"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: 'easeInOut',
        }}
      />

      {/* Left leaf */}
      <motion.path
        d="M50 55 Q40 50 35 55 Q40 60 50 58"
        fill="var(--sage-400)"
        stroke="var(--sage-600)"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.5,
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: '50px 55px' }}
      />

      {/* Right leaf */}
      <motion.path
        d="M50 55 Q60 50 65 55 Q60 60 50 58"
        fill="var(--sage-400)"
        stroke="var(--sage-600)"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.7,
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 1.5,
          ease: 'easeOut',
        }}
        style={{ transformOrigin: '50px 55px' }}
      />

      {/* Top bud */}
      <motion.circle
        cx="50"
        cy="38"
        r="6"
        fill="var(--sage-300)"
        stroke="var(--sage-600)"
        strokeWidth="1.5"
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1, 1.1, 1] }}
        transition={{
          delay: 1,
          duration: 0.6,
          repeat: Infinity,
          repeatDelay: 1.4,
          ease: 'easeOut',
        }}
      />
    </svg>
  )
}

export function SpinningLeafLoader({ className, size = 'md' }: LoaderProps) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <motion.svg
      viewBox="0 0 100 100"
      className={`${sizes[size]} ${className}`}
      fill="none"
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      <path
        d="M50 20 Q30 40 50 60 Q70 40 50 20 Z"
        fill="var(--sage-400)"
        stroke="var(--sage-600)"
        strokeWidth="2"
      />
      <path
        d="M50 20 L50 60"
        stroke="var(--sage-600)"
        strokeWidth="1.5"
      />
      <path
        d="M50 30 Q40 35 35 40"
        stroke="var(--sage-500)"
        strokeWidth="1"
      />
      <path
        d="M50 30 Q60 35 65 40"
        stroke="var(--sage-500)"
        strokeWidth="1"
      />
    </motion.svg>
  )
}

export function PulsingDotsLoader({ className }: LoaderProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="w-2 h-2 rounded-full"
          style={{ background: 'var(--sage-600)' }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [1, 0.5, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function WateringCanLoader({ className, size = 'md' }: LoaderProps) {
  const sizes = {
    sm: 'w-16 h-16',
    md: 'w-20 h-20',
    lg: 'w-28 h-28',
  }

  return (
    <svg viewBox="0 0 120 120" className={`${sizes[size]} ${className}`} fill="none">
      {/* Watering can */}
      <motion.g
        animate={{
          rotate: [-5, 5, -5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        style={{ transformOrigin: '60px 50px' }}
      >
        <rect
          x="40"
          y="40"
          width="40"
          height="30"
          rx="4"
          fill="var(--sage-400)"
          stroke="var(--sage-600)"
          strokeWidth="2"
        />
        <path
          d="M60 40 L60 30 L70 30 L70 40"
          stroke="var(--sage-600)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M80 50 L95 45 L95 55 L80 60"
          fill="var(--sage-500)"
          stroke="var(--sage-600)"
          strokeWidth="2"
        />
      </motion.g>

      {/* Water drops */}
      {[0, 1, 2].map((index) => (
        <motion.circle
          key={index}
          cx={48 + index * 12}
          cy="70"
          r="2"
          fill="var(--sage-600)"
          initial={{ opacity: 0, y: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: [0, 15, 30, 40],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: index * 0.2,
            ease: 'easeIn',
          }}
        />
      ))}
    </svg>
  )
}
