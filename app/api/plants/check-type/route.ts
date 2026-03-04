import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerUserId } from '@/lib/supabase/owner'

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

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
      .eq('user_id', userId)
      .eq('plant_type_id', plantType.id)

    if (!existingPlants || existingPlants.length === 0) {
      return NextResponse.json({ exists: false })
    }

    // Check if user already has a generic entry (no cultivar_name) for this type
    const hasGenericEntry = existingPlants.some(
      (p) => !p.cultivar_name || p.cultivar_name.trim() === ''
    )

    return NextResponse.json({
      exists: true,
      plantTypeId: plantType.id,
      existingCultivars: existingPlants
        .map((p) => p.cultivar_name)
        .filter(Boolean) as string[],
      hasGenericEntry,
    })
  } catch (err) {
    console.error('Check type error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
