import type { AICareProfile, PlantContext, ChatMessage, ChatContext } from '@/types/database'
import type { PlantVerificationResponse, SpellingSuggestion } from './prompts/plant-verification'

export interface PlantWebVerificationResult {
  verified: boolean;
  scientific_name?: string;
  source_url?: string;
  corrections?: {
    top_level?: string;
    middle_level?: string;
  };
  reason?: string;
}

export interface AIProvider {
  generateCareProfile(plantName: string, context: PlantContext, topLevel?: string): Promise<AICareProfile>
  chat(messages: ChatMessage[], context: ChatContext): Promise<string>
  generateText(prompt: string): Promise<string>
  identifyPlant(query: string): Promise<PlantVerificationResponse>
  verifyPlantWithWebSearch(query: string, initialIdentification: string): Promise<PlantWebVerificationResult>
  discoverPlantFromWeb(query: string): Promise<PlantVerificationResponse>
  suggestSpellingCorrection(query: string): Promise<SpellingSuggestion>
}

export interface AIResponse<T> {
  data: T | null
  error: string | null
}
