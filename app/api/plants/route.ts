import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json({ error: `Auth error: ${authError.message}` }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized - no user found' }, { status: 401 })
    }

    const body = await request.json()
    const { name, common_name, species, plant_type_id, cultivar_name, area, planted_in, notes } = body as {
      name: string
      common_name?: string
      species?: string
      plant_type_id?: string
      cultivar_name?: string
      area?: string
      planted_in?: 'ground' | 'pot' | 'raised_bed'
      notes?: string
    }

    if (!name) {
      return NextResponse.json({ error: 'Plant name is required' }, { status: 400 })
    }

    // Use admin client to ensure profile exists (bypasses RLS)
    const adminClient = createAdminClient()

    // First check if tables exist by trying a simple query
    const { error: tableCheckError } = await adminClient
      .from('profiles')
      .select('id')
      .limit(1)

    if (tableCheckError) {
      console.error('Table check error:', tableCheckError)
      return NextResponse.json({
        error: `Database not configured. Please run the migration SQL in Supabase. Error: ${tableCheckError.message}`
      }, { status: 500 })
    }

    const { data: existingProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    // PGRST116 means no rows found, which is fine - we'll create the profile
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Profile check error:', profileCheckError)
      return NextResponse.json({ error: `Profile check failed: ${profileCheckError.message}` }, { status: 500 })
    }

    if (!existingProfile) {
      console.log('Creating profile for user:', user.id)
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || null,
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
      }
      console.log('Profile created successfully')
    }

    // Check for duplicate generic entry (one generic per type per user)
    const isGenericEntry = !cultivar_name || cultivar_name.trim() === ''
    if (isGenericEntry && plant_type_id) {
      const { data: existingGeneric } = await adminClient
        .from('plants')
        .select('id')
        .eq('user_id', user.id)
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
    console.log('Inserting plant for user:', user.id)
    const { data: plant, error } = await adminClient.from('plants').insert({
      user_id: user.id,
      name,
      common_name: common_name || null,
      species: species || null,
      plant_type_id: plant_type_id || null,
      cultivar_name: cultivar_name || null,
      area: area || null,
      planted_in: planted_in || null,
      notes: notes || null,
    }).select().single()

    if (error) {
      console.error('Plant save error:', error)
      return NextResponse.json({ error: `Failed to save plant: ${error.message}` }, { status: 500 })
    }

    console.log('Plant saved successfully:', plant.id)
    return NextResponse.json(plant)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
