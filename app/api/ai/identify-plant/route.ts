import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import { plantIdentificationPrompt } from '@/lib/ai/prompts/plant-identification'
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
    const prompt = plantIdentificationPrompt(userInput.trim())

    const result = await aiProvider.generateText(prompt)

    let identification: PlantIdentification
    try {
      identification = JSON.parse(result)
    } catch {
      console.error('Failed to parse AI response:', result)
      return NextResponse.json(
        { error: 'Failed to parse plant identification', details: result },
        { status: 500 }
      )
    }

    if (!identification.top_level || !identification.middle_level) {
      return NextResponse.json(
        { error: 'Could not identify plant from input', identification },
        { status: 400 }
      )
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
