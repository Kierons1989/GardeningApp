'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Plant } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import { formatFullLocation } from '@/lib/utils/formatters'

interface CultivarRowProps {
  plant: Plant
  topLevel: string
}

export default function CultivarRow({ plant, topLevel }: CultivarRowProps) {
  const displayName = plant.cultivar_name || plant.name || 'Unnamed variety'

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="flex items-center gap-3 p-3 rounded-lg transition-colors"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--stone-50)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ background: 'var(--sage-50)' }}
      >
        {plant.photo_url ? (
          <Image
            src={plant.photo_url}
            alt={displayName}
            width={40}
            height={40}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          getPlantTypeIcon(topLevel, 'w-5 h-5', { color: 'var(--sage-500)' })
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-medium text-sm truncate"
          style={{ color: 'var(--text-primary)' }}
        >
          {displayName}
        </p>
        {(plant.location_type || plant.area) && (
          <p
            className="text-xs truncate"
            style={{ color: 'var(--text-muted)' }}
          >
            {formatFullLocation(plant.location_type, plant.location_custom, plant.location_protection, plant.area)}
          </p>
        )}
      </div>
    </Link>
  )
}
