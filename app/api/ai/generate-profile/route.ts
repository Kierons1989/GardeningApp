import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { generateCacheKey, normalizePlantName, CURRENT_CACHE_VERSION } from '@/lib/cache/profile-cache'
import type { PlantContext, CareProfileCache } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { plantName, area, plantedIn } = body

    if (!plantName || typeof plantName !== 'string') {
      return NextResponse.json(
        { error: 'Plant name is required' },
        { status: 400 }
      )
    }

    // Normalize plant name for better cache hits
    const normalizedName = normalizePlantName(plantName)

    // Generate cache key (climate zone = null for v1)
    const cacheKey = await generateCacheKey(normalizedName, plantedIn, null, CURRENT_CACHE_VERSION)

    // Check cache first
    const { data: cached, error: cacheError } = await supabase
      .from('care_profile_cache')
      .select('care_profile, id, hits')
      .eq('cache_key', cacheKey)
      .single()

    if (cached && !cacheError) {
      // Cache hit! Increment counter and return
      await supabase
        .from('care_profile_cache')
        .update({ hits: cached.hits + 1 })
        .eq('id', cached.id)

      console.log(`Cache HIT for "${normalizedName}" (${plantedIn || 'unspecified'})`)
      return NextResponse.json(cached.care_profile)
    }

    // Cache miss - generate with AI
    console.log(`Cache MISS for "${normalizedName}" (${plantedIn || 'unspecified'}) - generating...`)

    const context: PlantContext = {
      area: area || null,
      plantedIn: plantedIn || null,
      currentMonth: new Date().getMonth() + 1,
    }

    const aiProvider = getAIProvider()
    const careProfile = await aiProvider.generateCareProfile(normalizedName, context)

    // Store in cache for future use
    const { error: insertError } = await supabase
      .from('care_profile_cache')
      .insert({
        plant_name: normalizedName,
        planted_in: plantedIn,
        climate_zone: null,  // Version 1 doesn't use zones yet
        cache_version: CURRENT_CACHE_VERSION,
        cache_key: cacheKey,
        care_profile: careProfile,
        hits: 0,
      })

    if (insertError) {
      // Cache insert failed, but that's okay - we still have the profile
      console.warn('Failed to cache profile:', insertError.message)
    } else {
      console.log(`Cached new profile for "${normalizedName}"`)
    }

    return NextResponse.json(careProfile)
  } catch (error) {
    console.error('Error generating care profile:', error)

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to generate care profile',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
