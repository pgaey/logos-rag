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

  try {
    const tableRows = await client.query<{ table_name: string }>(
      "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='verses' LIMIT 1",
    )
    if (tableRows.rows.length > 0) {
      const colRows = await client.query<{ column_name: string }>(
        "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='verses'",
      )
      const existingCols = colRows.rows.map((r) => r.column_name)
      const requiredCols = ['id', 'book', 'chapter', 'verse', 'text', 'embedding']
      const missingCols = requiredCols.filter((c) => !existingCols.includes(c))
      if (missingCols.length === 0) {
        console.log('[check:supabase] verses table ........ PASS')
      } else {
        console.log('[check:supabase] verses table ........ FAIL (missing columns)')
        console.error('[check:supabase] missing columns:', missingCols.join(', '))
        ok = false
      }
    } else {
      console.log('[check:supabase] verses table ........ FAIL (table not found)')
      ok = false
    }
  } catch (err) {
    console.log(
      '[check:supabase] verses table ........ FAIL',
      err instanceof Error ? err.message : err,
    )
    ok = false
  }

  try {
    const { rows: [stats] } = await client.query<{ total: string; nulls: string }>(
      `SELECT COUNT(*)::text AS total,
              COUNT(*) FILTER (WHERE embedding IS NULL)::text AS nulls
       FROM verses`,
    )
    const total = Number(stats.total)
    const nulls = Number(stats.nulls)
    const filled = total - nulls
    if (total === 0) {
      console.log('[check:supabase] embeddings .......... INFO (table empty, run pnpm embed:bible)')
    } else if (nulls > 0) {
      console.log(
        `[check:supabase] embeddings .......... INFO (${filled}/${total} filled, resume with pnpm embed:bible)`,
      )
    } else {
      console.log(`[check:supabase] embeddings .......... PASS (${total}/${total} filled)`)
    }
  } catch (err) {
    console.log(
      '[check:supabase] embeddings .......... INFO (could not query embedding stats:',
      err instanceof Error ? err.message : err,
      ')',
    )
  }

  try {
    const { rows } = await client.query<{ exists: boolean }>(
      `SELECT EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'match_verses'
      ) AS exists`,
    )
    if (rows[0]?.exists) {
      console.log('[check:supabase] match_verses fn ..... PASS')
    } else {
      console.log('[check:supabase] match_verses fn ..... FAIL (run supabase db push)')
      ok = false
    }
  } catch (err) {
    console.log(
      '[check:supabase] match_verses fn ..... FAIL',
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
