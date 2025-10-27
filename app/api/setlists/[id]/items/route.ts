import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabaseServer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/setlists/:id/items { afterPosition?: number, item: {...} }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Lazy init admin client and guard missing env
  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e: any) {
    return NextResponse.json({ error: 'Supabase admin not configured', detail: String(e) }, { status: 500 })
  }

  const setlist_id = params.id
  const body = await req.json().catch(() => ({}))
  const after = typeof body.afterPosition === 'number' ? body.afterPosition : null
  const item = body.item || {}
  const position = (after ?? -1) + 1

  const toInsert = {
    setlist_id,
    position,
    song_title: String(item.song_title || 'Song'),
    show_date: item.show_date ?? null,
    venue: item.venue ?? null,
    city: item.city ?? null,
    source_item_id: item.source_item_id ?? null,
    track_filename: item.track_filename ?? null,
    track_title: item.track_title ?? null,
    duration_seconds: item.duration_seconds ?? null,
    segue: !!item.segue,
    notes: item.notes ?? null,
  }

  const { data, error } = await supabase.from('setlist_items').insert(toInsert).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ item: data })
}

export async function GET(_req: NextRequest, ctx: { params: { id: string } }) {
  const id = ctx.params?.id
  if (!id) return NextResponse.json({ error: 'Missing setlist id' }, { status: 400 })

  let supabase
  try {
    supabase = getSupabaseAdmin()
  } catch (e: any) {
    return NextResponse.json({ error: 'Supabase admin not configured', detail: String(e) }, { status: 500 })
  }

  try {
    const { data, error } = await supabase
      .from('setlist_items')
      .select('*')
      .eq('setlist_id', id)
      .order('position', { ascending: true })
    if (error) throw error
    return NextResponse.json({ items: data ?? [] })
  } catch (e: any) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
