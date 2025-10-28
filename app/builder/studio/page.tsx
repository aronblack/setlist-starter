'use client'

import { useEffect, useMemo, useState } from 'react'
import { usePlayer } from '@/app/components/PlayerProvider'

type BuilderItem = {
  id: string
  title: string
  segue: boolean
  url?: string
  identifier?: string
  trackNum?: number | null
  date?: string
  venue?: string
}

const KEY_ITEMS = 'gd:builder:items'
const KEY_META = 'gd:builder:meta'

function uid() {
  return Math.random().toString(36).slice(2)
}

export default function StudioPage() {
  const { queue, current, playing, playAt, remove: removeFromQueue, clear: clearQueue } = usePlayer()
  const [title, setTitle] = useState('My Setlist')
  const [items, setItems] = useState<BuilderItem[]>([])

  // Load/persist builder draft
  useEffect(() => {
    try {
      const meta = JSON.parse(localStorage.getItem(KEY_META) || '{}')
      if (meta?.title) setTitle(meta.title)
    } catch {}
    try {
      const saved = JSON.parse(localStorage.getItem(KEY_ITEMS) || '[]')
      if (Array.isArray(saved)) setItems(saved)
    } catch {}
  }, [])
  useEffect(() => {
    localStorage.setItem(KEY_META, JSON.stringify({ title }))
  }, [title])
  useEffect(() => {
    localStorage.setItem(KEY_ITEMS, JSON.stringify(items))
  }, [items])

  // Builder helpers
  const addFromQueue = (q: any) => {
    setItems(xs =>
      xs.concat({
        id: uid(),
        title: q.title || q.url || 'Track',
        segue: false,
        url: q.url,
        identifier: q.identifier,
        trackNum: q.trackNum,
        date: q.date,
        venue: q.venue,
      })
    )
  }
  const addAllFromQueue = () => {
    if (!queue.length) return
    setItems(xs =>
      xs.concat(
        queue.map(q => ({
          id: uid(),
          title: q.title || q.url || 'Track',
          segue: false,
          url: q.url,
          identifier: q.identifier,
          trackNum: q.trackNum,
          date: q.date,
          venue: q.venue,
        }))
      )
    )
  }
  const removeItem = (id: string) => setItems(xs => xs.filter(x => x.id !== id))
  const toggleSegue = (id: string) =>
    setItems(xs => xs.map(x => (x.id === id ? { ...x, segue: !x.segue } : x)))
  const move = (id: string, dir: -1 | 1) =>
    setItems(xs => {
      const i = xs.findIndex(x => x.id === id)
      if (i < 0) return xs
      const j = i + dir
      if (j < 0 || j >= xs.length) return xs
      const next = xs.slice()
      const [row] = next.splice(i, 1)
      next.splice(j, 0, row)
      return next
    })

  const total = useMemo(() => items.length, [items])

  return (
    <main className="container" style={{ paddingBottom: 72 }}>
      <h1>Studio</h1>
      <div
        style={{
          display: 'grid',
          gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          alignItems: 'start',
        }}
      >
        {/* Playlist/Queue Panel */}
        <section className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0 }}>Playlist Queue</h2>
            <button className="btn" onClick={clearQueue} disabled={!queue.length}>
              Clear
            </button>
          </div>

          {!queue.length ? (
            <div style={{ opacity: 0.8, marginTop: 8 }}>Queue is empty. Add tracks from a show.</div>
          ) : (
            <ul style={{ marginTop: 8, display: 'grid', gap: 8 }}>
              {queue.map((q, i) => {
                const active = i === current
                return (
                  <li
                    key={q.url || i}
                    className="row"
                    style={{
                      gap: 8,
                      alignItems: 'center',
                      padding: 8,
                      border: '1px solid #eee',
                      borderRadius: 8,
                      background: active ? 'rgba(0,0,0,0.04)' : 'transparent',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: active ? 700 : 600,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                        title={q.title}
                        onClick={() => playAt(i)}
                      >
                        {q.trackNum != null ? String(q.trackNum).padStart(2, '0') + '. ' : ''}
                        {q.title}
                      </div>
                      {(q.date || q.venue) && (
                        <div style={{ opacity: 0.7, fontSize: 12 }}>
                          {[q.date, q.venue].filter(Boolean).join(' — ')}
                        </div>
                      )}
                    </div>
                    <button className="btn" onClick={() => playAt(i)}>
                      {active && playing ? 'Pause/Play' : 'Play'}
                    </button>
                    <button className="btn" onClick={() => addFromQueue(q)}>
                      Add to Setlist
                    </button>
                    <button className="btn" onClick={() => removeFromQueue(q.url!)}>Remove</button>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        {/* Builder Panel */}
        <section className="card" style={{ padding: 12 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <h2 style={{ margin: 0, flex: 1 }}>Setlist Builder</h2>
            <button className="btn" onClick={addAllFromQueue} disabled={!queue.length}>
              Add all from Queue
            </button>
          </div>

          <label style={{ fontSize: 12, opacity: 0.7 }}>Setlist name</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Name your setlist" />

          <div className="card" style={{ marginTop: 10, padding: 8 }}>
            {!items.length && <div style={{ opacity: 0.8 }}>No songs yet. Add from the queue.</div>}
            {items.map((x, i) => (
              <div
                key={x.id}
                className="row"
                style={{ justifyContent: 'space-between', alignItems: 'center', gap: 8, padding: '6px 0' }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {i + 1}. {x.title}
                  </div>
                  {(x.date || x.venue) && (
                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      {[x.date, x.venue].filter(Boolean).join(' — ')}
                    </div>
                  )}
                </div>
                <button className="btn" title="Move up" onClick={() => move(x.id, -1)} disabled={i === 0}>
                  ↑
                </button>
                <button className="btn" title="Move down" onClick={() => move(x.id, +1)} disabled={i === items.length - 1}>
                  ↓
                </button>
                <button className="btn" title="Toggle segue" onClick={() => toggleSegue(x.id)}>
                  {x.segue ? '>' : '•'}
                </button>
                <button className="btn" title="Remove" onClick={() => removeItem(x.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 8, opacity: 0.8 }}>Total: {total} {total === 1 ? 'song' : 'songs'}</div>
        </section>
      </div>
    </main>
  )
}