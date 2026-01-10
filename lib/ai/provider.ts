import type { AICareProfile, PlantContext, ChatMessage, ChatContext } from '@/types/database'

export interface AIProvider {
  generateCareProfile(plantName: string, context: PlantContext, topLevel?: string): Promise<AICareProfile>
  chat(messages: ChatMessage[], context: ChatContext): Promise<string>
  generateText(prompt: string): Promise<string>
}

export interface AIResponse<T> {
  data: T | null
  error: string | null
}
