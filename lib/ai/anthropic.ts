import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './provider'
import type { AICareProfile, PlantContext, ChatMessage, ChatContext } from '@/types/database'
import { buildCareProfilePrompt } from './prompts/care-profile'
import { buildPlantChatPrompt } from './prompts/plant-chat'

export class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateCareProfile(plantName: string, context: PlantContext): Promise<AICareProfile> {
    const prompt = buildCareProfilePrompt(plantName, context)

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    // Parse JSON from response
    let jsonStr = textContent.text.trim()

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7)
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3)
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3)
    }
    jsonStr = jsonStr.trim()

    const parsed = JSON.parse(jsonStr)

    // Add metadata
    return {
      ...parsed,
      generated_at: new Date().toISOString(),
    }
  }

  async chat(messages: ChatMessage[], context: ChatContext): Promise<string> {
    // Build system context from the first message
    const systemPrompt = buildPlantChatPrompt(
      context.plant,
      context.history,
      messages[messages.length - 1]?.content || ''
    )

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // If it's a new conversation, include the system context in the user message
    if (anthropicMessages.length === 1) {
      anthropicMessages[0].content = systemPrompt
    }

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: 'You are a helpful UK gardening expert. Be friendly, practical, and concise.',
      messages: anthropicMessages,
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    return textContent.text
  }
}
