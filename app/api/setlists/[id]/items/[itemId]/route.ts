import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../../../../lib/supabaseServer'

export async function PATCH(req: NextRequest, { params }: { params: { id: string, itemId: string } }) {
  const supabase = supabaseServer()
  const body = await req.json().catch(() => ({}))
  const patch: any = {}
  ;['position','song_title','show_date','venue','city','source_item_id','track_filename','track_title','duration_seconds','segue','notes']
    .forEach(k => { if (k in body) patch[k] = body[k] })

  const { data, error } = await supabase.from('setlist_items').update(patch).eq('id', params.itemId).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ item: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string, itemId: string } }) {
  const supabase = supabaseServer()
  const { error } = await supabase.from('setlist_items').delete().eq('id', params.itemId)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
