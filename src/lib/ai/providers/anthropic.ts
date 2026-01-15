import Anthropic from '@anthropic-ai/sdk'

import type { AIService, ContentGenerationRequest, ContentGenerationResponse } from '../types'

export class AnthropicProvider implements AIService {
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async generateContent(request: ContentGenerationRequest): Promise<ContentGenerationResponse> {
    const styleInstructions = {
      professional:
        'Verwende einen professionellen, geschäftlichen Ton. Fokussiere auf Fakten und Mehrwert.',
      casual: 'Schreibe locker und authentisch. Verwende eine persönliche Ansprache.',
      educational: 'Erkläre Konzepte klar und verständlich. Verwende Beispiele.',
      inspirational: 'Motiviere und inspiriere die Leser. Verwende emotionale Sprache.',
    }

    const languageInstructions =
      request.language === 'de' ? 'Antworte auf Deutsch.' : 'Answer in English.'

    const prompt = `Du bist ein LinkedIn Content Creator. Erstelle ein LinkedIn Carousel mit ${request.slideCount} Slides zum Thema "${request.topic}".

${styleInstructions[request.style]}
${languageInstructions}

Formatiere deine Antwort als JSON mit folgendem Schema:
{
  "slides": [
    {
      "headline": "Kurze, prägnante Überschrift",
      "body": "Haupttext des Slides (2-3 Sätze)",
      "callToAction": "Optional: Handlungsaufforderung für den letzten Slide"
    }
  ]
}

Die erste Slide sollte eine Hook sein, die letzte ein CTA.

Antworte NUR mit dem JSON, ohne zusätzlichen Text.`

    const response = await this.client.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      throw new Error('No content generated')
    }

    // Extract JSON from response (handle potential markdown code blocks)
    let jsonContent = textBlock.text.trim()
    if (jsonContent.startsWith('```')) {
      jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '')
    }

    return JSON.parse(jsonContent) as ContentGenerationResponse
  }
}
