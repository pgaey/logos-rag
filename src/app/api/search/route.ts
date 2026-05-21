import { searchVerses } from '@/lib/search/cosine'
import { buildPrompt } from '@/lib/prompt/template'

export async function POST(request: Request): Promise<Response> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'invalid json body' }, { status: 400 })
  }

  if (typeof body !== 'object' || body === null) {
    return Response.json({ error: 'body must be a json object' }, { status: 400 })
  }

  const { question, k } = body as { question?: unknown; k?: unknown }

  if (typeof question !== 'string' || question.trim() === '') {
    return Response.json({ error: 'question is required' }, { status: 400 })
  }

  const matchCount = typeof k === 'number' ? Math.min(Math.max(1, Math.floor(k)), 10) : 5

  try {
    const verses = await searchVerses(question.trim(), matchCount)
    const prompt = buildPrompt(question.trim(), verses)
    return Response.json({ verses, prompt })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'internal server error'
    return Response.json({ error: message }, { status: 500 })
  }
}
