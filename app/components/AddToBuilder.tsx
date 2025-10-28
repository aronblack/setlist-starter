'use client'
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
  const add = () => {
    const items = readQueue()
    if (!items.some(i => i.url === track.url)) {
      items.push({ ...track, addedAt: Date.now() })
      writeQueue(items)
    }
    // Also make it playable immediately
    enqueue({ ...track, addedAt: Date.now() })
  }

  return <button className="btn" type="button" onClick={add}>Add to Builder</button>
}