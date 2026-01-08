import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { plantId, taskKey, action, snoozeUntil, notes } = body

    if (!taskKey || !action) {
      return NextResponse.json(
        { error: 'Task key and action are required' },
        { status: 400 }
      )
    }

    if (!['done', 'skipped', 'snoozed'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    if (action === 'snoozed' && !snoozeUntil) {
      return NextResponse.json(
        { error: 'Snooze date is required for snooze action' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('task_history')
      .insert({
        user_id: user.id,
        plant_id: plantId || null,
        task_key: taskKey,
        action,
        snooze_until: snoozeUntil || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving task history:', error)
      return NextResponse.json(
        { error: 'Failed to save task action' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in task action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
