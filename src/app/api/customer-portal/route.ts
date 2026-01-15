import { getCustomer, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Initialize LemonSqueezy
function initLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('Missing LEMONSQUEEZY_API_KEY')
  }
  lemonSqueezySetup({ apiKey })
}

// POST /api/customer-portal - Get customer portal URL
export async function POST() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's subscription to find customer ID
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('lemon_customer_id, lemon_subscription_id')
      .eq('user_id', user.id)
      .single()

    const sub = subscription as {
      lemon_customer_id: string | null
      lemon_subscription_id: string | null
    } | null

    if (!sub?.lemon_customer_id) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
    }

    initLemonSqueezy()

    // Get customer to retrieve portal URL
    const { data, error } = await getCustomer(sub.lemon_customer_id)

    if (error) {
      console.error('LemonSqueezy customer error:', error)
      return NextResponse.json({ error: 'Failed to get customer portal' }, { status: 500 })
    }

    const portalUrl = data?.data?.attributes?.urls?.customer_portal

    if (!portalUrl) {
      return NextResponse.json({ error: 'No portal URL available' }, { status: 500 })
    }

    return NextResponse.json({ url: portalUrl })
  } catch (error) {
    console.error('Customer portal error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
