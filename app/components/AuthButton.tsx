'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function AuthButton() {
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    let unsub: any
    const load = async () => {
      const { data } = await supabaseBrowser.auth.getUser()
      setEmail(data.user?.email ?? null)
      const { data: sub } = supabaseBrowser.auth.onAuthStateChange((_e, session) => {
        setEmail(session?.user?.email ?? null)
      })
      unsub = sub.subscription
    }
    load()
    return () => unsub?.unsubscribe?.()
  }, [])

  const signOut = async () => {
    await supabaseBrowser.auth.signOut()
    location.reload()
  }

  if (!email) return <Link href="/login" className="btn">Login</Link>
  return (
    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
      <span style={{ opacity: 0.7, fontSize: 13 }}>{email}</span>
      <button className="btn" onClick={signOut}>Logout</button>
    </div>
  )
}