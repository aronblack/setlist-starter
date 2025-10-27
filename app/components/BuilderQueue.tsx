'use client'

import { useEffect, useState } from 'react'
const KEY = 'gd:builder:queue'

type Item = {
  identifier: string
  url: string
  title: string
  trackNum?: number | null
  date?: string
  venue?: string
  addedAt: number
}

export default function BuilderQueue() {
  const [items, setItems] = useState<Item[]>([])
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || '[]')) } catch {}
  }, [])
  const remove = (url: string) => {
    const next = items.filter(i => i.url !== url)
    localStorage.setItem(KEY, JSON.stringify(next))
    setItems(next)
  }
  const clear = () => { localStorage.removeItem(KEY); setItems([]) }

  if (items.length === 0) return null

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Queued Tracks ({items.length})</strong>
        <button className="btn" onClick={clear}>Clear</button>
      </div>
      <ul style={{ marginTop: 8 }}>
        {items.map(i => (
          <li key={i.url} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '6px 0' }}>
            <span style={{ flex: 1 }}>{i.title}</span>
            <audio src={i.url} controls preload="none" style={{ width: 240 }} />
            <button className="btn" onClick={() => remove(i.url)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  )
}