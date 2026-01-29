import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAIProvider } from '@/lib/ai'
import type { ChatMessage } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const adminClient = createAdminClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { plantId, messages, sessionId } = body

    if (!plantId || !messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Plant ID and messages are required' },
        { status: 400 }
      )
    }

    // Fetch the plant with plant_types relation
    const { data: plant, error: plantError } = await supabase
      .from('plants')
      .select(`
        *,
        plant_types (
          id,
          top_level,
          middle_level,
          growth_habit,
          ai_care_profile
        )
      `)
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

    // Add assistant response to messages with timestamp
    // Strip image data from stored messages to avoid database bloat
    // (images are only needed for the current request, not history)
    const messagesForStorage = messages.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      hasImage: !!msg.image || (msg.images && msg.images.length > 0), // Keep a flag that image(s) were attached
      imageCount: msg.images?.length || (msg.image ? 1 : 0), // Track how many images were attached
    }))

    const updatedMessages: ChatMessage[] = [
      ...messagesForStorage,
      {
        role: 'assistant' as const,
        content: response,
        timestamp: new Date().toISOString(),
      },
    ]

    // Save or update conversation
    if (sessionId) {
      // Update existing conversation
      await adminClient
        .from('plant_conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
    } else {
      // Create new conversation
      await adminClient
        .from('plant_conversations')
        .insert({
          user_id: user.id,
          plant_id: plantId,
          messages: updatedMessages,
        })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve conversation history for a plant
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const plantId = searchParams.get('plantId')

    if (!plantId) {
      return NextResponse.json(
        { error: 'Plant ID is required' },
        { status: 400 }
      )
    }

    // Fetch the most recent conversation for this plant
    const { data: conversation, error } = await supabase
      .from('plant_conversations')
      .select('*')
      .eq('plant_id', plantId)
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching conversation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversation: conversation || null,
    })
  } catch (error) {
    console.error('Error in GET chat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
