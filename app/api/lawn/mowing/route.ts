import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// GET - Fetch mowing history
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: mowingLogs, error } = await supabase
      .from('lawn_mowing_log')
      .select('*')
      .eq('user_id', user.id)
      .order('mowed_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Mowing log fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(mowingLogs || [])
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}

// POST - Log new mowing
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { lawn_id, mowed_at, height_mm, notes } = body as {
      lawn_id: string
      mowed_at?: string
      height_mm?: number
      notes?: string
    }

    if (!lawn_id) {
      return NextResponse.json({ error: 'lawn_id is required' }, { status: 400 })
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

    // Log the mowing
    const { data: mowingLog, error } = await adminClient.from('lawn_mowing_log').insert({
      user_id: user.id,
      lawn_id,
      mowed_at: mowed_at || new Date().toISOString(),
      height_mm: height_mm || null,
      notes: notes || null,
    }).select().single()

    if (error) {
      console.error('Mowing log error:', error)
      return NextResponse.json({ error: `Failed to log mowing: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json(mowingLog)
  } catch (err) {
    console.error('Unexpected error:', err)
    return NextResponse.json({
      error: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`
    }, { status: 500 })
  }
}
