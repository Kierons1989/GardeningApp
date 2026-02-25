import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider } from './provider'
import type { AICareProfile, PlantContext, ChatMessage, ChatContext, GardenChatContext } from '@/types/database'
import { buildCareProfilePrompt } from './prompts/care-profile'
import { buildPlantChatPrompt } from './prompts/plant-chat'
import { buildGardenChatPrompt } from './prompts/garden-chat'
import { unifiedPlantSearchPrompt, type PlantVerificationResponse } from './prompts/plant-verification'
import { plantIdentificationCache } from '@/lib/cache/plant-identification-cache'
import { fetchRHSImage } from '@/lib/rhs/client'

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

/**
 * Extracts the first valid JSON object from a string that may contain
 * surrounding text (common with web search responses).
 */
function extractJsonObject(text: string): string | null {
  // First try stripping markdown code blocks
  const stripped = stripMarkdownCodeBlock(text)
  try {
    JSON.parse(stripped)
    return stripped
  } catch {
    // Not pure JSON, try to extract from surrounding text
  }

  // Find the first '{' and match to its closing '}'
  const start = text.indexOf('{')
  if (start === -1) return null

  let depth = 0
  let inString = false
  let escape = false

  for (let i = start; i < text.length; i++) {
    const ch = text[i]

    if (escape) {
      escape = false
      continue
    }

    if (ch === '\\' && inString) {
      escape = true
      continue
    }

    if (ch === '"') {
      inString = !inString
      continue
    }

    if (inString) continue

    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) {
        const candidate = text.slice(start, i + 1)
        try {
          JSON.parse(candidate)
          return candidate
        } catch {
          return null
        }
      }
    }
  }

  return null
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
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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

    console.log(`[generateCareProfile] Plant: "${plantName}", stop_reason: ${response.stop_reason}, response length: ${textContent.text.length}`)

    const jsonStr = extractJsonObject(textContent.text)
    if (!jsonStr) {
      console.error(`[generateCareProfile] Could not extract JSON for "${plantName}". Response:`, textContent.text.substring(0, 500))
      throw new Error('Could not extract care profile JSON from AI response')
    }

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
    const maxContinuations = 5

    try {
      const tools = [
        {
          type: 'web_search_20250305' as const,
          name: 'web_search' as const,
          max_uses: 5,
        },
      ]

      let messages: Anthropic.Messages.MessageParam[] = [
        {
          role: 'user',
          content: prompt,
        },
      ]

      let response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools,
        messages,
      })

      console.log(`[searchPlant] Query: "${query}", stop_reason: ${response.stop_reason}, content blocks: ${response.content.length}`)

      // Handle pause_turn: the server-side web search loop hit its iteration limit
      // Continue the conversation to let Claude finish processing
      for (let i = 0; i < maxContinuations && response.stop_reason === 'pause_turn'; i++) {
        console.log(`[searchPlant] pause_turn detected for "${query}", continuing (attempt ${i + 1})`)
        messages = [
          { role: 'user', content: prompt },
          { role: 'assistant', content: response.content },
        ]
        response = await this.client.messages.create({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          tools,
          messages,
        })
        console.log(`[searchPlant] Continuation ${i + 1} for "${query}": stop_reason: ${response.stop_reason}, content blocks: ${response.content.length}`)
      }

      // Extract JSON from text blocks - with web search, JSON may not be in the last block
      const textBlocks = response.content.filter((block) => block.type === 'text')

      console.log(`[searchPlant] Final response for "${query}": text blocks: ${textBlocks.length}`)

      if (textBlocks.length === 0) {
        console.log(`[searchPlant] No text blocks found. Block types: ${response.content.map(b => b.type).join(', ')}`)
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'No text response received from AI',
        }
      }

      // Try each text block to extract JSON object
      let jsonStr: string | null = null
      for (const block of textBlocks) {
        if (block.type !== 'text') continue
        const extracted = extractJsonObject(block.text)
        if (extracted && extracted.includes('"identified"')) {
          jsonStr = extracted
          break
        }
      }

      // Fallback: try the last text block with simpler extraction
      if (!jsonStr) {
        const lastBlock = textBlocks[textBlocks.length - 1]
        if (lastBlock && lastBlock.type === 'text') {
          jsonStr = extractJsonObject(lastBlock.text)
        }
      }

      if (!jsonStr) {
        console.log(`[searchPlant] Could not extract JSON. Text blocks:`, textBlocks.map(b => b.type === 'text' ? b.text.substring(0, 200) : ''))
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'Could not parse AI response',
        }
      }

      try {
        const parsed = JSON.parse(jsonStr) as PlantVerificationResponse

        // Validate: if identified, must have plants array with required fields
        if (parsed.identified && parsed.plants && parsed.plants.length > 0) {
          const validPlants = parsed.plants.filter(p =>
            p.common_name && p.top_level && p.middle_level
          )

          if (validPlants.length === 0) {
            return {
              identified: false,
              confidence: 'unknown',
              reason: 'Incomplete plant information from AI',
            }
          }

          // Enrich with RHS image for plants without image_url that have an RHS source_url
          for (const plant of validPlants) {
            if (!plant.image_url && plant.source_url?.includes('rhs.org.uk')) {
              const rhsImage = await fetchRHSImage(plant.source_url)
              if (rhsImage) {
                plant.image_url = rhsImage
              }
            }
          }

          parsed.plants = validPlants
        }

        console.log(`[searchPlant] Result for "${query}": identified=${parsed.identified}, count=${parsed.plants?.length || 0}, names=${parsed.plants?.map(p => p.common_name).join(', ') || 'none'}`)

        // Cache the result
        plantIdentificationCache.set(query, parsed)

        return parsed
      } catch (parseError) {
        console.error(`[searchPlant] JSON parse failed for query "${query}":`, parseError, 'Raw JSON:', jsonStr?.substring(0, 500))
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'Failed to parse AI response',
        }
      }
    } catch (error) {
      console.error('[searchPlant] API error:', error)
      return {
        identified: false,
        confidence: 'unknown',
        reason: 'Plant search failed due to an error',
      }
    }
  }
}
