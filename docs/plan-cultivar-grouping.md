# Plan: Restructure Plants to Group Cultivars Under Plant Types

## Overview

Change the plant display from showing individual cultivars as separate cards to showing plant types (e.g., "Hybrid Tea Rose") as expandable cards with cultivars listed underneath. This reduces duplication and better represents that cultivars of the same type share care profiles.

## Current vs Proposed

**Current**: Card shows "Iceberg" with subtitle "Hybrid Tea Rose" - each cultivar is a separate card
**Proposed**: Card shows "Hybrid Tea Rose" - click to expand and see "Iceberg", "Peace", etc. listed below

## User Requirements

- **UI**: Expandable list - card shows plant type, click to expand and see cultivars listed below
- **Cultivar data**: Minimal - each cultivar has: name, photo, location/area, notes
- **Add flow**: Prompt to merge - if user already has a plant type, offer to add new cultivar under it
- **Migration**: Keep existing plants as-is, new structure only for newly added plants

## Data Model

The current database schema already supports this structure well:

**plant_types table**:
- `id`, `top_level` (e.g., "Rose"), `middle_level` (e.g., "Hybrid Tea Rose")
- `growth_habit`, `ai_care_profile` (shared care profile)

**plants table**:
- `id`, `plant_type_id` (links to plant_types)
- `cultivar_name` (e.g., "Iceberg")
- `photo_url` - **each cultivar has its own photo**
- `area`, `planted_in`, `notes`

Multiple plants can share the same `plant_type_id`, meaning they share the care profile but have individual photos, names, and locations.

---

## Implementation Steps

### 1. Add New Type Definition

**File**: `types/database.ts`

Add a new interface for grouped plant data:

```typescript
export interface PlantTypeGroup {
  plantType: PlantType
  cultivars: Plant[]  // Each Plant has its own photo_url, cultivar_name, area, notes
}
```

### 2. Create Grouping Utility

**New file**: `lib/utils/group-plants.ts`

Create a utility function that transforms `Plant[]` into `PlantTypeGroup[]`:
- Groups plants by `plant_type_id`
- Plants without `plant_type_id` remain as individual entries (backwards compatibility)
- Returns array sorted by top_level, then middle_level

```typescript
import type { Plant, PlantType, PlantTypeGroup } from '@/types/database'

export function groupPlantsByType(plants: Plant[]): PlantTypeGroup[] {
  const grouped = new Map<string, PlantTypeGroup>()
  const ungrouped: PlantTypeGroup[] = []

  for (const plant of plants) {
    if (plant.plant_type_id && plant.plant_types) {
      const key = plant.plant_type_id
      if (!grouped.has(key)) {
        grouped.set(key, {
          plantType: plant.plant_types,
          cultivars: [],
        })
      }
      grouped.get(key)!.cultivars.push(plant)
    } else {
      // Plants without plant_type_id become their own "group" of 1
      ungrouped.push({
        plantType: {
          id: plant.id,
          top_level: plant.name,
          middle_level: '',
          growth_habit: [],
          ai_care_profile: null,
          created_at: plant.created_at,
          updated_at: plant.updated_at,
        },
        cultivars: [plant],
      })
    }
  }

  // Sort groups by top_level, then middle_level
  const result = [...grouped.values()].sort((a, b) => {
    const topCompare = a.plantType.top_level.localeCompare(b.plantType.top_level)
    if (topCompare !== 0) return topCompare
    return a.plantType.middle_level.localeCompare(b.plantType.middle_level)
  })

  return [...result, ...ungrouped]
}
```

### 3. Create Cultivar Row Component

**New file**: `components/plants/cultivar-row.tsx`

A compact row for displaying a single cultivar within the expanded card. **Each cultivar displays its own photo**.

```typescript
'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { Plant } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'

interface CultivarRowProps {
  plant: Plant
  topLevel: string
}

export default function CultivarRow({ plant, topLevel }: CultivarRowProps) {
  const displayName = plant.cultivar_name || plant.name || 'Unnamed variety'

  return (
    <Link
      href={`/plants/${plant.id}`}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
    >
      {/* Individual cultivar photo */}
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
        <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
          {displayName}
        </p>
        {plant.area && (
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
            {plant.area}
          </p>
        )}
      </div>
    </Link>
  )
}
```

### 4. Create Plant Type Card Component

**New file**: `components/plants/plant-type-card.tsx`

Expandable card that replaces `PlantCard` in grouped views:

