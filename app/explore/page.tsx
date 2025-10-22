'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Item = { identifier: string, title?: string, year?: string, date?: string, venue?: string }

export default function ExplorePage() {
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Item[]>([])

  const run = async () => {
    const url = '/api/search?' + new URLSearchParams({ q })
    const res = await fetch(url)
    const data = await res.json()
    setItems(data.items || [])
  }

  useEffect(() => { run() }, [])

  return (
    <main className='container'>
      <h1>Explore</h1>
      <div className='row' style={{ marginTop: 12 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder='Search songs, venues, years…' />
        <button className='btn' onClick={run}>Search</button>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
        {items.map(it => (
          <Link key={it.identifier} href={`/shows/${it.year || 'unknown'}/${it.date || 'unknown'}/${it.identifier}`} className='card'>
            <div style={{ fontWeight: 600 }}>{it.title || it.identifier}</div>
            <div style={{ opacity: 0.7 }}>{[it.date, it.venue].filter(Boolean).join(' — ')}</div>
          </Link>
        ))}
      </div>
    </main>
  )
}
