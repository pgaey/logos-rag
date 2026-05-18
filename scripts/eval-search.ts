import * as fs from 'fs'
import * as path from 'path'
import { searchVerses, type VerseMatch } from '../src/lib/search/cosine'

// ── 상수 ────────────────────────────────────────────────────────────────────
const DELAY_MS = 700
const EVAL_SET_PATH = path.resolve(process.cwd(), 'data/eval-set.json')
const REPORT_DIR = path.resolve(process.cwd(), 'docs/eval')
const REPORT_PATH = path.join(REPORT_DIR, 'phase-01-search-report.md')

// ── 유틸 ────────────────────────────────────────────────────────────────────
const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms))

// ── 타입 ────────────────────────────────────────────────────────────────────
interface EvalExpected {
  book: string
  chapter: number
  verse: number
}

interface QuantitativeItem {
  query: string
  expected: EvalExpected
  note?: string
}

interface QualitativeItem {
  query: string
  note?: string
}

interface EvalSet {
  _meta: {
    spec: string
    version: string
    embedded_range: string
    policy: string
  }
  quantitative: {
    en: QuantitativeItem[]
    ko: QuantitativeItem[]
  }
  qualitative_ko: QualitativeItem[]
}

// ── 정량 평가 결과 타입 ─────────────────────────────────────────────────────
type HitResult = 'EXACT' | 'HIT' | 'FAIL' | 'ERROR'

interface QuantResult {
  query: string
  expected: EvalExpected
  note?: string
  result: HitResult
  top5: VerseMatch[]
  errorMsg?: string
}

// ── 판정 로직 ────────────────────────────────────────────────────────────────
// top-5 중 expected 의 (book, chapter) 가 일치하면 HIT,
// (book, chapter, verse) 까지 일치하면 EXACT.
function judgeHit(expected: EvalExpected, top5: VerseMatch[]): HitResult {
  for (const r of top5) {
    if (r.book === expected.book && r.chapter === expected.chapter) {
      if (r.verse === expected.verse) return 'EXACT'
      return 'HIT'
    }
  }
  return 'FAIL'
}

// ── 마크다운 리포트 생성 ─────────────────────────────────────────────────────
function buildReport(
  meta: EvalSet['_meta'],
  enResults: QuantResult[],
  koResults: QuantResult[],
  qualResults: { query: string; note?: string; top3: VerseMatch[]; errorMsg?: string }[],
  timestamp: string,
): string {
  const lines: string[] = []

  // 헤더
  lines.push(`# phase-01 Search Evaluation Report`)
  lines.push(``)
  lines.push(`- **timestamp**: ${timestamp}`)
  lines.push(`- **embedded_range**: ${meta.embedded_range}`)
  lines.push(`- **policy**: ${meta.policy}`)
  lines.push(``)

  // 정량 hit rate 요약
  const enPass = enResults.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const enTotal = enResults.filter((r) => r.result !== 'ERROR').length
  const koPass = koResults.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const koTotal = koResults.filter((r) => r.result !== 'ERROR').length
  const totalPass = enPass + koPass
  const totalTotal = enTotal + koTotal

  lines.push(`## 정량 Hit Rate 요약`)
  lines.push(``)
  lines.push(`| 언어 | PASS | 전체 | Hit Rate |`)
  lines.push(`|------|------|------|----------|`)
  lines.push(`| EN | ${enPass} | ${enTotal} | ${enTotal > 0 ? ((enPass / enTotal) * 100).toFixed(0) : 0}% |`)
  lines.push(`| KO | ${koPass} | ${koTotal} | ${koTotal > 0 ? ((koPass / koTotal) * 100).toFixed(0) : 0}% |`)
  lines.push(`| 합산 | ${totalPass} | ${totalTotal} | ${totalTotal > 0 ? ((totalPass / totalTotal) * 100).toFixed(0) : 0}% |`)
  lines.push(``)

  // EN 상세
  lines.push(`## 정량 EN 상세`)
  lines.push(``)
  for (const r of enResults) {
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
        lines.push(
          `| ${i + 1} | ${m.book} | ${m.chapter} | ${m.verse} | ${m.similarity.toFixed(3)} | ${m.text.slice(0, 60).replace(/\|/g, '\\|')} |`,
        )
      })
    }
    lines.push(``)
  }

  // KO 상세
  lines.push(`## 정량 KO 상세`)
  lines.push(``)
  for (const r of koResults) {
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
        lines.push(
          `| ${i + 1} | ${m.book} | ${m.chapter} | ${m.verse} | ${m.similarity.toFixed(3)} | ${m.text.slice(0, 60).replace(/\|/g, '\\|')} |`,
        )
      })
    }
    lines.push(``)
  }

  // 정성 섹션
  lines.push(`## 정성 KO (사람 판단 필요)`)
  lines.push(``)
  lines.push(`> 아래 쿼리는 적재 범위(Genesis 1~34) 밖에서 가져온 out-of-range 쿼리입니다.`)
  lines.push(`> 결과가 나오더라도 정확도 판단은 사람이 해야 합니다.`)
  lines.push(``)
  for (const q of qualResults) {
    lines.push(`### ${q.query}`)
    lines.push(``)
    if (q.note) lines.push(`> ${q.note}`)
    lines.push(``)
    if (q.errorMsg) {
      lines.push(`**ERROR**: ${q.errorMsg}`)
    } else {
      lines.push(`| rank | book | ch | v | similarity | text |`)
      lines.push(`|------|------|----|---|------------|------|`)
      q.top3.forEach((m, i) => {
        lines.push(
          `| ${i + 1} | ${m.book} | ${m.chapter} | ${m.verse} | ${m.similarity.toFixed(3)} | ${m.text.replace(/\|/g, '\\|')} |`,
        )
      })
    }
    lines.push(``)
  }

  return lines.join('\n')
}

