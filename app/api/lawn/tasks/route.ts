import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Fetch lawn task history
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: taskHistory, error } = await supabase
      .from('lawn_task_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Task history fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(taskHistory || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// POST - Record task action (done, skipped, snoozed)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lawn_id, task_key, action, snooze_until, notes } = body as {
      lawn_id: string
      task_key: string
      action: 'done' | 'skipped' | 'snoozed'
      snooze_until?: string
      notes?: string
    }

    if (!lawn_id || !task_key || !action) {
      return NextResponse.json({ error: 'lawn_id, task_key, and action are required' }, { status: 400 })
    }

    if (!['done', 'skipped', 'snoozed'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
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

    // Record the action
    const { data: taskHistory, error } = await adminClient.from('lawn_task_history').insert({
      user_id: user.id,
      lawn_id,
      task_key,
      action,
      snooze_until: action === 'snoozed' ? snooze_until : null,
      notes: notes || null,
    }).select().single()

    if (error) {
      console.error('Task action error:', error)
      return NextResponse.json({ error: `Failed to record action: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(taskHistory)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