```typescript
'use client'

import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlantTypeGroup } from '@/types/database'
import { getPlantTypeIcon } from '@/components/ui/botanical-icons'
import Icon from '@/components/ui/icon'
import CultivarRow from './cultivar-row'

interface PlantTypeCardProps {
  group: PlantTypeGroup
  index: number
  defaultExpanded?: boolean
}

const PlantTypeCard = memo(function PlantTypeCard({
  group,
  index,
  defaultExpanded = false
}: PlantTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const { plantType, cultivars } = group
  const careProfile = plantType.ai_care_profile
  const taskCount = careProfile?.tasks?.length || 0
  const cultivarCount = cultivars.length

  const displayName = plantType.middle_level || plantType.top_level
  const subtitle = plantType.middle_level && plantType.top_level !== plantType.middle_level
    ? plantType.top_level
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.02, duration: 0.15 }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'white',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--stone-100)',
        }}
      >
        {/* Header - always visible */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-6 text-left hover:bg-stone-50 transition-colors"
        >
          <div className="flex items-start gap-4">
            {/* Plant Type Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'var(--sage-100)' }}
            >
              {getPlantTypeIcon(plantType.top_level, 'w-7 h-7', { color: 'var(--sage-600)' })}
            </div>

            {/* Plant Type Info */}
            <div className="flex-1 min-w-0">
              <h3
                className="font-medium text-lg truncate mb-1"
                style={{
                  fontFamily: 'var(--font-cormorant)',
                  color: 'var(--text-primary)',
                }}
              >
                {displayName}
              </h3>

              {subtitle && (
                <p className="text-sm truncate mb-2" style={{ color: 'var(--text-muted)' }}>
                  {subtitle}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {plantType.growth_habit?.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--sage-50)', color: 'var(--sage-700)' }}
                  >
                    {tag}
                  </span>
                ))}

                {taskCount > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{ background: 'var(--earth-100)', color: 'var(--earth-700)' }}
                  >
                    <Icon name="Clipboard" size={12} weight="light" ariaLabel="tasks" />
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            {/* Expand indicator */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {cultivarCount} {cultivarCount === 1 ? 'variety' : 'varieties'}
              </span>
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  name="CaretDown"
                  size={20}
                  weight="light"
                  style={{ color: 'var(--text-muted)' }}
                  ariaLabel={isExpanded ? 'collapse' : 'expand'}
                />
              </motion.div>
            </div>
          </div>
        </button>

        {/* Expanded cultivar list */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-4 pt-2 border-t"
                style={{ borderColor: 'var(--stone-100)' }}
              >
                <div className="space-y-1">
                  {cultivars.map((plant) => (
                    <CultivarRow
                      key={plant.id}
                      plant={plant}
                      topLevel={plantType.top_level}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

export default PlantTypeCard
```

### 5. Add usePlantTypeGroups Hook

**File**: `lib/queries/use-plants.ts`

Add a new hook that uses `usePlants` and transforms the result:

```typescript
import { useMemo } from 'react'
import { groupPlantsByType } from '@/lib/utils/group-plants'

export function usePlantTypeGroups() {
  const { data: plants, ...rest } = usePlants()

  const groups = useMemo(() => {
    if (!plants) return []
    return groupPlantsByType(plants)
  }, [plants])

  return { data: groups, ...rest }
}
```

### 6. Update PlantList Component

**File**: `components/plants/plant-list.tsx`

Key changes:
- Change `ViewMode` type from `'grouped' | 'grid'` to `'byType' | 'individual'`
- Import and use `groupPlantsByType` utility
- In `byType` mode, render `PlantTypeCard` for each group
- In `individual` mode, render existing `PlantCard` for each plant
- Update filtering to also search within `cultivar_name`
- Update view toggle button labels

The existing "grouped" mode groups by `top_level` category (e.g., "Rose") - this can remain as an option or be replaced. The new `byType` mode groups by `plant_type_id` (e.g., "Hybrid Tea Rose").

### 7. Create Merge Prompt Component

**New file**: `components/plants/merge-prompt.tsx`

Modal/dialog shown when user adds a plant and already has that plant type:

```typescript
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
          <Icon name="Plant" size={24} weight="light" style={{ color: 'var(--sage-600)' }} />
        </div>
        <div>
          <h3
            className="text-lg font-semibold mb-1"
            style={{ fontFamily: 'var(--font-cormorant)', color: 'var(--text-primary)' }}
          >
            You already have {plantTypeName}
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {existingCultivars.length > 0
              ? `Current varieties: ${existingCultivars.join(', ')}`
              : 'Would you like to add another variety to this plant type?'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddToExisting}
          className="p-4 rounded-xl border-2 transition-all text-left hover:border-sage-500"
          style={{ borderColor: 'var(--stone-200)' }}
        >
          <Icon name="Plus" size={20} weight="light" style={{ color: 'var(--sage-600)' }} />
          <p className="font-medium mt-2" style={{ color: 'var(--text-primary)' }}>
            Add as new variety
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Groups with existing {plantTypeName}
          </p>
        </button>

        <button
          onClick={onCreateSeparate}
          className="p-4 rounded-xl border-2 transition-all text-left hover:border-stone-300"
          style={{ borderColor: 'var(--stone-200)' }}
        >
          <Icon name="Copy" size={20} weight="light" style={{ color: 'var(--text-muted)' }} />
          <p className="font-medium mt-2" style={{ color: 'var(--text-primary)' }}>
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
```