// ── main ─────────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // 1. eval-set.json 로드
  if (!fs.existsSync(EVAL_SET_PATH)) {
    console.error('[eval:search] data/eval-set.json not found')
    process.exit(1)
  }
  const raw = fs.readFileSync(EVAL_SET_PATH, 'utf8')
  const evalSet = JSON.parse(raw) as EvalSet

  const { _meta, quantitative, qualitative_ko } = evalSet
  console.log(`[eval:search] loaded eval-set.json — spec: ${_meta.spec}, range: ${_meta.embedded_range}`)

  // 2. 정량 평가 — EN
  console.log(`[eval:search] === 정량 EN (${quantitative.en.length} queries) ===`)
  const enResults: QuantResult[] = []
  for (const item of quantitative.en) {
    let result: QuantResult
    try {
      const top5 = await searchVerses(item.query, 5)
      const hit = judgeHit(item.expected, top5)
      result = { query: item.query, expected: item.expected, note: item.note, result: hit, top5 }
      console.log(`[eval:search] EN [${hit}] "${item.query.slice(0, 50)}"`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result = { query: item.query, expected: item.expected, note: item.note, result: 'ERROR', top5: [], errorMsg: msg }
      console.error(`[eval:search] EN [ERROR] "${item.query.slice(0, 50)}" — ${msg}`)
    }
    enResults.push(result)
    await sleep(DELAY_MS)
  }

  // 3. 정량 평가 — KO
  console.log(`[eval:search] === 정량 KO (${quantitative.ko.length} queries) ===`)
  const koResults: QuantResult[] = []
  for (const item of quantitative.ko) {
    let result: QuantResult
    try {
      const top5 = await searchVerses(item.query, 5)
      const hit = judgeHit(item.expected, top5)
      result = { query: item.query, expected: item.expected, note: item.note, result: hit, top5 }
      console.log(`[eval:search] KO [${hit}] "${item.query}"`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      result = { query: item.query, expected: item.expected, note: item.note, result: 'ERROR', top5: [], errorMsg: msg }
      console.error(`[eval:search] KO [ERROR] "${item.query}" — ${msg}`)
    }
    koResults.push(result)
    await sleep(DELAY_MS)
  }

  // 4. 정성 평가 — qualitative_ko
  console.log(`[eval:search] === 정성 KO (${qualitative_ko.length} queries) ===`)
  const qualResults: { query: string; note?: string; top3: VerseMatch[]; errorMsg?: string }[] = []
  for (const item of qualitative_ko) {
    try {
      const top3 = await searchVerses(item.query, 3)
      qualResults.push({ query: item.query, note: item.note, top3 })
      console.log(`[eval:search] qualitative "${item.query}" — top-1: ${top3[0]?.book ?? 'n/a'} ${top3[0]?.chapter ?? ''}:${top3[0]?.verse ?? ''}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      qualResults.push({ query: item.query, note: item.note, top3: [], errorMsg: msg })
      console.error(`[eval:search] qualitative [ERROR] "${item.query}" — ${msg}`)
    }
    await sleep(DELAY_MS)
  }

  // 5. 콘솔 요약 출력
  const enPass = enResults.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const enErrors = enResults.filter((r) => r.result === 'ERROR').length
  const enTotal = enResults.length - enErrors
  const koPass = koResults.filter((r) => r.result === 'EXACT' || r.result === 'HIT').length
  const koErrors = koResults.filter((r) => r.result === 'ERROR').length
  const koTotal = koResults.length - koErrors
  const totalPass = enPass + koPass
  const totalTotal = enTotal + koTotal
  const qualErrors = qualResults.filter((r) => r.errorMsg).length

  const enPct = enTotal > 0 ? ((enPass / enTotal) * 100).toFixed(0) : '0'
  const koPct = koTotal > 0 ? ((koPass / koTotal) * 100).toFixed(0) : '0'
  const totalPct = totalTotal > 0 ? ((totalPass / totalTotal) * 100).toFixed(0) : '0'

  console.log(
    `[eval:search] EN: ${enPass}/${enTotal} (${enPct}%), KO: ${koPass}/${koTotal} (${koPct}%), 합산: ${totalPass}/${totalTotal} (${totalPct}%)`,
  )
  if (enErrors + koErrors + qualErrors > 0) {
    console.log(`[eval:search] 오류: EN ${enErrors}건, KO ${koErrors}건, 정성 ${qualErrors}건`)
  }
  console.log(`[eval:search] 정성 ${qualitative_ko.length}건 — 리포트에서 사람 판단 필요`)

  // 6. 마크다운 리포트 저장
  const timestamp = new Date().toISOString()
  const report = buildReport(_meta, enResults, koResults, qualResults, timestamp)

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(REPORT_PATH, report, 'utf8')
  console.log(`[eval:search] report saved → ${REPORT_PATH}`)
}

main().catch((err: unknown) => {
  console.error('[eval:search] unexpected error:', err)
  process.exit(1)
})
