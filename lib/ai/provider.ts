import type { AICareProfile, PlantContext, ChatMessage, ChatContext, GardenChatContext } from '@/types/database'
import type { PlantVerificationResponse } from './prompts/plant-verification'

export interface AIProvider {
  generateCareProfile(plantName: string, context: PlantContext, topLevel?: string): Promise<AICareProfile>
  chat(messages: ChatMessage[], context: ChatContext): Promise<string>
  gardenChat(messages: ChatMessage[], context: GardenChatContext): Promise<string>
  generateText(prompt: string): Promise<string>
  searchPlant(query: string): Promise<PlantVerificationResponse>
}

export interface AIResponse<T> {
  data: T | null
  error: string | null
}
