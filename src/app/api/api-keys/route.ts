import { type NextRequest, NextResponse } from 'next/server'

import { encrypt } from '@/lib/encryption'
import { createClient } from '@/lib/supabase/server'

// GET /api/api-keys - List all API keys for the current user (without the actual keys)
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: apiKeys, error } = await supabase
    .from('api_keys')
    .select('id, provider, created_at')
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ apiKeys })
}

// POST /api/api-keys - Create or update an API key
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { provider, key } = body

  if (!provider || !key) {
    return NextResponse.json(
      { error: 'Provider and key are required' },
      { status: 400 }
    )
  }

  if (!['openai', 'anthropic'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const encryptedKey = encrypt(key)

  // Check if key already exists for this provider
  const { data: existing } = await supabase
    .from('api_keys')
    .select('id')
    .eq('user_id', user.id)
    .eq('provider', provider)
    .single()

  if (existing) {
    // Update existing key
    const existingId = (existing as { id: string }).id
    const { error } = await supabase
      .from('api_keys')
      .update({ encrypted_key: encryptedKey } as never)
      .eq('id', existingId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'API Key updated' })
  } else {
    // Create new key
    const { error } = await supabase.from('api_keys').insert({
      user_id: user.id,
      provider,
      encrypted_key: encryptedKey,
    } as never)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'API Key saved' }, { status: 201 })
  }
}

// DELETE /api/api-keys - Delete an API key
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const provider = searchParams.get('provider')

  if (!provider) {
    return NextResponse.json({ error: 'Provider is required' }, { status: 400 })
  }

  const { error } = await supabase
    .from('api_keys')
    .delete()
    .eq('user_id', user.id)
    .eq('provider', provider)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
