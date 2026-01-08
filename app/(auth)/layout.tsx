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
      {/* Left Panel - Decorative Hero */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Rich Gradient Background */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(165deg,
                #3d5a4c 0%,
                #2a4a3d 35%,
                #1a3329 70%,
                #142822 100%
              )
            `
          }}
        />

        {/* Warm Accent Glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 85% 20%, rgba(224, 122, 95, 0.15) 0%, transparent 45%),
              radial-gradient(ellipse at 15% 80%, rgba(212, 164, 122, 0.1) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 50%, rgba(93, 125, 102, 0.15) 0%, transparent 60%)
            `
          }}
        />

        {/* Grain Texture Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Scattered Botanical Marks */}
        {[
          { top: '12%', left: '8%', size: 40, rotation: -15, opacity: 0.08, delay: 0.2 },
          { top: '25%', left: '70%', size: 32, rotation: 25, opacity: 0.07, delay: 0.4 },
          { top: '55%', left: '5%', size: 28, rotation: 45, opacity: 0.06, delay: 0.3 },
          { top: '70%', left: '75%', size: 36, rotation: -30, opacity: 0.08, delay: 0.5 },
          { top: '85%', left: '25%', size: 24, rotation: 10, opacity: 0.06, delay: 0.6 },
          { top: '40%', left: '85%', size: 30, rotation: -45, opacity: 0.07, delay: 0.35 },
        ].map((leaf, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              top: leaf.top,
              left: leaf.left,
              width: leaf.size,
              height: leaf.size,
              opacity: leaf.opacity,
              transform: `rotate(${leaf.rotation}deg)`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: leaf.opacity, scale: 1 }}
            transition={{ duration: 1, delay: leaf.delay }}
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path
                d="M12 20V12M12 12C12 12 7 10 4 5C9 5 12 8 12 12Z"
                stroke="#f5efe6"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.div>
        ))}

        {/* Small dots for texture */}
        {[
          { top: '18%', left: '45%', size: 3 },
          { top: '35%', left: '15%', size: 2 },
          { top: '60%', left: '60%', size: 3 },
          { top: '75%', left: '40%', size: 2 },
          { top: '45%', left: '30%', size: 2 },
        ].map((dot, i) => (
          <motion.div
            key={`dot-${i}`}
            className="absolute rounded-full"
            style={{
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              background: 'rgba(245,239,230,0.12)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
          />
        ))}

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16">
          {/* Logo */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,239,230,0.12)', backdropFilter: 'blur(8px)' }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="#f5efe6"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {/* Distinctive single leaf with elegant curve */}
                  <path d="M12 21V12" />
                  <path d="M12 12C12 12 8 10 6 6C10 6 12 8 12 12" />
                  <path d="M12 8C12 8 14 5 18 4C17 8 14 10 12 12" />
                </svg>
              </div>
              <span
                className="text-2xl font-medium tracking-wide"
                style={{ fontFamily: 'var(--font-cormorant)', letterSpacing: '0.02em', color: '#f5efe6' }}
              >
                Tend
              </span>
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h1
              className="text-[4.5rem] font-medium mb-8 leading-[1.1] tracking-tight"
              style={{ fontFamily: 'var(--font-cormorant)', color: '#f5efe6' }}
            >
              Grow with<br />
              <span style={{ color: '#e8c0a0' }}>confidence.</span>
            </h1>
            <p
              className="text-[1.2rem] max-w-sm leading-relaxed"
              style={{ fontFamily: 'var(--font-crimson)', color: 'rgba(245,239,230,0.92)' }}
            >
              Your calm companion that knows your plants and tells you exactly
              what to do and when.
            </p>
          </motion.div>

          {/* Decorative Line */}
          <motion.div
            className="mt-16 w-12 h-px"
            style={{ background: 'rgba(232, 192, 160, 0.4)' }}
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 48, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          />

          {/* Tagline */}
          <motion.p
            className="mt-6 text-sm tracking-wide uppercase"
            style={{ color: 'rgba(245,239,230,0.55)', letterSpacing: '0.15em' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            For UK gardeners
          </motion.p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--sage-600)' }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 21V12" />
                <path d="M12 12C12 12 8 10 6 6C10 6 12 8 12 12" />
                <path d="M12 8C12 8 14 5 18 4C17 8 14 10 12 12" />
              </svg>
            </div>
            <span
              className="text-xl font-medium"
              style={{
                fontFamily: 'var(--font-cormorant)',
                color: 'var(--text-primary)',
                letterSpacing: '0.02em'
              }}
            >
              Tend
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
