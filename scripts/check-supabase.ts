import { Client } from 'pg'

async function main(): Promise<void> {
  const connectionString = process.env.SUPABASE_DB_URL
  if (!connectionString) {
    console.error('[check:supabase] Missing SUPABASE_DB_URL in .env.local')
    process.exit(1)
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  })

  console.log('[check:supabase] connecting...')
  try {
    await client.connect()
  } catch (err) {
    console.error(
      '[check:supabase] connection FAILED:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  }

  let ok = true

  try {
    const { rows } = await client.query<{ ok: number }>('SELECT 1 AS ok')
    if (rows[0]?.ok === 1) {
      console.log('[check:supabase] SELECT 1 ............ PASS')
    } else {
      console.log('[check:supabase] SELECT 1 ............ FAIL (unexpected row)')
      ok = false
    }
  } catch (err) {
    console.log(
      '[check:supabase] SELECT 1 ............ FAIL',
      err instanceof Error ? err.message : err,
    )
    ok = false
  }

  try {
    const { rows } = await client.query<{ extname: string }>(
      "SELECT extname FROM pg_extension WHERE extname = 'vector'",
    )
    if (rows.length > 0) {
      console.log('[check:supabase] pgvector extension .. PASS')
    } else {
      console.log('[check:supabase] pgvector extension .. FAIL (not installed)')
      ok = false
    }
  } catch (err) {
    console.log(
      '[check:supabase] pgvector extension .. FAIL',
      err instanceof Error ? err.message : err,
    )
    ok = false
  }

  await client.end()

  if (ok) {
    console.log('[check:supabase] all checks passed.')
    process.exit(0)
  }

  console.error('[check:supabase] one or more checks failed.')
  process.exit(1)
}

main().catch((err: unknown) => {
  console.error('[check:supabase] unexpected error:', err)
  process.exit(1)
})
