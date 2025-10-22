'use client'
import { useEffect, useRef, useState } from 'react'

export default function Player({ queue }: { queue: string[] }) {
  const [idx, setIdx] = useState(0)
  const a1 = useRef<HTMLAudioElement | null>(null)
  const a2 = useRef<HTMLAudioElement | null>(null)
  const [usingA, setUsingA] = useState(true)

  useEffect(() => {
    const cur = usingA ? a1.current : a2.current
    const next = usingA ? a2.current : a1.current
    if (!cur || !next) return

    const handle = () => {
      if (cur.duration && cur.currentTime > cur.duration - 10) {
        const nextIdx = idx + 1
        if (nextIdx < queue.length) {
          next.src = queue[nextIdx]
          next.volume = 0
          next.play()
          const dur = 2.0
          const step = 0.05
          let t = 0
          const iv = setInterval(() => {
            t += step
            cur.volume = Math.max(0, 1 - t / dur)
            next.volume = Math.min(1, t / dur)
            if (t >= dur) {
              clearInterval(iv)
              cur.pause()
              setIdx(nextIdx)
              setUsingA(!usingA)
            }
          }, step * 1000)
        }
      }
    }

    cur.addEventListener('timeupdate', handle)
    return () => cur.removeEventListener('timeupdate', handle)
  }, [idx, usingA, queue])

  return (
    <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, padding: 12, background: '#111', color: '#fff' }}>
      <div>Now Playing: {queue[idx] || '—'}</div>
      <audio ref={a1} src={queue[0]} autoPlay />
      <audio ref={a2} />
      <div style={{ opacity: 0.7 }}>Crossfade prototype</div>
    </div>
  )
}
