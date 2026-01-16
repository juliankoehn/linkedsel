import { NextResponse } from 'next/server'

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
      // User might not have credits record yet
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          credits_remaining: 0,
          credits_used_total: 0,
          last_refill_at: null,
        })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch credits:', error)
    return NextResponse.json({ error: 'Failed to fetch credits' }, { status: 500 })
  }
}
