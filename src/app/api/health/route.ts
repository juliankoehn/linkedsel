import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const REQUIRED_TABLES = [
  'projects',
  'subscriptions',
  'brand_kits',
  'templates',
  'api_keys',
]

export async function GET() {
  const supabase = await createClient()
  const issues: string[] = []

  // Check auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError) {
    issues.push(`Auth error: ${authError.message}`)
  }

  // Check tables exist by trying to query them
  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1)
    if (error) {
      if (error.message.includes('does not exist') || error.code === '42P01') {
        issues.push(`Tabelle '${table}' fehlt - Migration ausführen!`)
      } else if (!error.message.includes('permission denied')) {
        // Ignore RLS permission errors, that's expected when not logged in
        issues.push(`Tabelle '${table}': ${error.message}`)
      }
    }
  }

  if (issues.length > 0) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        issues,
        hint: 'Führe die SQL Migration in Supabase aus: supabase/migrations/001_initial_schema.sql',
      },
      { status: 503 }
    )
  }

  return NextResponse.json({
    status: 'healthy',
    user: user ? { id: user.id, email: user.email } : null,
  })
}
