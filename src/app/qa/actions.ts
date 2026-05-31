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
// k 는 /api/search 와 동일하게 1~10 으로 클램프(기본 5).
const InputSchema = z.object({
  question: z.string().trim().min(1).max(1000),
  k: z.number().int().min(1).max(10).optional().default(5),
})

export async function askQuestion(input: {
  question: string
  k?: number
}): Promise<AskResult> {
  // 1. 인증 게이트 (보조). proxy 가 주 게이트지만, 직접 import 호출 대비 한 번 더 확인.
  const user = await requireUser()
  if (!user) {
    return { ok: false, reason: 'unauthorized' }
  }

  // 2. 입력 검증. 빈 문자열·과길이·잘못된 k → invalid-input.
  const parsed = InputSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, reason: 'invalid-input' }
  }
  const { question, k } = parsed.data

  // 3. 검색 (다음 task 에서 try/catch + 에러 분류 추가). 지금은 정상 경로만.
  const verses = await searchVerses(question, k)

  // 4. 프롬프트 조립 (phase-02). verses 가 0건이어도 buildPrompt 가 처리.
  const prompt = buildPrompt(question, verses)

  // 5. LLM 호출 (spec-03-03). reason 매핑은 다음 task 에서 확장.
  const result = await generateAnswer(prompt)
  if (result.ok) {
    return { ok: true, answer: result.answer, verses }
  }

  // 임시: 실패는 일단 unknown (Task 5 에서 reason 별 매핑으로 교체)
  return { ok: false, reason: 'unknown' }
}
