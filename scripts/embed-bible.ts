import { GoogleGenAI } from '@google/genai'
import { Client } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

// ── 상수 ────────────────────────────────────────────────────────────────────
// text-embedding-004 가 2026-01-14 deprecated → gemini-embedding-001 로 마이그레이션.
// outputDimensionality=768 옵션으로 verses.embedding(vector(768)) 스키마 유지 (Matryoshka).
const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMENSIONS = 768
// 무료 tier embed_content_free_tier_requests = RPM 100 (batch 안의 N contents 가 N requests
// 로 카운트). BATCH_SIZE=1 + DELAY_MS=700 = 분당 ~85 requests 로 한도 안전.
// 31,102 verse × 0.7s ≈ 6시간. Tier 1 활성화 시 BATCH_SIZE/DELAY_MS 환경변수로 조정 가능.
const BATCH_SIZE = Number(process.env.EMBED_BATCH_SIZE ?? 1)
const INSERT_CHUNK = 1000
const DELAY_MS = Number(process.env.EMBED_DELAY_MS ?? 700)
const MAX_RETRIES = 3
const BACKOFF_BASE_MS = 1000

// ── 유틸 ────────────────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms))

// fetch-bible.ts 의 VerseRecord 와 동일한 구조
interface VerseRecord {
  book: string
  chapter: number
  verse: number
  text: string
}

// ── 환경변수 검증 ────────────────────────────────────────────────────────────
function validateEnv(): { dbUrl: string; geminiKey: string } {
  const dbUrl = process.env.SUPABASE_DB_URL
  const geminiKey = process.env.GEMINI_API_KEY

  if (!dbUrl) {
    console.error('[embed:bible] Missing SUPABASE_DB_URL in .env.local')
    process.exit(1)
  }
  if (!geminiKey) {
    console.error('[embed:bible] Missing GEMINI_API_KEY in .env.local')
    process.exit(1)
  }
  return { dbUrl, geminiKey }
}

// ── 1pass: bulk INSERT ───────────────────────────────────────────────────────
async function runInsertPass(
  client: Client,
  verses: VerseRecord[],
): Promise<void> {
  console.log('[embed:bible] 1pass — insert text from data/web-bible.json')

  // 삽입 전 count (ON CONFLICT DO NOTHING 로 인해 result.rowCount 가 실제 삽입 수를 반영하지 않으므로 비교 방식 사용)
  const beforeResult = await client.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM verses',
  )
  const beforeCount = Number(beforeResult.rows[0]?.count ?? 0)

  const total = verses.length
  for (let offset = 0; offset < total; offset += INSERT_CHUNK) {
    const chunk = verses.slice(offset, offset + INSERT_CHUNK)
    const values = chunk
      .map((_, i) => `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4})`)
      .join(', ')
    const params = chunk.flatMap((v) => [v.book, v.chapter, v.verse, v.text])
    await client.query(
      `INSERT INTO verses (book, chapter, verse, text) VALUES ${values}
       ON CONFLICT (book, chapter, verse) DO NOTHING`,
      params,
    )
  }

  const afterResult = await client.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM verses',
  )
  const afterCount = Number(afterResult.rows[0]?.count ?? 0)
  const inserted = afterCount - beforeCount
  const alreadyExisted = total - inserted

  console.log(
    `[embed:bible] 1pass done — inserted ${inserted} verses (${alreadyExisted} already existed)`,
  )
}

