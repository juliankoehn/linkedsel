import { AnthropicProvider } from './providers/anthropic'
import { OpenAIProvider } from './providers/openai'
import type {
  AIProvider,
  AIProviderConfig,
  AIService,
  ContentGenerationRequest,
  ContentGenerationResponse,
} from './types'

export type { AIProvider, ContentGenerationRequest, ContentGenerationResponse }

export function createAIService(config: AIProviderConfig): AIService {
  switch (config.provider) {
    case 'openai':
      return new OpenAIProvider(config.apiKey)
    case 'anthropic':
      return new AnthropicProvider(config.apiKey)
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`)
  }
}

/**
 * Get the default AI service using environment variables.
 * This is used when the user doesn't have their own API keys.
 */
export function getDefaultAIService(): AIService | null {
  // Prefer Anthropic if available
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    return new AnthropicProvider(anthropicKey)
  }

  // Fallback to OpenAI
  const openaiKey = process.env.OPENAI_API_KEY
  if (openaiKey) {
    return new OpenAIProvider(openaiKey)
  }

  return null
}
