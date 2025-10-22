export default function SharePage({ params }: { params: { slug: string } }) {
  return (
    <main className='container'>
      <h1>Shared Setlist</h1>
      <p>Slug: {params.slug}</p>
      <p>This is a read-only view of a public setlist</p>
    </main>
  )
}
