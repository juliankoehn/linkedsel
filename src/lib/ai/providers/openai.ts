import OpenAI from 'openai'

import type {
  AIService,
  ContentGenerationRequest,
  ContentGenerationResponse,
} from '../types'

export class OpenAIProvider implements AIService {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async generateContent(
    request: ContentGenerationRequest
  ): Promise<ContentGenerationResponse> {
    const styleInstructions = {
      professional:
        'Verwende einen professionellen, geschäftlichen Ton. Fokussiere auf Fakten und Mehrwert.',
      casual:
        'Schreibe locker und authentisch. Verwende eine persönliche Ansprache.',
      educational:
        'Erkläre Konzepte klar und verständlich. Verwende Beispiele.',
      inspirational:
        'Motiviere und inspiriere die Leser. Verwende emotionale Sprache.',
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

Die erste Slide sollte eine Hook sein, die letzte ein CTA.`

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    return JSON.parse(content) as ContentGenerationResponse
  }
}
