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
    const { messages, sessionId } = body

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      )
    }

    // Fetch all plants with care profiles
    const { data: plants } = await supabase
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
      .eq('user_id', user.id)
      .order('name')

    // Fetch lawn
    const { data: lawns } = await supabase
      .from('lawns')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)

    const lawn = lawns?.[0] || null

    // Fetch recent plant task history
    const { data: plantHistory } = await supabase
      .from('task_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    // Fetch recent lawn task history
    const { data: lawnHistory } = await supabase
      .from('lawn_task_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // Generate response
    const aiProvider = getAIProvider()
    const response = await aiProvider.gardenChat(
      messages as ChatMessage[],
      {
        plants: plants || [],
        lawn,
        plantHistory: plantHistory || [],
        lawnHistory: lawnHistory || [],
        currentDate: new Date().toISOString(),
      }
    )

    // Strip image data from stored messages
    const messagesForStorage = messages.map((msg: ChatMessage) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp,
      hasImage: !!msg.image || (msg.images && msg.images.length > 0),
      imageCount: msg.images?.length || (msg.image ? 1 : 0),
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
      await adminClient
        .from('garden_conversations')
        .update({
          messages: updatedMessages,
          updated_at: new Date().toISOString(),
        })
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
    } else {
      await adminClient
        .from('garden_conversations')
        .insert({
          user_id: user.id,
          messages: updatedMessages,
        })
    }

    return NextResponse.json({ response })
  } catch (error) {
    console.error('Error in garden chat:', error)
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}

// GET endpoint to retrieve the latest garden conversation
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { data: conversation, error } = await supabase
      .from('garden_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching garden conversation:', error)
      return NextResponse.json(
        { error: 'Failed to fetch conversation' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      conversation: conversation || null,
    })
  } catch (error) {
    console.error('Error in GET garden chat:', error)
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    )
  }
}
