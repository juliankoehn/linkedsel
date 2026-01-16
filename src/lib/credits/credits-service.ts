/**
 * Credits Service
 * Handles credit operations: check balance, deduct, add, and transaction history
 */

import type { SupabaseClient } from '@supabase/supabase-js'

import type { CreditTransaction, Database, Json, UserCredits } from '@/types/database'

export type CreditTransactionType =
  | 'subscription_refill'
  | 'purchase'
  | 'generation'
  | 'bonus'
  | 'refund'

export interface CreditMetadata {
  quality?: 'basic' | 'standard' | 'premium'
  carousel_id?: string
  project_id?: string
  [key: string]: unknown
}

/**
 * Get user's current credit balance
 */
export async function getUserCredits(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<UserCredits | null> {
  const { data, error } = await supabase
    .from('user_credits')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    // User might not have credits record yet
    if (error.code === 'PGRST116') {
      return null
    }
    throw error
  }

  return data
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(
  supabase: SupabaseClient<Database>,
  userId: string,
  requiredCredits: number
): Promise<boolean> {
  const credits = await getUserCredits(supabase, userId)
  return credits !== null && credits.credits_remaining >= requiredCredits
}

/**
 * Deduct credits from user account using database function
 * Returns true if successful, false if insufficient credits
 */
export async function deductCredits(
  supabase: SupabaseClient<Database>,
  userId: string,
  amount: number,
  type: CreditTransactionType,
  metadata?: CreditMetadata
): Promise<boolean> {
  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_metadata: metadata as unknown as Json,
  })

  if (error) {
    console.error('Failed to deduct credits:', error)
    throw error
  }

  return data === true
}

/**
 * Add credits to user account using database function
 * Returns the new balance
 */
export async function addCredits(
  supabase: SupabaseClient<Database>,
  userId: string,
  amount: number,
  type: CreditTransactionType,
  metadata?: CreditMetadata
): Promise<number> {
  const { data, error } = await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_metadata: metadata as unknown as Json,
  })

  if (error) {
    console.error('Failed to add credits:', error)
    throw error
  }

  return data as number
}

/**
 * Get user's credit transaction history
 */
export async function getCreditTransactions(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<CreditTransaction[]> {
  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    throw error
  }

  return data
}

/**
 * Initialize credits for a user if they don't have a record yet
 * (Usually handled by database trigger, but can be called manually)
 */
export async function initializeUserCredits(
  supabase: SupabaseClient<Database>,
  userId: string,
  initialCredits: number = 0
): Promise<UserCredits> {
  const existing = await getUserCredits(supabase, userId)
  if (existing) {
    return existing
  }

  const { data, error } = await supabase
    .from('user_credits')
    .insert({
      user_id: userId,
      credits_remaining: initialCredits,
      credits_used_total: 0,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Get credits required for a quality tier
 */
export function getCreditsForQuality(quality: 'basic' | 'standard' | 'premium'): number {
  switch (quality) {
    case 'basic':
      return 1
    case 'standard':
      return 2
    case 'premium':
      return 4
  }
}
