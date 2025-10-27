import Link from 'next/link'
import AddToBuilder from '@/app/components/AddToBuilder'

const METADATA = 'https://archive.org/metadata'

type MetaFile = {
  name?: string
  title?: string
  format?: string
  track?: string | number
  length?: string
}

function parseTrackNumber(f: MetaFile): number | null {
  const candidates = [String((f as any)?.track ?? ''), String(f?.title ?? ''), String(f?.name ?? '')]
  for (const s of candidates) {
    const m = s.match(/^(\d{1,3})/)
    if (m) return parseInt(m[1], 10)
  }
  return null
}

export const dynamic = 'force-dynamic'

export default async function ShowPage({
  params,
  searchParams,
}: {
  params: { year: string; date: string; identifier: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}) {
  const { year, date, identifier } = params
  const debug = !!searchParams?.debug

  let meta: any = null
  let error: string | null = null
  try {
    const res = await fetch(`${METADATA}/${identifier}`, { cache: 'no-store' })
    if (!res.ok) {
      error = `Metadata HTTP ${res.status}`
    } else {
      meta = await res.json()
    }
  } catch (e: any) {
    error = String(e)
  }

  if (error) {
    return (
      <main className="container">
        <h1>Show</h1>
        <p>Unable to load show metadata. {error}</p>
        <div style={{ marginTop: 12 }}>
          <a href={`https://archive.org/details/${identifier}`} target="_blank" rel="noreferrer">View on Archive.org</a>
        </div>
      </main>
    )
  }

  const md = meta?.metadata || {}
  const files: MetaFile[] = Array.isArray(meta?.files) ? meta.files : []
  const allFilesCount = files.length

  function isAudioFile(f: MetaFile) {
    const fmt = (f.format || '').toLowerCase()
    const name = (f.name || '').toLowerCase()
    const byFormat = [
      'vbr mp3','128kbps mp3','64kbps mp3','mp3',
      'ogg vorbis','ogg','flac','opus','aac','m4a',
      'shorten','shn','wav','aiff','aif'
    ].some(a => fmt.includes(a))
    const byExt = ['.mp3','.ogg','.oga','.flac','.opus','.aac','.m4a','.shn','.wav','.aiff','.aif']
      .some(ext => name.endsWith(ext))
    return byFormat || byExt
  }

  function isBrowserPlayable(f: MetaFile) {
    const name = (f.name || '').toLowerCase()
    const fmt = (f.format || '').toLowerCase()
    const playableExt = ['.mp3','.ogg','.oga','.m4a','.aac','.opus','.wav','.aiff','.aif']
    const playableFmt = ['mp3','vbr mp3','128kbps mp3','64kbps mp3','ogg','ogg vorbis','aac','m4a','opus','wav','aiff']
    return playableExt.some(ext => name.endsWith(ext)) || playableFmt.some(p => fmt.includes(p))
  }

  const tracks = files
    .filter(isAudioFile)
    .map(f => {
      const trackNum = parseTrackNumber(f)
      const title = f.title || f.name || ''
      const url = `https://archive.org/download/${identifier}/${encodeURIComponent(f.name || '')}`
      const playable = isBrowserPlayable(f)
      return { trackNum, title, url, format: f.format || '', length: f.length || '', playable }
    })
    .sort((a, b) => {
      const an = a.trackNum ?? 9999
      const bn = b.trackNum ?? 9999
      return an === bn ? a.title.localeCompare(b.title) : an - bn
    })

  const showTitle = md.title || identifier
  const showDate = md.date || date
  const venue = md.coverage || md.venue || ''

  return (
    <main className="container">
      <h1>{showTitle}</h1>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        {[showDate, venue].filter(Boolean).join(' — ')}
      </div>

      {debug && (
        <details style={{ marginBottom: 12 }}>
          <summary>Debug</summary>
          <div>files: {allFilesCount}</div>
          <div>audio candidates: {tracks.length}</div>
          <ul style={{ marginTop: 6 }}>
            {files.slice(0, 10).map((f, i) => (
              <li key={i} style={{ fontSize: 12 }}>
                {(f.name || '')} — {(f.format || '')}
              </li>
            ))}
          </ul>
        </details>
      )}

      <h2 style={{ margin: '16px 0 8px' }}>Tracks</h2>

      {tracks.length === 0 ? (
        <>
          <div style={{ marginBottom: 12 }}>No individual tracks detected. Trying Archive player:</div>
          <div style={{ position: 'relative', paddingTop: '56.25%' }}>
            <iframe
              src={`https://archive.org/embed/${identifier}`}
              title="Archive.org player"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              allow="autoplay"
            />
          </div>
          <div style={{ marginTop: 12 }}>
            <a href={`https://archive.org/details/${identifier}`} target="_blank" rel="noreferrer">
              View on Archive.org
            </a>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {tracks.map((t) => (
            <div key={t.url} className="card" style={{ padding: 12 }}>
              <div style={{ fontWeight: 600 }}>
                {t.trackNum != null ? `${String(t.trackNum).padStart(2, '0')}. ` : ''}
                {t.title}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 6 }}>
                {t.playable ? (
                  <audio src={t.url} controls preload="none" style={{ width: '100%' }} />
                ) : (
                  <div style={{ opacity: 0.7, fontSize: 12 }}>Not browser-playable (use Open)</div>
                )}
                <a href={t.url} target="_blank" rel="noreferrer" className="btn">Open</a>
                <AddToBuilder track={{ identifier, url: t.url, title: t.title, trackNum: t.trackNum, date: showDate, venue }} />
              </div>
              <div style={{ opacity: 0.6, fontSize: 12, marginTop: 4 }}>
                {t.format}{t.length ? ` • ${t.length}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <a href={`https://archive.org/details/${identifier}`} target="_blank" rel="noreferrer">View on Archive.org</a>
      </div>
    </main>
  )
}