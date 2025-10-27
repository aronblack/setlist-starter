// lib/supabaseServer.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// 1) User-scoped client (honors RLS; reads user from cookies)
export function getSupabaseUser() {
  return createRouteHandlerClient({ cookies })
}

// 2) Admin client (SERVICE ROLE) — bypasses RLS, server-only
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE or NEXT_PUBLIC_SUPABASE_URL')
  return createClient(url, key, { auth: { persistSession: false } })
}

// Add this export to match existing imports
export const supabaseServer = getSupabaseUser
