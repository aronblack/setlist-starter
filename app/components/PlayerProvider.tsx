'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type QueueItem = {
  identifier: string
  url: string
  title: string
  trackNum?: number | null
  date?: string
  venue?: string
  addedAt?: number
}

type Ctx = {
  queue: QueueItem[]
  current: number
  playing: boolean
  enqueue: (item: QueueItem | QueueItem[]) => void
  remove: (url: string) => void
  clear: () => void
  playAt: (index: number) => void
  toggle: () => void
  next: () => void
  prev: () => void
}

const PlayerCtx = createContext<Ctx | null>(null)

// Safe hook: returns no-ops if provider isn’t mounted
export function usePlayer(): Ctx {
  const ctx = useContext(PlayerCtx)
  if (ctx) return ctx
  return {
    queue: [], current: 0, playing: false,
    enqueue: () => {}, remove: () => {}, clear: () => {},
    playAt: () => {}, toggle: () => {}, next: () => {}, prev: () => {},
  }
}

const KEY_QUEUE = 'gd:builder:queue'

export default function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [current] = useState(0)
  const [playing] = useState(false)

  useEffect(() => {
    try {
      const q = JSON.parse(localStorage.getItem(KEY_QUEUE) || '[]')
      if (Array.isArray(q)) setQueue(q)
    } catch {}
  }, [])
  useEffect(() => {
    localStorage.setItem(KEY_QUEUE, JSON.stringify(queue))
  }, [queue])

  const api = useMemo<Ctx>(() => ({
    queue, current, playing,
    enqueue: (item) => {
      setQueue(q => {
        const toAdd = Array.isArray(item) ? item : [item]
        const map = new Map(q.map(x => [x.url, x]))
        toAdd.forEach(x => map.set(x.url, { ...x, addedAt: x.addedAt ?? Date.now() }))
        return Array.from(map.values())
      })
    },
    remove: (url) => setQueue(q => q.filter(x => x.url !== url)),
    clear: () => setQueue([]),
    playAt: () => {},
    toggle: () => {},
    next: () => {},
    prev: () => {},
  }), [queue, current, playing])

  return <PlayerCtx.Provider value={api}>{children}</PlayerCtx.Provider>
}