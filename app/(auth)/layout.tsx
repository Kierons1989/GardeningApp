'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex bg-botanical">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg,
                var(--sage-600) 0%,
                var(--sage-700) 50%,
                var(--sage-800) 100%
              )
            `
          }}
        />

        {/* Decorative Circles */}
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{ background: 'rgba(255,255,255,0.05)' }}
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-64 h-64 rounded-full"
          style={{ background: 'rgba(255,255,255,0.03)' }}
          animate={{
            scale: [1, 1.15, 1],
            y: [0, -20, 0]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/4 w-48 h-48 rounded-full"
          style={{ background: 'var(--earth-400)', opacity: 0.15 }}
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1
              className="text-5xl font-semibold mb-6"
              style={{ fontFamily: 'var(--font-cormorant)' }}
            >
              Your garden,<br />
              remembered.
            </h1>
            <p
              className="text-lg opacity-90 max-w-md leading-relaxed"
              style={{ fontFamily: 'var(--font-dm-sans)' }}
            >
              A calm companion that knows your plants and tells you exactly
              what to do and when. No more forgotten watering schedules or
              missed pruning windows.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="flex -space-x-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-white/30"
                  style={{
                    background: `linear-gradient(135deg, var(--earth-${300 + i * 100}), var(--earth-${400 + i * 100}))`,
                  }}
                />
              ))}
            </div>
            <p className="text-sm opacity-80">
              Join thousands of UK gardeners
            </p>
          </motion.div>
        </div>

        {/* Botanical Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c-4 8-12 15-20 15 8 0 16 7 20 15 4-8 12-15 20-15-8 0-16-7-20-15z' fill='%23ffffff' fill-opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--sage-600)' }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.5 0 2.91-.33 4.19-.92" />
                <path d="M15 8c-2-2-5-2-7 0s-2 5 0 7c2 2 5 2 7 0" />
                <path d="M12 2v4" />
                <path d="M12 12v10" />
              </svg>
            </div>
            <span
              className="text-xl font-semibold"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)'
              }}
            >
              Garden Brain
            </span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <div
          className="p-6 text-center text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>
            By continuing, you agree to our{' '}
            <a href="#" className="underline hover:text-sage-600 transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-sage-600 transition-colors">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
