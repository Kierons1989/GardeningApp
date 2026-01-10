import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAIProvider } from '@/lib/ai'
import type { ChatMessage } from '@/types/database'

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
    const { plantId, messages } = body

    if (!plantId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Plant ID and messages are required' },
        { status: 400 }
      )
    }

    // Fetch the plant
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select('*')
      .eq('id', plantId)
      .eq('user_id', user.id)
      .single()

    if (plantError || !plant) {
      return NextResponse.json(
        { error: 'Plant not found' },
        { status: 404 }
      )
    }

    // Fetch task history
    const { data: taskHistory } = await supabase
      .from('task_history')
      .select('*')
      .eq('plant_id', plantId)
      .order('created_at', { ascending: false })
      .limit(10)

    // Generate response
    const aiProvider = getAIProvider()
    const response = await aiProvider.chat(
      messages as ChatMessage[],
      {
        plant,
        history: taskHistory || [],
        currentDate: new Date().toISOString(),
      }
    )

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat:', error)

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined

    return NextResponse.json(
      {
        error: 'Failed to generate response',
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
