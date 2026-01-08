'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/plants',
    label: 'My Plants',
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22V8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5.5 11.5C5.5 9 7 4 12 4s6.5 5 6.5 7.5c0 3-2.5 4.5-6.5 4.5s-6.5-1.5-6.5-4.5z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 17c-2 0-4-1-4-3s3-5 7-5 7 3 7 5-2 3-4 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          setProfile(data)
        }
      }
    }

    getProfile()
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-botanical">
      {/* Desktop Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-64 hidden lg:flex flex-col border-r"
        style={{
          background: 'white',
          borderColor: 'var(--stone-200)',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--stone-200)' }}>
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--sage-600)' }}
            >
              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6"
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

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
                    style={{
                      background: isActive ? 'var(--sage-50)' : 'transparent',
                      color: isActive ? 'var(--sage-700)' : 'var(--text-secondary)',
                    }}
                  >
                    <span style={{ opacity: isActive ? 1 : 0.7 }}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute left-0 w-1 h-6 rounded-r"
                        style={{ background: 'var(--sage-600)' }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User Menu */}
        <div
          className="p-4 border-t"
          style={{ borderColor: 'var(--stone-200)' }}
        >
          <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--stone-50)' }}>
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: 'var(--sage-200)' }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: 'var(--sage-700)' }}
              >
                {profile?.display_name?.[0]?.toUpperCase() || 'G'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium truncate"
                style={{ color: 'var(--text-primary)' }}
              >
                {profile?.display_name || 'Gardener'}
              </p>
              <button
                onClick={handleSignOut}
                className="text-xs hover:underline"
                style={{ color: 'var(--text-muted)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header
        className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 border-b"
        style={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(8px)',
          borderColor: 'var(--stone-200)',
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
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
            className="text-lg font-medium"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
              letterSpacing: '0.02em'
            }}
          >
            Tend
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ background: 'var(--stone-100)' }}
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2">
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-40 pt-16"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-16 bottom-0 w-64"
              style={{ background: 'white' }}
              onClick={(e) => e.stopPropagation()}
            >
              <nav className="p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg"
                          style={{
                            background: isActive ? 'var(--sage-50)' : 'transparent',
                            color: isActive ? 'var(--sage-700)' : 'var(--text-secondary)',
                          }}
                        >
                          {item.icon}
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--stone-200)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full btn btn-secondary"
                >
                  Sign out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