// ── 2pass: embed + UPDATE ────────────────────────────────────────────────────
async function runEmbedPass(client: Client, ai: GoogleGenAI): Promise<void> {
  console.log('[embed:bible] 2pass — embed and update NULL embeddings')

  const totalResult = await client.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM verses WHERE embedding IS NULL',
  )
  const totalToProcess = Number(totalResult.rows[0]?.count ?? 0)
  console.log(`[embed:bible] 2pass — total to process: ${totalToProcess} verses`)

  if (totalToProcess === 0) {
    console.log('[embed:bible] 2pass done — all embeddings already filled')
    return
  }

  let processed = 0
  let succeededChunks = 0
  let skippedChunks = 0

  while (true) {
    const { rows } = await client.query<{ id: number; text: string }>(
      `SELECT id, text FROM verses WHERE embedding IS NULL ORDER BY id LIMIT ${BATCH_SIZE}`,
    )
    if (rows.length === 0) break

    const chunkStart = Date.now()

    let chunkSucceeded = false

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.embedContent({
          model: EMBED_MODEL,
          contents: rows.map((r) => r.text),
          config: { outputDimensionality: EMBED_DIMENSIONS },
        })

        const embeddings = response.embeddings
        if (!embeddings || embeddings.length !== rows.length) {
          throw new Error(
            `Unexpected embeddings length: expected ${rows.length}, got ${embeddings?.length ?? 0}`,
          )
        }

        await Promise.all(
          rows.map((r, i) => {
            const values = embeddings[i]?.values
            if (!values) {
              throw new Error(`Missing values for embedding index ${i}`)
            }
            return client.query(
              `UPDATE verses SET embedding = $1::extensions.vector WHERE id = $2`,
              [JSON.stringify(values), r.id],
            )
          }),
        )

        chunkSucceeded = true
        break
      } catch (err) {
        if (attempt === MAX_RETRIES) {
          console.error(
            `[embed:bible] chunk skipped after ${MAX_RETRIES} retries:`,
            err instanceof Error ? err.message : err,
          )
          skippedChunks++
          // 무한 루프 방지를 위해 재시도 불가 시 즉시 중단
          process.exit(1)
        }
        const backoff = BACKOFF_BASE_MS * Math.pow(2, attempt)
        console.error(
          `[embed:bible] chunk attempt ${attempt + 1} failed, retrying in ${backoff}ms:`,
          err instanceof Error ? err.message : err,
        )
        await sleep(backoff)
      }
    }

    if (chunkSucceeded) {
      succeededChunks++
      processed += rows.length
      // BATCH_SIZE=1 일 때 chunk 마다 로그를 찍으면 31k 줄 — 1000 verse 마다 + 마지막에만 출력.
      const prev = processed - rows.length
      const crossedMilestone = Math.floor(processed / 1000) > Math.floor(prev / 1000)
      if (crossedMilestone || processed === totalToProcess) {
        const elapsed = Date.now() - chunkStart
        console.log(
          `[embed:bible] progress: ${processed}/${totalToProcess} (${((processed / totalToProcess) * 100).toFixed(1)}%) — last chunk ${elapsed}ms`,
        )
      }
    }

    await sleep(DELAY_MS)
  }

  console.log(
    `[embed:bible] 2pass done — embedded ${processed} verses, ${succeededChunks} chunks succeeded, ${skippedChunks} chunks skipped`,
  )
}

// ── 종료 검증 ────────────────────────────────────────────────────────────────
async function verifyNoNulls(client: Client): Promise<void> {
  const { rows } = await client.query<{ count: string }>(
    'SELECT COUNT(*) AS count FROM verses WHERE embedding IS NULL',
  )
  const count = Number(rows[0]?.count ?? 0)
  if (count > 0) {
    console.error(`[embed:bible] FAIL: ${count} NULL embeddings remain`)
    process.exit(1)
  }
  console.log('[embed:bible] verification: 0 NULL embeddings remaining')
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // 환경변수 검증
  const { dbUrl, geminiKey } = validateEnv()

  // data/web-bible.json 존재 확인
  const biblePath = path.resolve(process.cwd(), 'data/web-bible.json')
  if (!fs.existsSync(biblePath)) {
    console.error(
      '[embed:bible] data/web-bible.json not found — run pnpm fetch:bible first',
    )
    process.exit(1)
  }

  console.log('[embed:bible] connecting...')

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
  } catch (err) {
    console.error(
      '[embed:bible] connection FAILED:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  }

  // web-bible.json 파싱
  let verses: VerseRecord[]
  try {
    const raw = fs.readFileSync(biblePath, 'utf8')
    verses = JSON.parse(raw) as VerseRecord[]
  } catch (err) {
    console.error(
      '[embed:bible] failed to parse data/web-bible.json:',
      err instanceof Error ? err.message : err,
    )
    await client.end()
    process.exit(1)
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey })

  try {
    // 1pass
    await runInsertPass(client, verses)

    // 2pass
    await runEmbedPass(client, ai)

    // 종료 검증
    await verifyNoNulls(client)

    console.log('[embed:bible] all done.')
  } finally {
    await client.end()
  }
}

main().catch((err: unknown) => {
  console.error('[embed:bible] unexpected error:', err)
  process.exit(1)
})
