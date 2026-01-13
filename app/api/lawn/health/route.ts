import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LawnHealthStatus } from '@/types/lawn'

// GET - Fetch health check history
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: healthChecks, error } = await supabase
      .from('lawn_health_checks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('Health check fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(healthChecks || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// POST - Record new health check
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lawn_id, health_status, issues_reported, notes } = body as {
      lawn_id: string
      health_status: LawnHealthStatus
      issues_reported?: string[]
      notes?: string
    }

    if (!lawn_id || !health_status) {
      return NextResponse.json({ error: 'lawn_id and health_status are required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Verify lawn belongs to user
    const { data: lawn, error: lawnError } = await adminClient
      .from('lawns')
      .select('id')
      .eq('id', lawn_id)
      .eq('user_id', user.id)
      .single()

    if (lawnError || !lawn) {
      return NextResponse.json({ error: 'Lawn not found' }, { status: 404 })
    }

    // Determine current season
    const now = new Date()
    const month = now.getMonth() + 1
    let season: 'spring' | 'summer' | 'autumn' | 'winter'
    if (month >= 3 && month <= 5) season = 'spring'
    else if (month >= 6 && month <= 8) season = 'summer'
    else if (month >= 9 && month <= 11) season = 'autumn'
    else season = 'winter'

    // Record the health check
    const { data: healthCheck, error: insertError } = await adminClient.from('lawn_health_checks').insert({
      user_id: user.id,
      lawn_id,
      health_status,
      issues_reported: issues_reported || [],
      season,
      notes: notes || null,
    }).select().single()

    if (insertError) {
      console.error('Health check error:', insertError)
      return NextResponse.json({ error: `Failed to record health check: ${insertError.message}` }, { status: 500 })
    }

    // Also update the lawn's health_status
    const { error: updateError } = await adminClient
      .from('lawns')
      .update({
        health_status,
        known_issues: issues_reported || [],
        updated_at: new Date().toISOString(),
      })
      .eq('id', lawn_id)

    if (updateError) {
      console.error('Lawn update error:', updateError)
      // Don't fail the request, health check was recorded
    }

    return NextResponse.json(healthCheck)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
