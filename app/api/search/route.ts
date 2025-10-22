import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

const ARCHIVE = 'https://archive.org/advancedsearch.php'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const year = searchParams.get('year') ?? ''
  const page = Number(searchParams.get('page') ?? 1)

  const key = `arch:search:${q}:${year}:${page}`
  const cached = await kv.get(key)
  if (cached) return NextResponse.json(cached)

  const query = [
    `q=collection:(GratefulDead) AND mediatype:(audio)`,
    q ? `AND (${q})` : '',
    year ? `AND year:${year}` : ''
  ].join(' ')

  const url = `${ARCHIVE}?${new URLSearchParams({
    q: query,
    fl: ['identifier', 'title', 'year', 'venue', 'date'].join(','),
    sort: 'date asc',
    rows: '50',
    page: String(page),
    output: 'json'
  })}`

  const res = await fetch(url, { next: { revalidate: 86400 } })
  const data = await res.json()

  const items = data.response.docs.map((d: any) => ({
    identifier: d.identifier,
    title: d.title,
    year: d.year,
    date: d.date,
    venue: d.venue
  }))

  const payload = { items, nextPage: page + 1 }
  await kv.set(key, payload, { ex: 60 * 60 * 24 })
  return NextResponse.json(payload)
}
