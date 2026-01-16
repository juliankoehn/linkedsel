import { NextResponse } from 'next/server'

import { INITIAL_FREE_CREDITS } from '@/lib/credits/credits-service'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      // User doesn't have credits record yet - create one with initial free credits
      if (error.code === 'PGRST116') {
        // Use admin client to bypass RLS for initialization
        const adminClient = createAdminClient()

        // Use upsert to handle race conditions
        const { data: newCredits, error: insertError } = await adminClient
          .from('user_credits')
          .upsert(
            {
              user_id: user.id,
              credits_remaining: INITIAL_FREE_CREDITS,
              credits_used_total: 0,
            },
            { onConflict: 'user_id' }
          )
          .select()
          .single()

        if (insertError) {
          console.error('Failed to initialize user credits:', insertError)
          // Return default values if insert fails
          return NextResponse.json({
            credits_remaining: 0,
            credits_used_total: 0,
            last_refill_at: null,
          })
        }

        // Log the bonus transaction (ignore errors - non-critical)
        try {
          await adminClient.from('credit_transactions').insert({
            user_id: user.id,
            amount: INITIAL_FREE_CREDITS,
            type: 'bonus',
            metadata: { reason: 'welcome_bonus' },
            balance_after: INITIAL_FREE_CREDITS,
          })
        } catch {
          // Ignore transaction logging errors
        }

        return NextResponse.json(newCredits)
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch credits:', error)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
