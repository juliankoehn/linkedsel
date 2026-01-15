import { createCheckout, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js'
import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// Initialize LemonSqueezy
function initLemonSqueezy() {
  const apiKey = process.env.LEMONSQUEEZY_API_KEY
  if (!apiKey) {
    throw new Error('Missing LEMONSQUEEZY_API_KEY')
  }
  lemonSqueezySetup({ apiKey })
}

// POST /api/checkout - Create a checkout session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['byok', 'pro'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get variant ID based on plan
    const variantId =
      plan === 'pro'
        ? process.env.LEMONSQUEEZY_PRO_VARIANT_ID
        : process.env.LEMONSQUEEZY_BYOK_VARIANT_ID

    const storeId = process.env.LEMONSQUEEZY_STORE_ID

    if (!variantId || !storeId) {
      console.error('Missing LemonSqueezy configuration', {
        variantId,
        storeId,
      })
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 })
    }

    initLemonSqueezy()

    // Determine redirect URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin

    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
        },
      },
      checkoutOptions: {
        embed: false,
        media: true,
        logo: true,
      },
      productOptions: {
        enabledVariants: [parseInt(variantId, 10)],
        redirectUrl: `${baseUrl}/settings?checkout=success`,
        receiptButtonText: 'Zurück zur App',
        receiptLinkUrl: `${baseUrl}/settings`,
        receiptThankYouNote: 'Danke für dein Upgrade! Dein Account wurde aktiviert.',
      },
    })

    if (error) {
      console.error('LemonSqueezy checkout error:', error)
      return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 })
    }

    const checkoutUrl = data?.data?.attributes?.url

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 })
    }

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
