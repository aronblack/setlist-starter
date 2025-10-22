import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// POST /api/setlists  { title: string, is_public?: boolean }
export async function POST(req: NextRequest) {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const title = (body?.title || '').trim()
  const is_public = body?.is_public ?? true
  if (!title) return NextResponse.json({ error: 'Missing title' }, { status: 400 })

  const { data, error } = await supabase
    .from('setlists')
    .insert({ title, is_public, owner_id: user.id })
    .select('*')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ setlist: data?.[0] })
}

// GET /api/setlists -> list current user's setlists
export async function GET() {
  const supabase = supabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ setlists: [] })

  const { data, error } = await supabase
    .from('setlists')
    .select('*')
    .eq('owner_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ setlists: data })
}
