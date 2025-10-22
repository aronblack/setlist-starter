import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '../../../../lib/supabaseServer'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const id = params.id

  const { data: setlist, error: e1 } = await supabase
    .from('setlists')
    .select('*')
    .eq('id', id)
    .single()
  if (e1) return NextResponse.json({ error: e1.message }, { status: 404 })

  const { data: items, error: e2 } = await supabase
    .from('setlist_items')
    .select('*')
    .eq('setlist_id', id)
    .order('position', { ascending: true })
  if (e2) return NextResponse.json({ error: e2.message }, { status: 400 })

  return NextResponse.json({ setlist, items })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const id = params.id
  const body = await req.json().catch(() => ({}))
  const patch: any = {}
  if (typeof body.title === 'string') patch.title = body.title
  if (typeof body.is_public === 'boolean') patch.is_public = body.is_public
  if (Object.keys(patch).length === 0) return NextResponse.json({ ok: true })

  const { data, error } = await supabase.from('setlists').update(patch).eq('id', id).select('*').single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ setlist: data })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const id = params.id
  const { error } = await supabase.from('setlists').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
