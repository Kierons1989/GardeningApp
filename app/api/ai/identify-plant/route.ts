import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import type { PlantIdentification } from '@/types/database'

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
    const { userInput } = body

    if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
      return NextResponse.json(
        { error: 'Plant name or description is required' },
        { status: 400 }
      )
    }

    const aiProvider = getAIProvider()

    // Use the same identifyPlant method as the search API
    const result = await aiProvider.identifyPlant(userInput.trim())

    // If plant wasn't identified or confidence is unknown, return error
    if (!result.identified || result.confidence === 'unknown') {
      return NextResponse.json(
        {
          error: 'Could not identify this plant. Please try a different name or add it as a generic plant type (e.g., "rose", "dahlia").',
          reason: result.reason
        },
        { status: 400 }
      )
    }

    // Transform the verification response to PlantIdentification format
    const plant = result.plant!
    const identification: PlantIdentification = {
      top_level: plant.top_level,
      middle_level: plant.middle_level,
      cultivar_name: plant.cultivar_name,
      growth_habit: plant.growth_habit,
      confidence: result.confidence === 'verified' ? 'high' : 'medium'
    }

    return NextResponse.json(identification)
  } catch (error) {
    console.error('Error identifying plant:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to identify plant',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
