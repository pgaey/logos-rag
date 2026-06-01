import 'server-only'
import { GoogleGenAI } from '@google/genai'
import { createServerSupabase } from '@/lib/supabase/admin'
import type { Database } from '@/lib/db/types'

// ── 상수 ────────────────────────────────────────────────────────────────────
const EMBED_MODEL = 'gemini-embedding-001'
const EMBED_DIMENSIONS = 768

// ── 타입 ────────────────────────────────────────────────────────────────────
export type VerseMatch =
  Database['public']['Functions']['match_verses']['Returns'][number]
// = { id, book, chapter, verse, text, similarity }

// ── 핵심 함수 ────────────────────────────────────────────────────────────────
export async function searchVerses(
  query: string,
  k: number = 5,
): Promise<VerseMatch[]> {
  // 1. Gemini 로 query 임베딩
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    throw new Error('Missing GEMINI_API_KEY. Check .env.local.')
  }

  const ai = new GoogleGenAI({ apiKey: geminiKey })
  const response = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: [query],
    config: { outputDimensionality: EMBED_DIMENSIONS },
  })

  // 2. embeddings 추출
  const values = response.embeddings?.[0]?.values
  if (!values) {
    throw new Error(`searchVerses: failed to get embedding values for query "${query}"`)
  }

  // 3. Supabase 클라이언트 생성 (service-role, App Router 밖에서도 안전)
  const supabase = createServerSupabase()

  // 4. match_verses RPC 호출
  const { data, error } = await supabase.rpc('match_verses', {
    query_embedding: JSON.stringify(values),
    match_count: k,
  })

  // 5. 에러 처리 및 반환
  if (error) {
    throw new Error(`searchVerses RPC error: ${error.message}`)
  }

  return data
}
