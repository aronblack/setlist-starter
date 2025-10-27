'use client'
import { useState } from 'react'
import BuilderQueue from '@/app/components/BuilderQueue'

type Item = { id: string, title: string, segue: boolean }
const KEY = 'gd:builder:queue'

function readQueue(): any[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

export default function BuilderPage() {
  const [title, setTitle] = useState('My Setlist')
  const [items, setItems] = useState<Item[]>([])

  const add = () =>
    setItems(xs => xs.concat({ id: Math.random().toString(36).slice(2), title: 'Song', segue: false }))

  const toggle = (id: string) =>
    setItems(xs => xs.map(x => x.id === id ? { ...x, segue: !x.segue } : x))

  const addQueued = () => {
    const queued = readQueue()
    if (!Array.isArray(queued) || queued.length === 0) {
      alert('Queue is empty')
      return
    }
    setItems(xs => xs.concat(
      queued.map((t: any) => ({
        id: Math.random().toString(36).slice(2),
        title: t.title || t.url || 'Track',
        segue: false,
      }))
    ))
  }

  return (
    <main className='container'>
      <h1>Setlist Builder</h1>

      <div className='row' style={{ marginTop: 10, gap: 8 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <button className='btn' onClick={add}>Add song</button>
        <button className='btn' onClick={addQueued}>Add queued to setlist</button>
      </div>

      <BuilderQueue />

      <div className='card' style={{ marginTop: 16 }}>
        {items.length === 0 && <div>Drop tracks here or use “Add queued to setlist”</div>}
        {items.map((x, i) => (
          <div key={x.id} className='row' style={{ justifyContent: 'space-between' }}>
            <div>{i + 1}. {x.title}</div>
            <button className='btn' onClick={() => toggle(x.id)}>{x.segue ? '>' : '•'}</button>
          </div>
        ))}
      </div>
    </main>
  )
}
