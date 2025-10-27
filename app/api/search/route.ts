import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'

export const runtime = 'nodejs'
export const revalidate = 0
export const dynamic = 'force-dynamic'

const ARCHIVE = 'https://archive.org/advancedsearch.php'
const METADATA = 'https://archive.org/metadata'

// Escape Lucene special characters
function escapeLucene(input: string) {
  return input.replace(/[+\-!(){}\[\]^"~*?:\\/]/g, '\\$&')
}

// Optional connectivity probe when debug is on
async function probeArchive(fetchOptions: any) {
  const pingUrl = 'https://archive.org/advancedsearch.php?q=collection%3AGratefulDead&rows=1&page=1&output=json'
  try {
    const r = await fetch(pingUrl, fetchOptions)
    const status = r.status
    let text = ''
    try { text = await r.text() } catch {}
    return { pingUrl, status, sample: text.slice(0, 200) }
  } catch (e: any) {
    return { pingUrl, error: String(e) }
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const rawQ = (sp.get('q') || sp.get('query') || sp.get('term') || '').trim()
  if (!rawQ) return NextResponse.json({ items: [] })

  const qEsc = escapeLucene(rawQ)
  const qWild = `${qEsc}*`
  const qLower = rawQ.toLowerCase()

  const year = sp.get('year')?.trim() ?? ''
  const page = Number(sp.get('page') ?? 1)
  const noCache = sp.has('nocache')
  const debug = sp.has('debug')

  const CACHE_V = 'v2' // bump to invalidate old empty caches
  const key = `arch:search:${CACHE_V}:${rawQ}:${year}:${page}`

  if (!noCache) {
    const cached = await kv.get(key)
    if (cached) return NextResponse.json(cached)
  }

  const headers = {
    'User-Agent': 'gd-setlist-dev/1.0 (+localhost)',
    'Accept': 'application/json, text/plain, */*',
  }

  const fetchOptions: any = noCache
    ? { cache: 'no-store', headers }
    : { next: { revalidate: 86400 }, headers }

  const debugInfo: any = debug ? { fetchOptionsKind: noCache ? 'no-store' : 'revalidate' } : undefined
  if (debug) {
    debugInfo.ping = await probeArchive({ cache: 'no-store', headers })
  }

  const clauses = [
    'collection:GratefulDead',
    '(mediatype:etree OR mediatype:audio)',
  ]

  // Item-level fields (many shows won't include song names here)
  const fields = ['title', 'subject', 'description', 'coverage', 'notes']
  const searchClause = fields
    .map(f => `${f}:(\"${qEsc}\" OR ${qWild})`)
    .join(' OR ')
  clauses.push(`(${searchClause})`)
  if (year) clauses.push(`(year:${year} OR date:${year})`)
  const query = clauses.join(' AND ')

  const params = new URLSearchParams()
  params.set('q', query)
  ;['identifier','title','year','coverage','date','creator'].forEach(f => params.append('fl[]', f))
  params.append('sort[]', 'date asc')
  params.set('rows', '50')
  params.set('page', String(page))
  params.set('output', 'json')
  const url = `${ARCHIVE}?${params.toString()}`

  let docs: any[] = []
  let urlFallback: string | undefined
  let urlTrackScan: string | undefined
  let counts = { initial: 0, fallback: 0, candidates: 0, matched: 0 }
  let statusInitial: number | undefined
  let statusFallback: number | undefined
  let statusScan: number | undefined

  // Initial query
  try {
    const res = await fetch(url, fetchOptions)
    statusInitial = res.status
    if (res.ok) {
      const data = await res.json()
      docs = data?.response?.docs ?? []
      counts.initial = docs.length
    }
  } catch (e) {
    if (debug) debugInfo.initialError = String(e)
  }

  // Fallback A: unfielded search across all metadata
  if (docs.length === 0) {
    const clausesFallback = [
      'collection:GratefulDead',
      '(mediatype:etree OR mediatype:audio)',
      `(${qEsc} OR ${qWild})`,
    ]
    if (year) clausesFallback.push(`(year:${year} OR date:${year})`)
    const queryFallback = clausesFallback.join(' AND ')
    const pf = new URLSearchParams()
    pf.set('q', queryFallback)
    ;['identifier','title','year','coverage','date','creator'].forEach(f => pf.append('fl[]', f))
    pf.append('sort[]', 'date asc')
    pf.set('rows', '50')
    pf.set('page', String(page))
    pf.set('output', 'json')
    urlFallback = `${ARCHIVE}?${pf.toString()}`

    try {
      const res = await fetch(urlFallback, fetchOptions)
      statusFallback = res.status
      if (res.ok) {
        const data = await res.json()
        docs = data?.response?.docs ?? []
        counts.fallback = docs.length
      }
    } catch (e) {
      if (debug) debugInfo.fallbackError = String(e)
    }
  }

  // Fallback B: track-scan — fetch item metadata and match file titles
  if (docs.length === 0) {
    const clausesScan = [
      'collection:GratefulDead',
      '(mediatype:etree OR mediatype:audio)',
      '(format:"VBR MP3" OR format:Flac OR format:"Ogg Vorbis")',
    ]
    if (year) clausesScan.push(`(year:${year} OR date:${year})`)
    const qScan = clausesScan.join(' AND ')
    const ps = new URLSearchParams()
    ps.set('q', qScan)
    ;['identifier','title','year','coverage','date','creator'].forEach(f => ps.append('fl[]', f))
    ps.append('sort[]', 'date asc')
    ps.set('rows', '120') // scan up to 120 items
    ps.set('page', String(page))
    ps.set('output', 'json')
    urlTrackScan = `${ARCHIVE}?${ps.toString()}`

    let candidates: any[] = []
    try {
      const rScan = await fetch(urlTrackScan, fetchOptions)
      statusScan = rScan.status
      if (rScan.ok) {
        const dScan = await rScan.json()
        candidates = dScan?.response?.docs ?? []
      }
    } catch (e) {
      if (debug) debugInfo.scanError = String(e)
    }
    counts.candidates = candidates.length

    const itemsMatched: any[] = []
    for (const d of candidates) {
      try {
        const metaKey = `arch:meta:${d.identifier}`
        let meta: any | null = null
        if (!noCache) {
          meta = (await kv.get(metaKey)) as any
        }
        if (!meta) {
          const rMeta = await fetch(`${METADATA}/${d.identifier}`, { cache: 'no-store', headers } as any)
          if (!rMeta.ok) continue
          meta = await rMeta.json()
          if (!noCache) await kv.set(metaKey, meta, { ex: 60 * 60 * 24 * 7 })
        }

        const files: any[] = Array.isArray(meta?.files) ? meta.files : []
        const hasMatch = files.some(f => {
          const t = (f?.title || f?.name || '').toString().toLowerCase()
          return t.includes(qLower)
        })
        if (hasMatch) {
          itemsMatched.push({
            identifier: d.identifier,
            title: d.title,
            year: d.year,
            date: d.date,
            venue: d.coverage,
          })
        }
        if (itemsMatched.length >= 50) break
      } catch {}
    }
    counts.matched = itemsMatched.length
    docs = itemsMatched
  }

  const items = docs.map((d: any) => ({
    identifier: d.identifier,
    title: d.title,
    year: d.year,
    date: d.date,
    venue: d.coverage,
  }))

  const payload: any = { items, nextPage: items.length === 50 ? page + 1 : null }
  if (debug) {
    payload.debug = {
      url,
      urlFallback,
      urlTrackScan,
      counts,
      statusInitial,
      statusFallback,
      statusScan,
      ...debugInfo,
    }
  }

  // Safe-cache: skip or swallow KV errors in prod
  if (!noCache) {
    try {
      if (items.length > 0) {
        await (kv as any)?.set?.(key, payload, { ex: 60 * 60 * 24 })
      } else {
        // optional negative cache
        // await (kv as any)?.set?.(key, payload, { ex: 60 * 5 })
      }
    } catch (e) {
      if (debug) (payload as any).debug.kvSetError = String(e)
    }
  }

  return NextResponse.json(payload)
}
