import type { NextRequest } from 'next/server'
import OpenAI from 'openai'

import { type CarouselData, carouselJsonSchema } from '@/lib/ai/carousel-schema'
import type { CarouselGenerationRequest, StreamEvent } from '@/lib/ai/streaming-types'
import { decryptApiKey } from '@/lib/encryption'
import { createClient } from '@/lib/supabase/server'
import type { ApiKey, Subscription } from '@/types/database'

type SubscriptionPlanStatus = Pick<Subscription, 'plan' | 'status'>
type ApiKeyEncrypted = Pick<ApiKey, 'encrypted_key'>

function createSSEStream() {
  const encoder = new TextEncoder()
  let controller: ReadableStreamDefaultController<Uint8Array>

  const stream = new ReadableStream<Uint8Array>({
    start(c) {
      controller = c
    },
  })

  const send = (event: StreamEvent) => {
    const data = `data: ${JSON.stringify(event)}\n\n`
    controller.enqueue(encoder.encode(data))
  }

  const close = () => {
    controller.close()
  }

  return { stream, send, close }
}

function buildSystemPrompt(request: CarouselGenerationRequest): string {
  const { canvasWidth, canvasHeight, brandKit, existingSlides, style, language } = request

  const styleInstructions = {
    professional:
      'Create a professional, business-focused design. Use clean layouts, ample whitespace, and a sophisticated color palette.',
    casual:
      'Create a friendly, approachable design. Use warm colors, relaxed layouts, and conversational tone.',
    educational:
      'Create a clear, informative design. Use structured layouts, numbered lists, and visual hierarchy to aid comprehension.',
    inspirational:
      'Create an emotional, motivating design. Use bold typography, impactful statements, and dynamic compositions.',
  }

  const languageInstruction =
    language === 'de' ? 'Write all text content in German.' : 'Write all text content in English.'

  let brandContext = ''
  if (brandKit) {
    const colors = brandKit.colors.map((c) => `${c.name}: ${c.hex}`).join(', ')
    const fonts = brandKit.fonts.map((f) => `${f.name}: ${f.family} ${f.weight}`).join(', ')
    brandContext = `
BRAND KIT - Use these consistently:
- Colors: ${colors}
- Fonts: ${fonts}
`
  }

  let existingContext = ''
  if (existingSlides && existingSlides.length > 0) {
    const colors = [...new Set(existingSlides.flatMap((s) => s.primaryColors))].slice(0, 5)
    existingContext = `
EXISTING SLIDES CONTEXT - Match this style:
- Primary colors used: ${colors.join(', ')}
- Background colors: ${existingSlides.map((s) => s.backgroundColor).join(', ')}
`
  }

  return `You are a professional carousel designer for social media. You create visually appealing LinkedIn/Instagram carousels.

CANVAS SIZE: ${canvasWidth}x${canvasHeight} pixels

${styleInstructions[style]}
${languageInstruction}
${brandContext}
${existingContext}

DESIGN GUIDELINES:
- Create clear visual hierarchy with headline, body text, and optional decorative elements
- Use generous padding (minimum 60px from edges)
- Headlines should be large (48-72px) and bold
- Body text should be readable (24-36px)
- Use shapes sparingly for visual interest (backgrounds, accents)
- Each slide should be complete and visually balanced
- The first slide should be a hook that grabs attention
- The last slide should have a call-to-action

CRITICAL REQUIREMENTS:
- Every slide MUST have at least 2 text elements: a headline (large) and body text (smaller)
- Use contrasting colors for text on background (e.g., dark text on light background)
- Position elements with proper spacing - don't overlap text elements
- Text width should be at most canvasWidth - 120px (for padding)

Create exactly the number of slides requested. Make each slide visually distinct but cohesive as a series.`
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get user's subscription
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const subscription = subscriptionData as SubscriptionPlanStatus | null

    const body: CarouselGenerationRequest = await request.json()
    const { topic, slideCount } = body

    // Validate request
    if (!topic || !slideCount) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get API key
    let apiKey: string | null = null

    if (subscription?.plan === 'byok' || subscription?.plan === 'pro') {
      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('provider', 'openai')
        .single()

      const apiKeyRecord = apiKeyData as ApiKeyEncrypted | null

      if (apiKeyRecord?.encrypted_key) {
        apiKey = decryptApiKey(apiKeyRecord.encrypted_key)
      }
    }

    if (!apiKey) {
      if (subscription?.plan === 'pro' && subscription?.status === 'active') {
        apiKey = process.env.OPENAI_API_KEY || null
      }
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: 'AI generation requires a Pro subscription or your own API keys',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Create OpenAI client
    const openai = new OpenAI({ apiKey })

    // Create SSE stream
    const { stream, send, close } = createSSEStream()

    // Start async processing
    ;(async () => {
      try {
        const totalSlideCount = Math.min(slideCount, 10)

        // Send start event
        send({
          type: 'start',
          data: { totalSlides: totalSlideCount },
        })

        send({
          type: 'progress',
          data: {
            message: 'Generating carousel content...',
            slideIndex: 0,
            totalSlides: totalSlideCount,
          },
        })

        const systemPrompt = buildSystemPrompt(body)
        const userPrompt = `Create a ${totalSlideCount}-slide carousel about: "${topic}"`

        // Create OpenAI request with Structured Output
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: carouselJsonSchema,
          },
        })

        const message = response.choices[0]?.message
        if (!message?.content) {
          throw new Error('No response from AI')
        }

        // Parse the structured response
        const carouselData: CarouselData = JSON.parse(message.content)

        if (!carouselData.slides || carouselData.slides.length === 0) {
          throw new Error('AI generated no slides')
        }

        // Stream each slide to the client
        for (let i = 0; i < carouselData.slides.length; i++) {
          const slide = carouselData.slides[i]
          if (!slide) continue

          send({
            type: 'progress',
            data: {
              message: `Creating slide ${i + 1}...`,
              slideIndex: i + 1,
              totalSlides: carouselData.slides.length,
            },
          })

          // Send slide data
          send({
            type: 'slide_data',
            data: {
              slideIndex: i,
              slide,
            },
          })

          // Small delay for visual effect
          await new Promise((resolve) => setTimeout(resolve, 150))

          send({
            type: 'slide_complete',
            data: {
              slideIndex: i + 1,
              totalSlides: carouselData.slides.length,
            },
          })
        }

        // Send done event
        send({
          type: 'done',
          data: { slidesCreated: carouselData.slides.length },
        })
      } catch (error) {
        console.error('AI generation error:', error)
        send({
          type: 'error',
          data: { message: error instanceof Error ? error.message : 'Generation failed' },
        })
      } finally {
        close()
      }
    })()

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('API error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
