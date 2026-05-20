import * as fs from 'fs'
import * as path from 'path'
import { searchVerses, type VerseMatch } from '../src/lib/search/cosine'
import { buildPrompt } from '../src/lib/prompt/template'

const DELAY_MS = 700
const EVAL_SET_PATH = path.resolve(process.cwd(), 'data/eval-set.json')
const REPORT_DIR = path.resolve(process.cwd(), 'docs/eval')
const REPORT_PATH = path.join(REPORT_DIR, 'phase-02-prompt-report.md')

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

interface EvalExpected { book: string; chapter: number; verse: number }
interface QuantitativeItem { query: string; expected: EvalExpected; note?: string }
interface EvalSet {
  _meta: { spec: string; version: string; embedded_range: string; policy: string }
  quantitative: { en: QuantitativeItem[]; ko: QuantitativeItem[] }
}

type HitResult = 'EXACT' | 'HIT' | 'FAIL' | 'ERROR'

interface EvalResult {
  query: string
  expected: EvalExpected
  note?: string
  result: HitResult
  top5: VerseMatch[]
  prompt: string
  errorMsg?: string
}

function judgeHit(expected: EvalExpected, top5: VerseMatch[]): HitResult {
  for (const r of top5) {
    if (r.book === expected.book && r.chapter === expected.chapter) {
      return r.verse === expected.verse ? 'EXACT' : 'HIT'
    }
  }
  return 'FAIL'
}

function buildReport(meta: EvalSet['_meta'], results: EvalResult[], timestamp: string): string {
  const lines: string[] = []
  const pass = results.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const total = results.filter((r) => r.result !== 'ERROR').length

  lines.push(`# phase-02 Search + Prompt Evaluation Report`)
  lines.push(``)
  lines.push(`- **timestamp**: ${timestamp}`)
  lines.push(`- **embedded_range**: ${meta.embedded_range}`)
  lines.push(`- **policy**: ${meta.policy}`)
  lines.push(``)
  lines.push(`## KO Hit Rate 요약`)
  lines.push(``)
  lines.push(`| 항목 | 값 |`)
  lines.push(`|------|-----|`)
  lines.push(`| PASS (HIT + EXACT) | ${pass} / ${total} |`)
  lines.push(`| Hit Rate | ${total > 0 ? ((pass / total) * 100).toFixed(0) : 0}% |`)
  lines.push(`| 기준 | ≥ 60% |`)
  lines.push(`| 판정 | ${pass / total >= 0.6 ? '✅ PASS' : '❌ FAIL'} |`)
  lines.push(``)
  lines.push(`## KO 상세 결과`)
  lines.push(``)

  for (const r of results) {
    const badge = r.result === 'EXACT' ? '✓ EXACT' : r.result === 'HIT' ? '✓ HIT' : r.result === 'ERROR' ? '✗ ERROR' : '✗ FAIL'
    lines.push(`### [${badge}] ${r.query}`)
    lines.push(``)
    lines.push(`- **expected**: ${r.expected.book} ${r.expected.chapter}:${r.expected.verse}`)
    if (r.note) lines.push(`- **note**: ${r.note}`)
    if (r.errorMsg) {
      lines.push(`- **error**: ${r.errorMsg}`)
    } else {
      lines.push(``)
      lines.push(`| rank | book | ch | v | similarity | text (앞 60자) |`)
      lines.push(`|------|------|----|---|------------|---------------|`)
      r.top5.forEach((m, i) => {
        lines.push(`| ${i + 1} | ${m.book} | ${m.chapter} | ${m.verse} | ${m.similarity.toFixed(3)} | ${m.text.slice(0, 60).replace(/\|/g, '\\|')} |`)
      })
      lines.push(``)
      lines.push(`**조립된 프롬프트 (앞 300자)**:`)
      lines.push(`\`\`\``)
      lines.push(r.prompt.slice(0, 300) + (r.prompt.length > 300 ? '\n...(생략)' : ''))
      lines.push(`\`\`\``)
    }
    lines.push(``)
  }

  return lines.join('\n')
}

async function main(): Promise<void> {
  if (!fs.existsSync(EVAL_SET_PATH)) {
    console.error('[eval:prompt] data/eval-set.json not found')
    process.exit(1)
  }

  const evalSet = JSON.parse(fs.readFileSync(EVAL_SET_PATH, 'utf8')) as EvalSet
  const { _meta, quantitative } = evalSet

  console.log(`[eval:prompt] spec: ${_meta.spec}, range: ${_meta.embedded_range}`)
  console.log(`[eval:prompt] === KO 정량 (${quantitative.ko.length} queries) ===`)

  const results: EvalResult[] = []

  for (const item of quantitative.ko) {
    try {
      const top5 = await searchVerses(item.query, 5)
      const hit = judgeHit(item.expected, top5)
      const prompt = buildPrompt(item.query, top5)
      results.push({ query: item.query, expected: item.expected, note: item.note, result: hit, top5, prompt })
      console.log(`[eval:prompt] [${hit}] "${item.query}"`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      results.push({ query: item.query, expected: item.expected, note: item.note, result: 'ERROR', top5: [], prompt: '', errorMsg: msg })
      console.error(`[eval:prompt] [ERROR] "${item.query}" — ${msg}`)
    }
    await sleep(DELAY_MS)
  }

  const pass = results.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const errors = results.filter((r) => r.result === 'ERROR').length
  const total = results.length - errors
  const pct = total > 0 ? ((pass / total) * 100).toFixed(0) : '0'

  console.log(`[eval:prompt] KO: ${pass}/${total} (${pct}%) ${Number(pct) >= 60 ? '✅ PASS' : '❌ FAIL'}`)

  const report = buildReport(_meta, results, new Date().toISOString())
  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, report, 'utf8')
  console.log(`[eval:prompt] report saved → ${REPORT_PATH}`)
}

main().catch((err: unknown) => {
  console.error('[eval:prompt] unexpected error:', err)
  process.exit(1)
})
