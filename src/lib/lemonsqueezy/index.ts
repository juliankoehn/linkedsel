import crypto from 'node:crypto'
import { getAuthenticatedUser, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'

/**
 * Initialize LemonSqueezy SDK
 */
export function initLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY

  if (!apiKey) {
    throw new Error('Missing LEMONSQUEEZY_API_KEY environment variable')
  }

  lemonSqueezySetup({ apiKey })
}

/**
 * Verify webhook signature from LemonSqueezy
 */
export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET

  if (!secret) {
    throw new Error('Missing LEMONSQUEEZY_WEBHOOK_SECRET environment variable')
  }

  const hmac = crypto.createHmac('sha256', secret)
  const digest = hmac.update(payload).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}

/**
 * Test LemonSqueezy API connection
 */
export async function testConnection() {
  initLemonSqueezy()
  const { data, error } = await getAuthenticatedUser()

  if (error) {
    throw new Error(`LemonSqueezy connection failed: ${error.message}`)
  }

  return data
}

/**
 * Plan mapping from LemonSqueezy variant IDs to our plan names
 */
export const PLAN_VARIANTS: Record<string, string> = {
  // These IDs will be set in LemonSqueezy dashboard
  // Format: variant_id -> plan_name
  [process.env.LEMONSQUEEZY_BYOK_VARIANT_ID || '']: 'byok',
  [process.env.LEMONSQUEEZY_PRO_VARIANT_ID || '']: 'pro',
}

/**
 * Get plan name from variant ID
 */
export function getPlanFromVariant(variantId: string): string {
  return PLAN_VARIANTS[variantId] || 'free'
}

/**
 * Subscription status mapping
 */
export type SubscriptionStatus =
  | 'on_trial'
  | 'active'
  | 'paused'
  | 'past_due'
  | 'unpaid'
  | 'cancelled'
  | 'expired'

/**
 * Convert LemonSqueezy status to our simplified status
 */
export function normalizeSubscriptionStatus(
  status: SubscriptionStatus
): 'active' | 'cancelled' | 'past_due' {
  switch (status) {
    case 'on_trial':
    case 'active':
      return 'active'
    case 'past_due':
    case 'unpaid':
      return 'past_due'
    case 'paused':
    case 'cancelled':
    case 'expired':
      return 'cancelled'
    default:
      return 'cancelled'
  }
}
