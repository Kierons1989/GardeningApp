'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Icon from '@/components/ui/icon'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(7)
    const newToast: Toast = { id, message, type }

    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="pointer-events-auto rounded-xl px-5 py-4 shadow-xl max-w-sm"
              style={{
                background: 'white',
                border: `1px solid ${
                  toast.type === 'success'
                    ? 'var(--sage-200)'
                    : toast.type === 'error'
                    ? 'var(--error)'
                    : 'var(--stone-200)'
                }`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      toast.type === 'success'
                        ? 'var(--sage-100)'
                        : toast.type === 'error'
                        ? 'rgba(199, 81, 70, 0.1)'
                        : 'var(--stone-100)',
                  }}
                >
                  {toast.type === 'success' && (
                    <Icon name="Check" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--sage-600)' }} ariaLabel="success" />
                  )}
                  {toast.type === 'error' && (
                    <Icon name="X" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--error)' }} ariaLabel="error" />
                  )}
                  {toast.type === 'info' && (
                    <Icon name="Info" size={16} weight="light" className="w-4 h-4" style={{ color: 'var(--stone-600)' }} ariaLabel="info" />
                  )}
                </div>
                <p
                  className="flex-1 font-medium text-sm"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {toast.message}
                </p>
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Icon name="X" size={16} weight="light" className="w-4 h-4" ariaLabel="dismiss" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}
