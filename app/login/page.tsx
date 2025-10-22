'use client'

import { supabase } from './../../lib/supabaseClient'

export default function LoginPage() {
  const handleGitHubLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error(error)
  }

  const handleMagicLink = async (email: string) => {
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) console.error(error)
  }

  return (
    <main className='container'>
      <h1>Sign in</h1>
      <button className='btn' onClick={handleGitHubLogin}>
        Continue with GitHub
      </button>

      <div style={{ marginTop: 20 }}>
        <input id='email' placeholder='Email for magic link' />
        <button
          className='btn'
          onClick={() => {
            const email = (document.getElementById('email') as HTMLInputElement)
              ?.value
            handleMagicLink(email)
          }}
        >
          Send Magic Link
        </button>
      </div>
    </main>
  )
}
