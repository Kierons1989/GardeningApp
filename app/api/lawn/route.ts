import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LawnSetupFormData } from '@/types/lawn'

// GET - Fetch user's lawn (single lawn per user for now)
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: lawn, error } = await supabase
      .from('lawns')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // PGRST116 means no rows found - return null instead of error
    if (error && error.code === 'PGRST116') {
      return NextResponse.json(null)
    }

    if (error) {
      console.error('Lawn fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(lawn)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// POST - Create new lawn
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json() as LawnSetupFormData & { ai_care_profile?: unknown }

    const {
      name,
      size,
      size_sqm,
      primary_use,
      grass_type,
      soil_type,
      current_condition,
      care_goal,
      known_issues,
      notes,
      ai_care_profile,
    } = body

    if (!name) {
      return NextResponse.json({ error: 'Lawn name is required' }, { status: 400 })
    }

    // Use admin client to ensure profile exists
    const adminClient = createAdminClient()

    // Check if user already has a lawn
    const { data: existingLawn } = await adminClient
      .from('lawns')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (existingLawn) {
      return NextResponse.json({ error: 'User already has a lawn. Use PUT to update.' }, { status: 400 })
    }

    // Ensure profile exists
    const { data: existingProfile, error: profileCheckError } = await adminClient
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      return NextResponse.json({ error: `Profile check failed: ${profileCheckError.message}` }, { status: 500 })
    }

    if (!existingProfile) {
      const { error: profileError } = await adminClient.from('profiles').insert({
        id: user.id,
        display_name: user.user_metadata?.display_name || null,
      })

      if (profileError) {
        return NextResponse.json({ error: `Failed to create profile: ${profileError.message}` }, { status: 500 })
      }
    }

    // Create the lawn
    const { data: lawn, error } = await adminClient.from('lawns').insert({
      user_id: user.id,
      name,
      size: size || 'medium',
      size_sqm: size_sqm || null,
      primary_use: primary_use || 'family',
      grass_type: grass_type || 'mixed',
      soil_type: soil_type || 'unknown',
      current_condition: current_condition || 'good',
      health_status: current_condition === 'excellent' ? 'healthy' :
                     current_condition === 'needs_work' ? 'needs_attention' :
                     current_condition === 'starting_fresh' ? 'needs_attention' : 'healthy',
      care_goal: care_goal || 'family_friendly',
      known_issues: known_issues || [],
      notes: notes || null,
      ai_care_profile: ai_care_profile || null,
    }).select().single()

    if (error) {
      console.error('Lawn creation error:', error)
      return NextResponse.json({ error: `Failed to create lawn: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(lawn)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// PUT - Update lawn
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const adminClient = createAdminClient()

    // Get existing lawn
    const { data: existingLawn, error: fetchError } = await adminClient
      .from('lawns')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (fetchError || !existingLawn) {
      return NextResponse.json({ error: 'Lawn not found' }, { status: 404 })
    }

    // Update the lawn
    const { data: lawn, error } = await adminClient
      .from('lawns')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingLawn.id)
      .select()
      .single()

    if (error) {
      console.error('Lawn update error:', error)
      return NextResponse.json({ error: `Failed to update lawn: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(lawn)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// DELETE - Delete lawn
export async function DELETE() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('lawns')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Lawn deletion error:', error)
      return NextResponse.json({ error: `Failed to delete lawn: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
