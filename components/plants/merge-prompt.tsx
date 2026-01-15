'use client'

import { motion } from 'framer-motion'
import Icon from '@/components/ui/icon'

interface MergePromptProps {
  plantTypeName: string
  existingCultivars: string[]
  onAddToExisting: () => void
  onCreateSeparate: () => void
}

export default function MergePrompt({
  plantTypeName,
  existingCultivars,
  onAddToExisting,
  onCreateSeparate,
}: MergePromptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-6"
      style={{ background: 'white', boxShadow: 'var(--shadow-md)' }}
    >
      <div className="flex items-start gap-4 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ background: 'var(--sage-100)' }}
        >
          <Icon
            name="Plant"
            size={24}
            weight="light"
            style={{ color: 'var(--sage-600)' }}
          />
        </div>
        <div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{
              fontFamily: 'var(--font-cormorant)',
              color: 'var(--text-primary)',
            }}
          >
            You already have {plantTypeName}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {existingCultivars.length > 0
              ? `Current varieties: ${existingCultivars.join(', ')}`
              : 'Would you like to add another variety to this plant type?'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddToExisting}
          className="p-4 rounded-xl border-2 transition-all text-left"
          style={{ borderColor: 'var(--stone-200)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--sage-500)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--stone-200)'
          }}
        >
          <Icon
            name="Plus"
            size={20}
            weight="light"
            style={{ color: 'var(--sage-600)' }}
          />
          <p
            className="font-medium mt-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Add as new variety
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Groups with existing {plantTypeName}
          </p>
        </button>

        <button
          onClick={onCreateSeparate}
          className="p-4 rounded-xl border-2 transition-all text-left"
          style={{ borderColor: 'var(--stone-200)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--stone-300)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--stone-200)'
          }}
        >
          <Icon
            name="Copy"
            size={20}
            weight="light"
            style={{ color: 'var(--text-muted)' }}
          />
          <p
            className="font-medium mt-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Create separate
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Keep as individual entry
          </p>
        </button>
      </div>
    </motion.div>
  )
}
