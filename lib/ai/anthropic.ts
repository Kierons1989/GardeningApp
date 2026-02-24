import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './provider'
import type { AICareProfile, PlantContext, ChatMessage, ChatContext, GardenChatContext } from '@/types/database'
import { buildCareProfilePrompt } from './prompts/care-profile'
import { buildPlantChatPrompt } from './prompts/plant-chat'
import { buildGardenChatPrompt } from './prompts/garden-chat'
import { unifiedPlantSearchPrompt, type PlantVerificationResponse } from './prompts/plant-verification'
import { plantIdentificationCache } from '@/lib/cache/plant-identification-cache'

function stripMarkdownCodeBlock(text: string): string {
  let str = text.trim()
  if (str.startsWith('```json')) {
    str = str.slice(7)
  } else if (str.startsWith('```')) {
    str = str.slice(3)
  }
  if (str.endsWith('```')) {
    str = str.slice(0, -3)
  }
  return str.trim()
}

export class AnthropicProvider implements AIProvider {
  private client: Anthropic

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }

  async generateCareProfile(plantName: string, context: PlantContext, topLevel?: string): Promise<AICareProfile> {
    const prompt = buildCareProfilePrompt(plantName, topLevel, context)

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    const jsonStr = stripMarkdownCodeBlock(textContent.text)
    const parsed = JSON.parse(jsonStr)

    return {
      ...parsed,
      generated_at: new Date().toISOString(),
    }
  }

  async chat(messages: ChatMessage[], context: ChatContext): Promise<string> {
    const systemPrompt = buildPlantChatPrompt(
      context.plant,
      context.history,
      messages[messages.length - 1]?.content || ''
    )

    const hasImages = messages.some((msg) => msg.image || (msg.images && msg.images.length > 0))

    const anthropicMessages = messages.map((msg) => {
      const allImages = msg.images || (msg.image ? [msg.image] : [])

      if (allImages.length > 0) {
        const imageBlocks = allImages.map((img) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: img.mediaType,
            data: img.base64,
          },
        }))

        return {
          role: msg.role as 'user' | 'assistant',
          content: [
            ...imageBlocks,
            {
              type: 'text' as const,
              text: msg.content,
            },
          ],
        }
      }
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }
    })

    const model = hasImages ? 'claude-sonnet-4-20250514' : 'claude-3-haiku-20240307'

    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: anthropicMessages,
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    return textContent.text
  }

  async gardenChat(messages: ChatMessage[], context: GardenChatContext): Promise<string> {
    const systemPrompt = buildGardenChatPrompt(
      {
        plants: context.plants,
        lawn: context.lawn,
        plantHistory: context.plantHistory,
        lawnHistory: context.lawnHistory,
      },
      messages[messages.length - 1]?.content || ''
    )

    const hasImages = messages.some((msg) => msg.image || (msg.images && msg.images.length > 0))

    const anthropicMessages = messages.map((msg) => {
      const allImages = msg.images || (msg.image ? [msg.image] : [])

      if (allImages.length > 0) {
        const imageBlocks = allImages.map((img) => ({
          type: 'image' as const,
          source: {
            type: 'base64' as const,
            media_type: img.mediaType,
            data: img.base64,
          },
        }))

        return {
          role: msg.role as 'user' | 'assistant',
          content: [
            ...imageBlocks,
            {
              type: 'text' as const,
              text: msg.content,
            },
          ],
        }
      }
      return {
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }
    })

    const model = hasImages ? 'claude-sonnet-4-20250514' : 'claude-3-haiku-20240307'

    const response = await this.client.messages.create({
      model,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: systemPrompt,
          cache_control: { type: "ephemeral" }
        }
      ],
      messages: anthropicMessages,
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    return textContent.text
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content in response')
    }

    return textContent.text
  }

  async searchPlant(query: string): Promise<PlantVerificationResponse> {
    // Check cache first
    const cached = plantIdentificationCache.get(query)
    if (cached) {
      return cached
    }

    const prompt = unifiedPlantSearchPrompt(query)

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2048,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 5,
          },
        ],
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // Extract the last text block (after any web search tool use)
      const textBlocks = response.content.filter((block) => block.type === 'text')
      const lastTextBlock = textBlocks[textBlocks.length - 1]

      if (!lastTextBlock || lastTextBlock.type !== 'text') {
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'No text response received from AI',
        }
      }

      const jsonStr = stripMarkdownCodeBlock(lastTextBlock.text)

      try {
        const parsed = JSON.parse(jsonStr) as PlantVerificationResponse

        // Validate: if identified, must have plant data with required fields
        if (parsed.identified && parsed.plant) {
          if (!parsed.plant.common_name || !parsed.plant.top_level || !parsed.plant.middle_level) {
            return {
              identified: false,
              confidence: 'unknown',
              reason: 'Incomplete plant information from AI',
            }
          }
        }

        // Cache the result
        plantIdentificationCache.set(query, parsed)

        return parsed
      } catch {
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'Failed to parse AI response',
        }
      }
    } catch (error) {
      console.error('Plant search error:', error)
      return {
        identified: false,
        confidence: 'unknown',
        reason: 'Plant search failed due to an error',
      }
    }
  }
}
