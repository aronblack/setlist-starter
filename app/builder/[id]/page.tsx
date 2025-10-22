'use client'
import { useState } from 'react'

type Item = { id: string, title: string, segue: boolean }

export default function BuilderPage() {
  const [title, setTitle] = useState('My Setlist')
  const [items, setItems] = useState<Item[]>([])

  const add = () => setItems(xs => xs.concat({ id: Math.random().toString(36).slice(2), title: 'Song', segue: false }))
  const toggle = (id: string) => setItems(xs => xs.map(x => x.id === id ? { ...x, segue: !x.segue } : x))

  return (
    <main className='container'>
      <h1>Setlist Builder</h1>
      <div className='row' style={{ marginTop: 10 }}>
        <input value={title} onChange={e => setTitle(e.target.value)} />
        <button className='btn' onClick={add}>Add song</button>
      </div>
      <div className='card' style={{ marginTop: 16 }}>
        {items.length === 0 && <div>Drop tracks here or use “Add song”</div>}
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
