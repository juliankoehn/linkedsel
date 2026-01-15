import { type NextRequest, NextResponse } from 'next/server'

import {
  createAIService,
  getDefaultAIService,
  type AIProvider,
  type ContentGenerationRequest,
} from '@/lib/ai'
import { createClient } from '@/lib/supabase/server'
import type { ApiKey, Subscription } from '@/types/database'

interface GenerateRequestBody extends ContentGenerationRequest {
  provider?: AIProvider
}

type SubscriptionPlanStatus = Pick<Subscription, 'plan' | 'status'>
type ApiKeyEncrypted = Pick<ApiKey, 'encrypted_key'>

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', user.id)
      .single()

    const subscription = subscriptionData as SubscriptionPlanStatus | null

    const body: GenerateRequestBody = await request.json()
    const { topic, style, slideCount, language, provider } = body

    // Validate request
    if (!topic || !style || !slideCount) {
      return NextResponse.json(
        { error: 'Missing required fields: topic, style, slideCount' },
        { status: 400 }
      )
    }

    // Determine which AI service to use
    let aiService

    // Check if user has BYOK plan and provided API keys
    if (subscription?.plan === 'byok' || subscription?.plan === 'pro') {
      // Check for user's own API keys
      const preferredProvider = provider || 'openai'
      const { data: apiKeyData } = await supabase
        .from('api_keys')
        .select('encrypted_key')
        .eq('user_id', user.id)
        .eq('provider', preferredProvider)
        .single()

      const apiKeyRecord = apiKeyData as ApiKeyEncrypted | null

      if (apiKeyRecord?.encrypted_key) {
        // TODO: Decrypt the key properly (for now using it directly)
        // In production, use proper encryption/decryption
        aiService = createAIService({
          provider: preferredProvider,
          apiKey: apiKeyRecord.encrypted_key,
        })
      }
    }

    // If no user API key, check subscription for pro plan (uses our keys)
    if (!aiService) {
      if (subscription?.plan === 'pro' && subscription?.status === 'active') {
        aiService = getDefaultAIService()
      }
    }

    if (!aiService) {
      return NextResponse.json(
        {
          error:
            'AI generation requires a Pro subscription or your own API keys with BYOK plan',
        },
        { status: 403 }
      )
    }

    // Generate content
    const result = await aiService.generateContent({
      topic,
      style,
      slideCount: Math.min(slideCount, 10), // Limit to 10 slides
      language: language || 'de',
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    )
  }
}
