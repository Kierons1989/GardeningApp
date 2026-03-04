import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerUserId } from '@/lib/supabase/owner'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const { data } = await supabase
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching plants:', error)
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const body = await request.json()
    const {
      name,
      common_name,
      species,
      plant_type_id,
      cultivar_name,
      location_type,
      location_custom,
      location_protection,
      planted_in,
      notes,
      image_url,
      plant_state
    } = body as {
      name: string
      common_name?: string
      species?: string
      plant_type_id?: string
      cultivar_name?: string
      location_type?: 'front_garden' | 'back_garden' | 'patio' | 'other'
      location_custom?: string
      location_protection?: 'greenhouse' | 'polytunnel' | 'cold_frame'
      planted_in?: 'ground' | 'pot' | 'raised_bed'
      notes?: string
      image_url?: string
      plant_state?: Record<string, unknown>
    }

    if (!name) {
      return NextResponse.json({ error: 'Plant name is required' }, { status: 400 })
    }

    // First check if tables exist by trying a simple query
    const { error: tableCheckError } = await supabase
      .from('profiles')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.error('Table check error:', tableCheckError)
      return NextResponse.json({
        error: `Database not configured. Please run the migration SQL in Supabase. Error: ${tableCheckError.message}`
      }, { status: 500 })
    }

    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    // PGRST116 means no rows found, which is fine - we'll create the profile
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Profile check error:', profileCheckError)
      return NextResponse.json({ error: `Profile check failed: ${profileCheckError.message}` }, { status: 500 })
    }

    if (!existingProfile) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: userId,
        display_name: null,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
      }
    }

    // Check for duplicate generic entry (one generic per type per user)
    const isGenericEntry = !cultivar_name || cultivar_name.trim() === ''
    if (isGenericEntry && plant_type_id) {
      const { data: existingGeneric } = await supabase
        .from('plants')
        .select('id')
        .eq('user_id', userId)
        .eq('plant_type_id', plant_type_id)
        .or('cultivar_name.is.null,cultivar_name.eq.')
        .limit(1)

      if (existingGeneric && existingGeneric.length > 0) {
        return NextResponse.json(
          { error: 'You already have a generic entry for this plant type. Please add a cultivar name to distinguish this plant.' },
          { status: 400 }
        )
      }
    }

    // Now insert the plant using admin client to ensure it works
    const { data: plant, error } = await supabase.from('plants').insert({
      user_id: userId,
      name,
      common_name: common_name || null,
      species: species || null,
      plant_type_id: plant_type_id || null,
      cultivar_name: cultivar_name || null,
      location_type: location_type || null,
      location_custom: location_custom || null,
      location_protection: location_protection || null,
      planted_in: planted_in || null,
      notes: notes || null,
      photo_url: image_url || null,
      plant_state: plant_state || null,
    }).select().single()

    if (error) {
      console.error('Plant save error:', error)
      return NextResponse.json({ error: `Failed to save plant: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(plant)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
