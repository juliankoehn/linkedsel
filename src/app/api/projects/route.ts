import { type NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

// GET /api/projects - List all projects for the current user
export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects })
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log('[POST /api/projects] No user found')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[POST /api/projects] User:', user.id)

  const body = await request.json()
  const { name, data } = body

  console.log('[POST /api/projects] Creating project:', {
    name,
    dataKeys: data ? Object.keys(data) : [],
  })

  const { data: project, error } = await supabase
    .from('projects')
    .insert({
      user_id: user.id,
      name: name || 'Neues Carousel',
      data: data || {},
    } as never)
    .select()
    .single()

  if (error) {
    console.error('[POST /api/projects] Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log('[POST /api/projects] Created project:', (project as { id: string }).id)
  return NextResponse.json({ project }, { status: 201 })
}
