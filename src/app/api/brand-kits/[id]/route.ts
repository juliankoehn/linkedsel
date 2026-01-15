import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// GET /api/brand-kits/[id] - Get a single brand kit
export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: brandKit, error } = await supabase
    .from('brand_kits')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
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

  return NextResponse.json({
    brandKit: {
      id: kit.id,
      name: kit.name,
      colors: kit.colors,
      fonts: kit.fonts,
      logoUrl: kit.logo_url,
      createdAt: kit.created_at,
      updatedAt: kit.updated_at,
    },
  })
}

// PUT /api/brand-kits/[id] - Update a brand kit
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, colors, fonts, logoUrl } = body

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (name !== undefined) updateData.name = name
  if (colors !== undefined) updateData.colors = colors
  if (fonts !== undefined) updateData.fonts = fonts
  if (logoUrl !== undefined) updateData.logo_url = logoUrl

  const { data: brandKit, error } = await supabase
    .from('brand_kits')
    .update(updateData as never)
    .eq('id', id)
    .eq('user_id', user.id)
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

  return NextResponse.json({
    brandKit: {
      id: kit.id,
      name: kit.name,
      colors: kit.colors,
      fonts: kit.fonts,
      logoUrl: kit.logo_url,
      createdAt: kit.created_at,
      updatedAt: kit.updated_at,
    },
  })
}

// DELETE /api/brand-kits/[id] - Delete a brand kit
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase.from('brand_kits').delete().eq('id', id).eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
