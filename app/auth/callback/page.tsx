'use client'

import { useEffect } from 'react'
import { supabase } from '../../../lib/supabaseClient'

import { useRouter } from 'next/navigation'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) router.push('/')
      else router.push('/login')
    })
  }, [router])

  return <main className='container'>Signing you in…</main>
}
