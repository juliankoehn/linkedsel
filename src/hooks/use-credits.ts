'use client'

import { useCallback, useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'
import type { UserCredits } from '@/types/database'

interface UseCreditsReturn {
  credits: UserCredits | null
  creditsRemaining: number
  creditsUsedTotal: number
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useCredits(): UseCreditsReturn {
  const [credits, setCredits] = useState<UserCredits | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCredits = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setCredits(null)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError) {
        // User might not have credits record yet (PGRST116 = no rows)
        if (fetchError.code === 'PGRST116') {
          setCredits(null)
        } else {
          throw fetchError
        }
      } else {
        setCredits(data)
      }
    } catch (err) {
      console.error('Failed to fetch credits:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch credits'))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  return {
    credits,
    creditsRemaining: credits?.credits_remaining ?? 0,
    creditsUsedTotal: credits?.credits_used_total ?? 0,
    isLoading,
    error,
    refetch: fetchCredits,
  }
}
