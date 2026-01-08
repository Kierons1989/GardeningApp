import type { AIProvider } from './provider'
import { AnthropicProvider } from './anthropic'

// Factory function to get the configured AI provider
export function getAIProvider(): AIProvider {
  // For now, we only support Anthropic
  // In the future, this could check environment variables or user settings
  // to return different providers (OpenAI, local models, etc.)
  return new AnthropicProvider()
}

// Re-export types for convenience
export type { AIProvider } from './provider'
