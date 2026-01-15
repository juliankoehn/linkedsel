'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

export type SubscriptionPlan = 'free' | 'byok' | 'pro'

interface Subscription {
  plan: SubscriptionPlan
  status: string
  currentPeriodEnd: string | null
  lemonSubscriptionId: string | null
}

interface UseSubscriptionReturn {
  subscription: Subscription
  isLoading: boolean
  isPro: boolean
  isByok: boolean
  hasSubscription: boolean
  refetch: () => Promise<void>
}

const DEFAULT_SUBSCRIPTION: Subscription = {
  plan: 'free',
  status: 'active',
  currentPeriodEnd: null,
  lemonSubscriptionId: null,
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription>(DEFAULT_SUBSCRIPTION)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = useCallback(async () => {
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSubscription(DEFAULT_SUBSCRIPTION)
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !data) {
      // No subscription found, use free tier
      setSubscription(DEFAULT_SUBSCRIPTION)
    } else {
      const sub = data as {
        plan: string
        status: string
        current_period_end: string | null
        lemon_subscription_id: string | null
      }
      setSubscription({
        plan: (sub.plan as SubscriptionPlan) || 'free',
        status: sub.status || 'active',
        currentPeriodEnd: sub.current_period_end,
        lemonSubscriptionId: sub.lemon_subscription_id,
      })
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const isPro = subscription.plan === 'pro' && subscription.status === 'active'
  const isByok = subscription.plan === 'byok' && subscription.status === 'active'
  const hasSubscription = isPro || isByok

  return {
    subscription,
    isLoading,
    isPro,
    isByok,
    hasSubscription,
    refetch: fetchSubscription,
  }
}
