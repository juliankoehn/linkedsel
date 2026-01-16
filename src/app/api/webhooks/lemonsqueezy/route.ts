import { type NextRequest, NextResponse } from 'next/server'

import { addCredits } from '@/lib/credits'
import {
  getPlanFromVariant,
  normalizeSubscriptionStatus,
  type SubscriptionStatus,
  verifyWebhookSignature,
} from '@/lib/lemonsqueezy'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Credits per plan per month
 * Pro users get monthly credits, BYOK users use their own API keys
 */
const CREDITS_PER_PLAN: Record<string, number> = {
  pro: 50, // 50 credits/month = ~12 premium or 25 standard or 50 basic generations
  byok: 0, // BYOK users don't need credits
  free: 0,
}

interface LemonSqueezyWebhookEvent {
  meta: {
    event_name: string
    custom_data?: {
      user_id?: string
    }
  }
  data: {
    id: string
    type: string
    attributes: {
      store_id: number
      customer_id: number
      order_id: number
      product_id: number
      variant_id: number
      product_name: string
      variant_name: string
      user_name: string
      user_email: string
      status: SubscriptionStatus
      status_formatted: string
      card_brand: string | null
      card_last_four: string | null
      pause: unknown | null
      cancelled: boolean
      trial_ends_at: string | null
      billing_anchor: number
      renews_at: string | null
      ends_at: string | null
      created_at: string
      updated_at: string
      test_mode: boolean
    }
  }
}

/**
 * Refill credits for a user based on their plan
 */
async function refillCredits(
  supabase: ReturnType<typeof createAdminClient>,
  userId: string,
  plan: string,
  reason: 'subscription_created' | 'subscription_renewed' | 'subscription_resumed'
) {
  const creditsToAdd = CREDITS_PER_PLAN[plan] ?? 0

  if (creditsToAdd === 0) {
    console.log(`No credits to add for plan: ${plan}`)
    return
  }

  try {
    const newBalance = await addCredits(supabase, userId, creditsToAdd, 'subscription_refill', {
      plan,
      reason,
      credits_added: creditsToAdd,
    })
    console.log(`Refilled ${creditsToAdd} credits for user ${userId}, new balance: ${newBalance}`)
  } catch (error) {
    console.error(`Failed to refill credits for user ${userId}:`, error)
    // Don't throw - credit refill failure shouldn't block subscription updates
  }
}

async function updateSubscription(
  supabase: ReturnType<typeof createAdminClient>,
  filter: { user_id?: string; lemon_subscription_id?: string },
  data: {
    plan?: string
    status?: string
    lemon_subscription_id?: string
    lemon_customer_id?: string
    current_period_end?: string | null
  }
) {
  let query = supabase.from('subscriptions').update(data)

  if (filter.user_id) {
    query = query.eq('user_id', filter.user_id)
  }
  if (filter.lemon_subscription_id) {
    query = query.eq('lemon_subscription_id', filter.lemon_subscription_id)
  }

  return query
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature header' }, { status: 401 })
    }

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature)
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event: LemonSqueezyWebhookEvent = JSON.parse(body)
    const eventName = event.meta.event_name
    const subscriptionId = event.data.id
    const attributes = event.data.attributes

    // Get user_id from custom data (passed during checkout)
    const userId = event.meta.custom_data?.user_id

    if (!userId) {
      console.error('No user_id in webhook custom_data', {
        eventName,
        subscriptionId,
      })
      return NextResponse.json({ error: 'Missing user_id in custom_data' }, { status: 400 })
    }

    const supabase = createAdminClient()

    switch (eventName) {
      case 'subscription_created': {
        const plan = getPlanFromVariant(String(attributes.variant_id))
        const status = normalizeSubscriptionStatus(attributes.status)
        const customerId = String(attributes.customer_id)

        // Check if subscription already exists
        const { data: existing } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', userId)
          .single()

        if (existing) {
          // Update existing subscription
          const { error } = await updateSubscription(
            supabase,
            { user_id: userId },
            {
              plan,
              status,
              lemon_subscription_id: subscriptionId,
              lemon_customer_id: customerId,
              current_period_end: attributes.renews_at,
            }
          )

          if (error) {
            console.error('Failed to update subscription', error)
            return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
          }
        } else {
          // Create new subscription
          const { error } = await supabase.from('subscriptions').insert({
            user_id: userId,
            plan,
            status,
            lemon_subscription_id: subscriptionId,
            lemon_customer_id: customerId,
            current_period_end: attributes.renews_at,
          } as never)

          if (error) {
            console.error('Failed to create subscription', error)
            return NextResponse.json({ error: 'Failed to create subscription' }, { status: 500 })
          }
        }

        // Refill credits for new subscription
        if (status === 'active') {
          await refillCredits(supabase, userId, plan, 'subscription_created')
        }

        break
      }

      case 'subscription_updated': {
        const plan = getPlanFromVariant(String(attributes.variant_id))
        const status = normalizeSubscriptionStatus(attributes.status)

        const { error } = await updateSubscription(
          supabase,
          { lemon_subscription_id: subscriptionId },
          {
            plan,
            status,
            current_period_end: attributes.renews_at,
          }
        )

        if (error) {
          console.error('Failed to update subscription', error)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }

        break
      }

      case 'subscription_cancelled':
      case 'subscription_expired': {
        const { error } = await updateSubscription(
          supabase,
          { lemon_subscription_id: subscriptionId },
          {
            status: 'cancelled',
            current_period_end: attributes.ends_at,
          }
        )

        if (error) {
          console.error('Failed to cancel subscription', error)
          return NextResponse.json({ error: 'Failed to cancel subscription' }, { status: 500 })
        }

        break
      }

      case 'subscription_resumed': {
        const plan = getPlanFromVariant(String(attributes.variant_id))
        const status = normalizeSubscriptionStatus(attributes.status)

        const { error } = await updateSubscription(
          supabase,
          { lemon_subscription_id: subscriptionId },
          {
            status,
            current_period_end: attributes.renews_at,
          }
        )

        if (error) {
          console.error('Failed to resume subscription', error)
          return NextResponse.json({ error: 'Failed to resume subscription' }, { status: 500 })
        }

        // Refill credits when subscription is resumed
        if (status === 'active') {
          await refillCredits(supabase, userId, plan, 'subscription_resumed')
        }

        break
      }

      case 'subscription_paused': {
        const { error } = await updateSubscription(
          supabase,
          { lemon_subscription_id: subscriptionId },
          {
            status: 'cancelled',
          }
        )

        if (error) {
          console.error('Failed to pause subscription', error)
          return NextResponse.json({ error: 'Failed to pause subscription' }, { status: 500 })
        }

        break
      }

      case 'subscription_payment_success': {
        // Monthly renewal - refill credits
        const plan = getPlanFromVariant(String(attributes.variant_id))
        console.log(`Payment success for subscription ${subscriptionId}, plan: ${plan}`)

        // Refill credits for successful payment (monthly renewal)
        await refillCredits(supabase, userId, plan, 'subscription_renewed')
        break
      }

      case 'subscription_payment_failed':
      case 'subscription_payment_recovered': {
        // Log payment events but don't need special handling
        // Status updates come through subscription_updated
        console.log(`Payment event: ${eventName}`, { subscriptionId })
        break
      }

      default:
        console.log(`Unhandled webhook event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
