'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'
import { ToastProvider } from '@/components/ui/toast'
import Icon from '@/components/ui/icon'

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: <Icon name="House" size={20} weight="light" className="w-5 h-5" ariaLabel="Dashboard" />,
  },
  {
    href: '/plants',
    label: 'My Plants',
    icon: <Icon name="Seedling" size={20} weight="light" className="w-5 h-5" ariaLabel="My Plants" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Icon name="Gear" size={20} weight="light" className="w-5 h-5" ariaLabel="Settings" />,
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
    <ToastProvider>
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
          <Link href="/">
            <Image
              src="/tend-logo.svg"
              alt="Tend"
              width={167}
              height={63}
              className="h-7 w-auto"
            />
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
        <Link href="/">
          <Image
            src="/tend-logo.svg"
            alt="Tend"
            width={167}
            height={63}
            className="h-7 w-auto"
          />
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ background: 'var(--stone-100)' }}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <Icon name="X" size={20} weight="light" ariaLabel="close menu" />
          ) : (
            <Icon name="List" size={20} weight="light" ariaLabel="open menu" />
          )}
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
              className="absolute right-0 top-16 bottom-0 w-72 flex flex-col"
              style={{ background: 'white' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Profile Header */}
              <div className="p-4 border-b" style={{ borderColor: 'var(--stone-200)' }}>
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--stone-50)' }}>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
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
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      View profile
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-4">
                <ul className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <li key={item.href} className="relative">
                        <Link
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
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
                              layoutId="mobileActiveNav"
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

              {/* Sign Out */}
              <div className="p-4 border-t" style={{ borderColor: 'var(--stone-200)' }}>
                <button
                  onClick={handleSignOut}
                  className="w-full btn btn-secondary"
                >
                  <Icon name="SignOut" size={18} weight="light" ariaLabel="sign out" />
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
    </ToastProvider>
  )
}
