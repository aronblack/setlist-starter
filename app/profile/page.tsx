'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function ProfilePage() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null))
  }, [])

  return (
    <main className="container">
      <h1>Profile</h1>
      <div className="card" style={{ padding: 12, maxWidth: 480 }}>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Signed in as</div>
        <div style={{ fontWeight: 600 }}>{email || '...'}</div>
      </div>
    </main>
  )
}