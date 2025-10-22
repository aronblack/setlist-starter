import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

// POST /api/setlists/:id/items { afterPosition?: number, item: {...} }
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
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
    notes: item.notes ?? null
  }

  const { data, error } = await supabase.from('setlist_items').insert(toInsert).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ item: data })
}
