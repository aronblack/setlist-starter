import Link from 'next/link'

async function getItem(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/item?id=${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('failed to load item')
  return res.json()
}

export default async function ShowPage({ params }: { params: { id: string, year: string, date: string } }) {
  const { id } = params
  const data = await getItem(id)

  return (
    <main className='container'>
      <h1>{data.metadata?.title || id}</h1>
      <div style={{ opacity: 0.8, marginBottom: 12 }}>
        {[data.metadata?.date, data.metadata?.venue].filter(Boolean).join(' — ')}
      </div>

      <div className='card'>
        <h3>Tracks</h3>
        <ol>
          {data.tracks?.map((t: any) => (
            <li key={t.filename} style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                <span>{t.track}. {t.title}</span>
                <span>
                  <audio controls preload='none' src={t.url} />
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 16 }}>
        <a className='btn' href={`https://archive.org/details/${id}`} target='_blank'>Open on Archive.org</a>
        <Link className='btn' style={{ marginLeft: 8 }} href={`/builder/new?from=${id}`}>Add to Builder</Link>
      </div>
    </main>
  )
}
