import Link from 'next/link'

export default function HomePage() {
  return (
    <main className='container'>
      <h1>Grateful Dead Setlist Builder</h1>
      <div className='row' style={{ marginTop: 20 }}>
        <Link className='btn' href='/explore'>Explore</Link>
        <Link className='btn' href='/builder/new'>Start a Setlist</Link>
      </div>
      <div className='card' style={{ marginTop: 24 }}>
        <h3>What’s here</h3>
        <ul>
          <li>Archive.org search proxy</li>
          <li>Show detail with track list</li>
          <li>Builder and player prototypes</li>
          <li>Supabase CRUD under /api/setlists/*</li>
        </ul>
      </div>
    </main>
  )
}
