import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export function createServerSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY. Check .env.local.',
    )
  }

  return createClient(url, secret, {
    auth: { persistSession: false },
  })
}
