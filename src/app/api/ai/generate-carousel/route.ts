import type { NextRequest } from 'next/server'

import { GenerationPipeline, type PipelineEvent } from '@/lib/ai/pipeline'
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
    const { topic, slideCount, quality = 'basic' } = body

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

    // Create SSE stream
    const { stream, send, close } = createSSEStream()

    // Create abort controller for cancellation
    const abortController = new AbortController()

    // Handle client disconnect
    request.signal.addEventListener('abort', () => {
      abortController.abort()
    })

    // Start async processing with pipeline
    ;(async () => {
      try {
        const pipeline = new GenerationPipeline(
          apiKey,
          {
            topic: body.topic,
            style: body.style,
            slideCount: Math.min(body.slideCount, 10),
            language: body.language,
            quality,
            brandKit: body.brandKit,
            canvasWidth: body.canvasWidth,
            canvasHeight: body.canvasHeight,
          },
          (event: PipelineEvent) => {
            // Forward pipeline events to SSE stream
            send(event as unknown as StreamEvent)
          },
          abortController.signal
        )

        await pipeline.run()
      } catch (error) {
        console.error('AI generation error:', error)
        if (!abortController.signal.aborted) {
          send({
            type: 'error',
            data: { message: error instanceof Error ? error.message : 'Generation failed' },
          })
        }
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
