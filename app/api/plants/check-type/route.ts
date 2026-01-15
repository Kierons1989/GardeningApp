import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const topLevel = request.nextUrl.searchParams.get('topLevel')
    const middleLevel = request.nextUrl.searchParams.get('middleLevel')

    if (!topLevel || !middleLevel) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // Find plant_type matching the criteria
    const { data: plantType } = await supabase
      .from('plant_types')
      .select('id')
      .eq('top_level', topLevel)
      .eq('middle_level', middleLevel)
      .single()

    if (!plantType) {
      return NextResponse.json({ exists: false })
    }

    // Find user's plants with this type
    const { data: existingPlants } = await supabase
      .from('plants')
      .select('id, cultivar_name')
      .eq('user_id', user.id)
      .eq('plant_type_id', plantType.id)

    if (!existingPlants || existingPlants.length === 0) {
      return NextResponse.json({ exists: false })
    }

    return NextResponse.json({
      exists: true,
      plantTypeId: plantType.id,
      existingCultivars: existingPlants
        .map((p) => p.cultivar_name)
        .filter(Boolean) as string[],
    })
  } catch (err) {
    console.error('Check type error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
