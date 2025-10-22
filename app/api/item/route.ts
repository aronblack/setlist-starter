import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export async function GET(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'missing id' }, { status: 400 })

  const key = `arch:item:${id}`
  const cached = await kv.get(key)
  if (cached) return NextResponse.json(cached)

  const metaRes = await fetch(`https://archive.org/metadata/${id}`)
  const meta = await metaRes.json()

  const tracks = (meta.files ?? [])
    .filter((f: any) => /audio/.test(f.format) && /\.(mp3|ogg|flac)$/i.test(f.name))
    .map((f: any, i: number) => ({
      filename: f.name,
      title: f.title || f.track || f.name,
      track: Number(f.track) || i + 1,
      format: f.format,
      duration: Number(f.length) || null,
      url: `https://archive.org/download/${id}/${encodeURIComponent(f.name)}`
    }))
    .sort((a: any, b: any) => a.track - b.track)

  const payload = {
    identifier: id,
    metadata: {
      title: meta.metadata?.title,
      date: meta.metadata?.date,
      venue: meta.metadata?.venue,
      creator: meta.metadata?.creator,
      taper: meta.metadata?.taper,
      lineage: meta.metadata?.lineage
    },
    tracks
  }

  await kv.set(key, payload, { ex: 60 * 60 * 24 * 7 })
  return NextResponse.json(payload)
}
