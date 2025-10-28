'use client'
import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabaseBrowser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const redirectTo = `${location.origin}/auth/callback?next=/`

  const sendMagicLink = async () => {
    setMsg(null); setError(null)
    const { error } = await supabaseBrowser.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo } })
    if (error) setError(error.message)
    else setMsg('Check your email for the login link.')
  }

  const signInGitHub = async () => {
    setMsg(null); setError(null)
    const { error } = await supabaseBrowser.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo }
    })
    if (error) setError(error.message)
  }

  return (
    <main className="container">
      <h1>Login</h1>
      <div className="card" style={{ padding: 12, maxWidth: 420 }}>
        <label>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
        <div className="row" style={{ marginTop: 8, gap: 8 }}>
          <button className="btn" onClick={sendMagicLink} disabled={!email.trim()}>Send magic link</button>
          <button className="btn" onClick={signInGitHub}>Continue with GitHub</button>
        </div>
        {msg && <div style={{ color: 'green', marginTop: 8 }}>{msg}</div>}
        {error && <div style={{ color: 'crimson', marginTop: 8 }}>{error}</div>}
      </div>
    </main>
  )
}
