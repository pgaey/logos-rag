import { searchVerses } from '../src/lib/search/cosine'
import { buildPrompt } from '../src/lib/prompt/template'

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const question = args[0]
  const k = args[1] ? parseInt(args[1], 10) : 5

  if (!question) {
    console.error('[search-prompt] Usage: pnpm search:prompt "<question>" [k=5]')
    process.exit(1)
  }

  console.log(`[search-prompt] Query: "${question}" (top-${k})\n`)

  const verses = await searchVerses(question, k)

  // verse 표 출력
  console.log('┌─ Verse Results ──────────────────────────────────────────────')
  verses.forEach((v, i) => {
    const preview = v.text.slice(0, 60).padEnd(60)
    console.log(`│ ${String(i + 1).padStart(2)}. [${v.book} ${v.chapter}:${v.verse}] (${v.similarity.toFixed(3)}) ${preview}`)
  })
  console.log('└──────────────────────────────────────────────────────────────\n')

  // 프롬프트 조립 및 출력
  const prompt = buildPrompt(question, verses)
  console.log('═══ 완성 프롬프트 ═══════════════════════════════════════════════')
  console.log(prompt)
  console.log('═════════════════════════════════════════════════════════════════')
}

main().catch((err: unknown) => {
  console.error('[search-prompt] error:', err)
  process.exit(1)
})