### 8. Create Check Existing Type API

**New file**: `app/api/plants/check-type/route.ts`

GET endpoint that checks if user has plants of a given type:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const topLevel = request.nextUrl.searchParams.get('topLevel')
  const middleLevel = request.nextUrl.searchParams.get('middleLevel')

  if (!topLevel || !middleLevel) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
  }

  // Find plant_type matching the criteria
  const { data: plantType } = await supabase
    .from('plant_types')
    .select('id')
    .eq('top_level', topLevel)
    .eq('middle_level', middleLevel)
    .single()

  if (!plantType) {
    return NextResponse.json({ exists: false })
  }

  // Find user's plants with this type
  const { data: existingPlants } = await supabase
    .from('plants')
    .select('id, cultivar_name')
    .eq('user_id', user.id)
    .eq('plant_type_id', plantType.id)

  if (!existingPlants || existingPlants.length === 0) {
    return NextResponse.json({ exists: false })
  }

  return NextResponse.json({
    exists: true,
    plantTypeId: plantType.id,
    existingCultivars: existingPlants
      .map(p => p.cultivar_name)
      .filter(Boolean) as string[],
  })
}
```

### 9. Update New Plant Page

**File**: `app/(dashboard)/plants/new/page.tsx`

Add merge flow after plant identification:

1. Add new state: `existingTypeInfo` and `showMergePrompt`
2. After `topLevel` and `middleLevel` are set (in `handlePlantSelect` or after AI identification), call check-type API
3. If existing type found, show `MergePrompt` before proceeding to details
4. If user chooses "Add as new variety", store the existing `plantTypeId` to reuse
5. If user chooses "Create separate", proceed as normal (will create duplicate type entry or handle as needed)

Add this check after plant selection:

```typescript
// After setting topLevel and middleLevel
async function checkExistingType() {
  const res = await fetch(
    `/api/plants/check-type?topLevel=${encodeURIComponent(topLevel)}&middleLevel=${encodeURIComponent(middleLevel)}`
  )
  const data = await res.json()

  if (data.exists) {
    setExistingTypeInfo(data)
    setShowMergePrompt(true)
  } else {
    setStep('details')
  }
}
```

---

## Files Summary

### Files to Create

1. `lib/utils/group-plants.ts` - grouping utility function
2. `components/plants/cultivar-row.tsx` - individual cultivar display row
3. `components/plants/plant-type-card.tsx` - expandable plant type card
4. `components/plants/merge-prompt.tsx` - merge decision dialog
5. `app/api/plants/check-type/route.ts` - check existing types API

### Files to Modify

1. `types/database.ts` - add `PlantTypeGroup` interface
2. `lib/queries/use-plants.ts` - add `usePlantTypeGroups` hook
3. `components/plants/plant-list.tsx` - add grouped rendering mode
4. `app/(dashboard)/plants/new/page.tsx` - add merge prompt flow

---

## Backwards Compatibility

- Existing plants without `plant_type_id` display as individual cards
- "Individual" view mode shows all plants as separate cards (current behavior)
- No data migration required - existing plants remain unchanged
- Plant detail page (`/plants/[id]`) unchanged - still shows single cultivar with its own photo

---

## Key Points

- **Each cultivar keeps its own photo** - the `photo_url` field is on the `plants` table, so each cultivar has individual photo storage
- **Care profile is shared** - the `ai_care_profile` is on `plant_types`, so all cultivars of a type share the same care tasks
- **Cultivar-specific data**: name, photo, location/area, notes, planted_in

---

## Verification Steps

1. Add a new plant (e.g., "Climbing Rose - New Dawn") - verify card displays correctly
2. Add another cultivar of same type (e.g., "Climbing Rose - Iceberg") - verify merge prompt appears
3. After merging, verify both cultivars appear under the same expandable card
4. Verify each cultivar shows its own photo in the expanded list
5. Toggle between "By Type" and "Individual" views
6. Verify existing plants still display correctly
7. Verify plant detail pages still work
8. Run `npm run lint && npm run typecheck`
