import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAIProvider } from '@/lib/ai'
import type { PlantState, PlantContext, AICareProfile } from '@/types/database'

const VALID_GROWTH_STAGES = ['seed', 'seedling', 'juvenile', 'mature', 'dormant', 'flowering', 'fruiting']
const VALID_ENVIRONMENTS = ['indoor', 'outdoor', 'greenhouse', 'cold_frame']
const VALID_HEALTH_STATUSES = ['healthy', 'struggling', 'diseased', 'recovering']

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { growth_stage, environment, health_status, health_notes, date_planted } = body

    // Validate required fields
    if (!growth_stage || !VALID_GROWTH_STAGES.includes(growth_stage)) {
      return NextResponse.json({ error: 'Valid growth_stage is required' }, { status: 400 })
    }
    if (!environment || !VALID_ENVIRONMENTS.includes(environment)) {
      return NextResponse.json({ error: 'Valid environment is required' }, { status: 400 })
    }
    if (!health_status || !VALID_HEALTH_STATUSES.includes(health_status)) {
      return NextResponse.json({ error: 'Valid health_status is required' }, { status: 400 })
    }

    const plantState: PlantState = {
      growth_stage,
      environment,
      health_status,
      health_notes: health_notes || undefined,
      date_planted: date_planted || undefined,
      last_updated: new Date().toISOString(),
    }

    // Fetch the plant with its type to get context for regeneration
    const { data: plant, error: fetchError } = await supabase
      .from('plants')
      .select(`
        *,
        plant_types (
          id,
          top_level,
          middle_level,
          growth_habit,
          ai_care_profile
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !plant) {
      return NextResponse.json({ error: 'Plant not found' }, { status: 404 })
    }

    // Fetch user's climate zone
    const { data: profile } = await supabase
      .from('profiles')
      .select('climate_zone')
      .eq('id', user.id)
      .single()

    // Regenerate the care profile with plant state context
    const plantName = plant.plant_types?.middle_level || plant.name
    const topLevel = plant.plant_types?.top_level

    const context: PlantContext = {
      area: plant.location_type || null,
      plantedIn: plant.planted_in || null,
      currentMonth: new Date().getMonth() + 1,
      climateZone: profile?.climate_zone || null,
      plantState,
    }

    const aiProvider = getAIProvider()
    const careProfile: AICareProfile = await aiProvider.generateCareProfile(plantName, context, topLevel)

    // Update the plant with new state and per-plant care profile
    const adminClient = createAdminClient()
    const { data: updatedPlant, error: updateError } = await adminClient
      .from('plants')
      .update({
        plant_state: plantState,
        ai_care_profile: careProfile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        plant_types (
          id,
          top_level,
          middle_level,
          growth_habit,
          ai_care_profile
        )
      `)
      .single()

    if (updateError) {
      console.error('Failed to update plant state:', updateError)
      return NextResponse.json(
        { error: 'Failed to update plant state', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPlant)
  } catch (error) {
    console.error('Error updating plant state:', error)
    return NextResponse.json(
      { error: 'Failed to update plant state' },
      { status: 500 }
    )
  }
}
