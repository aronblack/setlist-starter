'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = { identifier: string, title?: string, year?: string | number, date?: string, venue?: string }

export default function ExplorePage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Item[]>([])
  const [nextPage, setNextPage] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = async (page = 1, replace = false) => {
    const query = q.trim()
    if (!query) {
      setItems([]); setNextPage(null); setError(null)
      return
    }
    setLoading(true); setError(null)
    try {
      const url = '/api/search?' + new URLSearchParams({ q: query, page: String(page) })
      const res = await fetch(url, { cache: 'no-store' })
      if (!res.ok) {
        setError(`Search failed (${res.status})`)
        return
      }
      const data = await res.json()
      setItems(prev => replace ? (data.items || []) : [...prev, ...(data.items || [])]) // functional updater avoids stale closures
      setNextPage(data.nextPage ?? null)
    } catch (e: any) {
      setError('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const run = () => fetchPage(1, true)
  const loadMore = () => nextPage && fetchPage(nextPage, false)

  useEffect(() => { /* optional: initial empty search does nothing */ }, [])

  return (
    <main className='container'>
      <h1>Explore</h1>
      <div className='row' style={{ marginTop: 12, gap: 8 }}>
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && run()}
          placeholder='Search songs, venues, years…'
        />
        <button className='btn' onClick={run} disabled={loading || !q.trim()}>
          {loading ? 'Searching…' : 'Search'}
        </button>
      </div>

      {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}

      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        {items.map(it => (
          <Link key={it.identifier} href={`/shows/${it.year || 'unknown'}/${it.date || 'unknown'}/${it.identifier}`} className='card'>
            <div style={{ fontWeight: 600 }}>{it.title || it.identifier}</div>
            <div style={{ opacity: 0.7 }}>{[it.date, it.venue].filter(Boolean).join(' — ')}</div>
          </Link>
        ))}
        {!loading && q.trim() && items.length === 0 && <div>No results.</div>}
      </div>

      {nextPage && (
        <div style={{ marginTop: 16 }}>
          <button className='btn' onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </main>
  )
}
