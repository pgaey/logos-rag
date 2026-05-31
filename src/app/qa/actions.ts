'use server'

// ─────────────────────────────────────────────────────────────────────────────
// QA 통합 Server Action.
//
// 'use server' = 이 파일의 export 함수들은 서버에서만 실행된다. Next.js 가
// 클라이언트↔서버 HTTP 배선을 자동 생성하므로, 화면(spec-03-05)은 이 함수를
// 평범한 async 함수처럼 import 해서 호출하면 된다 (내부적으로는 POST 요청).
//
// 흐름: requireUser(인증) → zod(입력검증) → searchVerses(검색)
//       → buildPrompt(프롬프트 조립) → generateAnswer(LLM) → AskResult 매핑
//
// 핵심 설계: 검색·LLM 의 이질적인 실패(throw / 6종 reason)를 화면이 분기할
//           단일 typed result(AskResult, 5종 reason)로 정규화한다.
// ─────────────────────────────────────────────────────────────────────────────

import { z } from 'zod'
import { requireUser } from '@/lib/auth/guard'
import { searchVerses, type VerseMatch } from '@/lib/search/cosine'
import { buildPrompt } from '@/lib/prompt/template'
import { generateAnswer, classifyError } from '@/lib/llm/gemini'

/**
 * askQuestion 의 결과. discriminated union 이라 화면이 ok 로 분기를 강제당한다.
 * (result.answer 직접 접근은 ok:true 로 좁히기 전엔 컴파일 에러)
 */
export type AskResult =
  | { ok: true; answer: string; verses: VerseMatch[] }
  | {
      ok: false
      reason: 'unauthorized' | 'invalid-input' | 'rate-limit' | 'timeout' | 'unknown'
    }

// 입력 스키마. question 은 검색 쿼리로 충분한 길이(1000자)만 가드하고,
// 최종 프롬프트 길이(30k) 한도는 generateAnswer 에 위임한다(이중 가드 금지).
// k 는 여기서 검증하지 않는다 — zod .max() 는 거부(reject)라 큰 값이 invalid-input
// 이 되어버린다. /api/search 와 동일하게 "거부"가 아니라 1~10 "클램프"가 의도이므로
// 아래에서 clampK 로 잘라낸다.
const InputSchema = z.object({
  question: z.string().trim().min(1).max(1000),
})

const DEFAULT_K = 5
// k 를 1~10 으로 잘라낸다(/api/search 와 동일). 미지정/비정상이면 기본 5.
function clampK(k: number | undefined): number {
  if (typeof k !== 'number' || !Number.isFinite(k)) return DEFAULT_K
  return Math.min(Math.max(1, Math.floor(k)), 10)
}

export async function askQuestion(input: {
  question: string
  k?: number
}): Promise<AskResult> {
  // 1. 인증 게이트 (보조). proxy 가 주 게이트지만, 직접 import 호출 대비 한 번 더 확인.
  const user = await requireUser()
  if (!user) {
    return { ok: false, reason: 'unauthorized' }
  }

  // 2. 입력 검증. question 빈 문자열·과길이 → invalid-input. k 는 거부가 아니라 클램프.
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, reason: 'invalid-input' }
  }
  const { question } = parsed.data
  const k = clampK(input.k)

  // 3. 검색. searchVerses 는 실패 시 throw 하므로 try/catch 로 감싸,
  //    generateAnswer 와 동일한 classifyError 로 분류한다(임베딩도 같은 SDK).
  //    검색 단계 429 가 'unknown' 으로 뭉개지지 않도록 rate-limit 만 보존.
  let verses: VerseMatch[]
  try {
    verses = await searchVerses(question, k)
  } catch (err) {
    const { reason } = classifyError(err)
    return { ok: false, reason: reason === 'rate-limit' ? 'rate-limit' : 'unknown' }
  }

  // 4. 프롬프트 조립 (phase-02). verses 가 0건이어도 buildPrompt 가 처리.
  const prompt = buildPrompt(question, verses)

  // 5. LLM 호출 (spec-03-03) → AskResult 매핑.
  const result = await generateAnswer(prompt)
  if (result.ok) {
    return { ok: true, answer: result.answer, verses }
  }

  // generateAnswer 6종 reason → AskResult 5종 매핑.
  // - rate-limit / timeout: 사용자가 행동 가능(기다리거나 재시도)하므로 보존.
  // - auth(서버 설정)·network·invalid-input(프롬프트 과길이)·unknown: 사용자가
  //   할 수 있는 게 없는 "일시적 서버 오류"라 화면엔 unknown 으로 접되,
  //   원인 분류는 서버 로그로 남긴다(시크릿/프롬프트 본문은 미포함).
  if (result.reason === 'rate-limit') return { ok: false, reason: 'rate-limit' }
  if (result.reason === 'timeout') return { ok: false, reason: 'timeout' }

  console.error('[askQuestion] generateAnswer failed:', result.reason, result.detail ?? '')
  return { ok: false, reason: 'unknown' }
}
