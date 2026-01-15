import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

export type AdminClient = SupabaseClient<Database>

let adminClient: AdminClient | null = null

/**
 * Admin client for server-side operations without user context.
 * Uses the service role key - should only be used in trusted server environments.
 * Uses singleton pattern to avoid creating multiple instances.
 */
export function createAdminClient(): AdminClient {
  if (adminClient) {
    return adminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables for admin client')
  }

  adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
