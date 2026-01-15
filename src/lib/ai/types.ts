export type AIProvider = 'openai' | 'anthropic'

export interface AIProviderConfig {
  provider: AIProvider
  apiKey: string
}

export interface ContentGenerationRequest {
  topic: string
  style: 'professional' | 'casual' | 'educational' | 'inspirational'
  slideCount: number
  language: 'de' | 'en'
}

export interface GeneratedSlide {
  headline: string
  body: string
  callToAction?: string
}

export interface ContentGenerationResponse {
  slides: GeneratedSlide[]
}

export interface AIService {
  generateContent(
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse>
}
