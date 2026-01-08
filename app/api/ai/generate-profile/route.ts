import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import type { PlantContext } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { plantName, area, plantedIn } = body

    if (!plantName || typeof plantName !== 'string') {
      return NextResponse.json(
        { error: 'Plant name is required' },
        { status: 400 }
      )
    }

    // Build context
    const context: PlantContext = {
      area: area || null,
      plantedIn: plantedIn || null,
      currentMonth: new Date().getMonth() + 1,
    }

    // Generate care profile
    const aiProvider = getAIProvider()
    const careProfile = await aiProvider.generateCareProfile(plantName, context)

    return NextResponse.json(careProfile)
  } catch (error) {
    console.error('Error generating care profile:', error)

    return NextResponse.json(
      { error: 'Failed to generate care profile' },
      { status: 500 }
    )
  }
}
