import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseUser } from '@/lib/supabaseServer'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  if (code) {
    const supabase = getSupabaseUser()
    await supabase.auth.exchangeCodeForSession(code)
  }
  const next = url.searchParams.get('next') || '/'
  return NextResponse.redirect(new URL(next, url.origin))
}