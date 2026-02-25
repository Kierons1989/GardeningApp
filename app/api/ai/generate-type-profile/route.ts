import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import type { PlantContext, AICareProfile } from '@/types/database'

export const maxDuration = 120

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { topLevel, middleLevel, growthHabit, area, plantedIn, plantState, searchData } = body

    if (!topLevel || !middleLevel) {
      return NextResponse.json(
        { error: 'Top level and middle level are required' },
        { status: 400 }
      )
    }

    // Check if this plant type already exists with a care profile
    const { data: existingType } = await supabase
      .from('plant_types')
      .select('*')
      .eq('top_level', topLevel)
      .eq('middle_level', middleLevel)
      .single()

    // If type exists and has profile AND no plant-specific state was provided, reuse cached profile
    if (existingType && existingType.ai_care_profile && !plantState) {
      return NextResponse.json({
        plantType: existingType,
        careProfile: existingType.ai_care_profile
      })
    }

    // Fetch user's climate zone
    const { data: profile } = await supabase
      .from('profiles')
      .select('climate_zone')
      .eq('id', user.id)
      .single()

    // Generate care profile for this plant type (with optional plant state context)
    const context: PlantContext = {
      area: area || null,
      plantedIn: plantedIn || null,
      currentMonth: new Date().getMonth() + 1,
      climateZone: profile?.climate_zone || null,
      plantState: plantState || null,
      searchData: searchData || null,
    }

    const aiProvider = getAIProvider()
    const careProfile: AICareProfile = await aiProvider.generateCareProfile(middleLevel, context, topLevel)

    // Upsert plant type with care profile
    const { data: plantType, error: upsertError } = await supabase
      .from('plant_types')
      .upsert({
        top_level: topLevel,
        middle_level: middleLevel,
        growth_habit: growthHabit || [],
        ai_care_profile: careProfile,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'top_level,middle_level'
      })
      .select()
      .single()

    if (upsertError) {
      console.error('Failed to save plant type:', upsertError.message)
      return NextResponse.json(
        { error: 'Failed to save plant type', details: upsertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      plantType,
      careProfile
    })
  } catch (error) {
    console.error('Error generating type profile:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to generate care profile for plant type',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
