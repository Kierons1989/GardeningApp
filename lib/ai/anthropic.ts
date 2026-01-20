import Anthropic from '@anthropic-ai/sdk'
import type { AIProvider, PlantWebVerificationResult } from './provider'
import type { AICareProfile, PlantContext, ChatMessage, ChatContext } from '@/types/database'
import { buildCareProfilePrompt } from './prompts/care-profile'
import { buildPlantChatPrompt } from './prompts/plant-chat'
import { plantVerificationPrompt, webSearchVerificationPrompt, webSearchDiscoveryPrompt, spellingSuggestionPrompt, type PlantVerificationResponse, type SpellingSuggestion } from './prompts/plant-verification'
import { plantIdentificationCache } from '@/lib/cache/plant-identification-cache'

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

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
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

  async identifyPlant(query: string): Promise<PlantVerificationResponse> {
    // Check cache first
    const cached = plantIdentificationCache.get(query)
    if (cached) {
      return cached
    }

    const prompt = plantVerificationPrompt(query)

    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514', // Use Sonnet for better plant knowledge
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

    try {
      const parsed = JSON.parse(jsonStr) as PlantVerificationResponse

      // Cache successful identifications (both found and not found)
      plantIdentificationCache.set(query, parsed)

      return parsed
    } catch {
      // If parsing fails, return unknown (don't cache failures)
      return {
        identified: false,
        confidence: 'unknown',
        reason: 'Failed to parse AI response',
      }
    }
  }

  async verifyPlantWithWebSearch(query: string, initialIdentification: string): Promise<PlantWebVerificationResult> {
    const prompt = webSearchVerificationPrompt(query, initialIdentification)

    try {
      // Use Claude with web search tool for verification
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          },
        ],
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      // Extract text content from response (may include tool use results)
      const textContent = response.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        return {
          verified: false,
          reason: 'No verification response received',
        }
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

      try {
        const parsed = JSON.parse(jsonStr) as PlantWebVerificationResult
        return parsed
      } catch {
        return {
          verified: false,
          reason: 'Failed to parse verification response',
        }
      }
    } catch (error) {
      console.error('Web search verification error:', error)
      return {
        verified: false,
        reason: 'Web search verification failed',
      }
    }
  }

  async discoverPlantFromWeb(query: string): Promise<PlantVerificationResponse> {
    // Check cache first (web discovery results are cached with 'web:' prefix)
    const cacheKey = `web:${query}`
    const cached = plantIdentificationCache.get(cacheKey)
    if (cached) {
      return cached
    }

    const prompt = webSearchDiscoveryPrompt(query)

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

      const textContent = response.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'No response received from web search discovery',
        }
      }

      let jsonStr = textContent.text.trim()

      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      jsonStr = jsonStr.trim()

      try {
        const parsed = JSON.parse(jsonStr) as PlantVerificationResponse & { source_url?: string }

        if (parsed.identified && parsed.plant) {
          if (!parsed.plant.common_name || !parsed.plant.top_level || !parsed.plant.middle_level) {
            return {
              identified: false,
              confidence: 'unknown',
              reason: 'Incomplete plant information from web search',
            }
          }
        }

        // Cache web discovery results
        plantIdentificationCache.set(cacheKey, parsed)

        return parsed
      } catch {
        return {
          identified: false,
          confidence: 'unknown',
          reason: 'Failed to parse web search discovery response',
        }
      }
    } catch (error) {
      console.error('Web search discovery error:', error)
      return {
        identified: false,
        confidence: 'unknown',
        reason: 'Web search discovery failed due to an error',
      }
    }
  }

  async suggestSpellingCorrection(query: string): Promise<SpellingSuggestion> {
    const prompt = spellingSuggestionPrompt(query)

    try {
      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        tools: [
          {
            type: 'web_search_20250305',
            name: 'web_search',
            max_uses: 3,
          },
        ],
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      })

      const textContent = response.content.find((block) => block.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        return {
          hasSuggestion: false,
          reason: 'No response received from spelling suggestion',
        }
      }

      let jsonStr = textContent.text.trim()

      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7)
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3)
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3)
      }
      jsonStr = jsonStr.trim()

      try {
        const parsed = JSON.parse(jsonStr) as SpellingSuggestion
        return parsed
      } catch {
        return {
          hasSuggestion: false,
          reason: 'Failed to parse spelling suggestion response',
        }
      }
    } catch (error) {
      console.error('Spelling suggestion error:', error)
      return {
        hasSuggestion: false,
        reason: 'Spelling suggestion failed due to an error',
      }
    }
  }
}
