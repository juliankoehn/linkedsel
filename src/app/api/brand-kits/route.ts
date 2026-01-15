import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// GET /api/brand-kits - List all brand kits for the current user
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: brandKits, error } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to match frontend interface
  type BrandKitRow = {
    id: string
    name: string
    colors: unknown
    fonts: unknown
    logo_url: string | null
    created_at: string
    updated_at: string
  }
  const transformed = (brandKits as BrandKitRow[]).map((kit) => ({
    id: kit.id,
    name: kit.name,
    colors: kit.colors || [],
    fonts: kit.fonts || [],
    logoUrl: kit.logo_url,
    createdAt: kit.created_at,
    updatedAt: kit.updated_at,
  }))

  return NextResponse.json({ brandKits: transformed })
}

// POST /api/brand-kits - Create a new brand kit
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, colors, fonts, logoUrl } = body

  const { data: brandKit, error } = await supabase
    .from('brand_kits')
    .insert({
      user_id: user.id,
      name: name || 'Neues Brand Kit',
      colors: colors || [],
      fonts: fonts || [],
      logo_url: logoUrl || null,
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const kit = brandKit as {
    id: string
    name: string
    colors: unknown
    fonts: unknown
    logo_url: string | null
    created_at: string
    updated_at: string
  }

  return NextResponse.json(
    {
      brandKit: {
        id: kit.id,
        name: kit.name,
        colors: kit.colors,
        fonts: kit.fonts,
        logoUrl: kit.logo_url,
        createdAt: kit.created_at,
        updatedAt: kit.updated_at,
      },
    },
    { status: 201 }
  )
}
