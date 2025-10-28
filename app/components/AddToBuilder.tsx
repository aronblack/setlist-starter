'use client'
import { useState } from 'react'
import { usePlayer } from '@/app/components/PlayerProvider'

type TrackInput = {
  identifier: string
  url: string
  title: string
  trackNum?: number | null
  date?: string
  venue?: string
}

type QueueItem = TrackInput & { addedAt: number }
const KEY = 'gd:builder:queue'

function readQueue(): QueueItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function writeQueue(items: QueueItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export default function AddToBuilder({ track }: { track: TrackInput }) {
  const { enqueue } = usePlayer()
  const [added, setAdded] = useState(false)

  const add = () => {
    const items = readQueue()
    if (!items.some(i => i.url === track.url)) {
      items.push({ ...track, addedAt: Date.now() })
      writeQueue(items)
    }
    // Also enqueue for the playlist UI (no-op if PlayerProvider not mounted)
    enqueue({ ...track, addedAt: Date.now() })

    setAdded(true)
    setTimeout(() => setAdded(false), 1200)
  }

  return (
    <button className="btn" type="button" onClick={add} aria-label="Add to builder">
      {added ? 'Added ✓' : 'Add to Builder'}
    </button>
  )
}