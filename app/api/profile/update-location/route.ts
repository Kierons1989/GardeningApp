import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getOwnerUserId } from '@/lib/supabase/owner'
import { getClimateZone } from '@/lib/climate/uk-zones'

export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const userId = getOwnerUserId()

    const body = await request.json()
    const { location } = body

    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      )
    }

    // Calculate climate zone from location
    const climateZone = getClimateZone(location.trim())

    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .update({
        location: location.trim(),
        climate_zone: climateZone,
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      location: data.location,
      climate_zone: data.climate_zone,
    })
  } catch (error) {
    console.error('Error in update-location:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
