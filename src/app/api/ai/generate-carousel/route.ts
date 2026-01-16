import type { NextRequest } from 'next/server'
import OpenAI from 'openai'

import { canvasTools, type ToolName } from '@/lib/ai/canvas-tools'
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

WORKFLOW - YOU MUST FOLLOW THESE STEPS FOR EACH SLIDE:
1. ALWAYS call create_slide first with a background color
2. ALWAYS call add_text for the headline (large text at top)
3. ALWAYS call add_text for the body text (smaller text below headline)
4. Optionally add shapes with add_rectangle or add_circle for visual interest
5. ALWAYS call complete_slide when done with a slide

CRITICAL: Every slide MUST have at least a headline and body text. Do not create empty slides.

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
        // Send start event
        send({
          type: 'start',
          data: { totalSlides: Math.min(slideCount, 10) },
        })

        const systemPrompt = buildSystemPrompt(body)
        const userPrompt = `Create a ${Math.min(slideCount, 10)}-slide carousel about: "${topic}"`

        // Create OpenAI stream with function calling
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          tools: canvasTools,
          tool_choice: 'auto',
          stream: false, // We'll use non-streaming for reliable tool calls
        })

        const message = response.choices[0]?.message
        if (!message) {
          throw new Error('No response from AI')
        }

        // Process tool calls
        const toolCalls = message.tool_calls || []
        let currentSlideIndex = 0
        let slidesCompleted = 0

        for (const toolCall of toolCalls) {
          // Skip non-function tool calls
          if (toolCall.type !== 'function') continue

          const toolName = toolCall.function.name as ToolName
          const args = JSON.parse(toolCall.function.arguments)

          // Send tool call event
          send({
            type: 'tool_call',
            data: { tool: toolName, args },
          })

          // Track slide progress
          if (toolName === 'create_slide') {
            currentSlideIndex++
            send({
              type: 'progress',
              data: {
                message: `Creating slide ${currentSlideIndex}...`,
                slideIndex: currentSlideIndex,
                totalSlides: Math.min(slideCount, 10),
              },
            })
          } else if (toolName === 'complete_slide') {
            slidesCompleted++
            send({
              type: 'slide_complete',
              data: {
                slideIndex: slidesCompleted,
                totalSlides: Math.min(slideCount, 10),
              },
            })
          }

          // Small delay between tool calls for visual effect
          await new Promise((resolve) => setTimeout(resolve, 100))
        }

        // If no tool calls were made or slides incomplete, generate with simpler approach
        if (slidesCompleted === 0) {
          // Fallback: Generate slide-by-slide with separate calls
          for (let i = 0; i < Math.min(slideCount, 10); i++) {
            send({
              type: 'progress',
              data: {
                message: `Creating slide ${i + 1}...`,
                slideIndex: i + 1,
                totalSlides: Math.min(slideCount, 10),
              },
            })

            const slideResponse = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: `Create slide ${i + 1} of ${Math.min(slideCount, 10)} for a carousel about: "${topic}". ${i === 0 ? 'This is the hook slide - make it attention-grabbing.' : ''} ${i === Math.min(slideCount, 10) - 1 ? 'This is the final slide - include a call-to-action.' : ''}`,
                },
              ],
              tools: canvasTools,
              tool_choice: 'required',
            })

            const slideMessage = slideResponse.choices[0]?.message
            const slideToolCalls = slideMessage?.tool_calls || []

            // Ensure create_slide is called first
            const hasCreateSlide = slideToolCalls.some(
              (tc) => tc.type === 'function' && tc.function.name === 'create_slide'
            )
            if (!hasCreateSlide) {
              // Send default create_slide with white background
              send({
                type: 'tool_call',
                data: { tool: 'create_slide', args: { backgroundColor: '#ffffff' } },
              })
              await new Promise((resolve) => setTimeout(resolve, 50))
            }

            for (const toolCall of slideToolCalls) {
              // Skip non-function tool calls
              if (toolCall.type !== 'function') continue

              const toolName = toolCall.function.name as ToolName
              const args = JSON.parse(toolCall.function.arguments)

              send({
                type: 'tool_call',
                data: { tool: toolName, args },
              })

              await new Promise((resolve) => setTimeout(resolve, 50))
            }

            // Ensure complete_slide is called
            const hasCompleteSlide = slideToolCalls.some(
              (tc) => tc.type === 'function' && tc.function.name === 'complete_slide'
            )
            if (!hasCompleteSlide) {
              send({
                type: 'tool_call',
                data: { tool: 'complete_slide', args: {} },
              })
            }

            send({
              type: 'slide_complete',
              data: {
                slideIndex: i + 1,
                totalSlides: Math.min(slideCount, 10),
              },
            })
          }

          slidesCompleted = Math.min(slideCount, 10)
        }

        // Send done event
        send({
          type: 'done',
          data: { slidesCreated: slidesCompleted },
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
