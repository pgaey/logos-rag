import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { VerseMatch } from '@/lib/search/cosine'

// askQuestion 의 의존성 3개를 모듈 단위로 mock 한다.
// - requireUser: 인증 분기 통제
// - searchVerses: 검색 결과/throw 통제
// - generateAnswer: LLM 결과 통제
// classifyError 는 mock 하지 않고 실제 함수를 쓴다(순수 분류기 — search throw 분류 경로를 실제로 검증).
const requireUser = vi.hoisted(() => vi.fn())
const searchVerses = vi.hoisted(() => vi.fn())
const generateAnswer = vi.hoisted(() => vi.fn())

vi.mock('@/lib/auth/guard', () => ({ requireUser }))
vi.mock('@/lib/search/cosine', () => ({ searchVerses }))
vi.mock('@/lib/llm/gemini', async (importOriginal) => {
  // classifyError 는 실제 구현 유지, generateAnswer 만 교체
  const actual = await importOriginal<typeof import('@/lib/llm/gemini')>()
  return { ...actual, generateAnswer }
})

import { askQuestion } from '../actions'

const sampleVerses: VerseMatch[] = [
  { id: 1, book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning...', similarity: 0.9 },
  { id: 2, book: 'Genesis', chapter: 1, verse: 2, text: 'And the earth...', similarity: 0.85 },
  { id: 3, book: 'Genesis', chapter: 1, verse: 3, text: 'And God said...', similarity: 0.8 },
]

beforeEach(() => {
  vi.clearAllMocks()
  // 기본값: 인증됨
  requireUser.mockResolvedValue({ sub: 'user-1', email: 'a@b.com' })
})

describe('askQuestion — 인증 & 입력 검증', () => {
  it('정상: 인증·검색·LLM 성공 시 { ok:true, answer, verses }', async () => {
    searchVerses.mockResolvedValue(sampleVerses)
    generateAnswer.mockResolvedValue({ ok: true, answer: '한국어 답변' })

    const result = await askQuestion({ question: '천지창조에 대해 알려줘' })

    expect(result).toEqual({ ok: true, answer: '한국어 답변', verses: sampleVerses })
  })

  it('미인증: requireUser 가 null 이면 unauthorized, 검색 미호출', async () => {
    requireUser.mockResolvedValue(null)

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'unauthorized' })
    expect(searchVerses).not.toHaveBeenCalled()
  })

  it('빈 질문: invalid-input, 검색 미호출', async () => {
    const result = await askQuestion({ question: '   ' })

    expect(result).toEqual({ ok: false, reason: 'invalid-input' })
    expect(searchVerses).not.toHaveBeenCalled()
  })

  it('과길이 질문(>1000자): invalid-input', async () => {
    const result = await askQuestion({ question: 'a'.repeat(1001) })

    expect(result).toEqual({ ok: false, reason: 'invalid-input' })
    expect(searchVerses).not.toHaveBeenCalled()
  })

  it('k 클램프: k=99 입력 시 searchVerses 가 k=10 으로 호출됨', async () => {
    searchVerses.mockResolvedValue(sampleVerses)
    generateAnswer.mockResolvedValue({ ok: true, answer: 'ok' })

    await askQuestion({ question: '질문', k: 99 })

    expect(searchVerses).toHaveBeenCalledWith('질문', 10)
  })
})

describe('askQuestion — 에러 매핑 & 빈 결과', () => {
  it('searchVerses 가 429/quota 로 throw 하면 rate-limit (classifyError 실제 분류)', async () => {
    searchVerses.mockRejectedValue(new Error('searchVerses RPC error: 429 quota exceeded'))

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'rate-limit' })
    expect(generateAnswer).not.toHaveBeenCalled()
  })

  it('searchVerses 가 기타 에러로 throw 하면 unknown', async () => {
    searchVerses.mockRejectedValue(new Error('something unexpected'))

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'unknown' })
    expect(generateAnswer).not.toHaveBeenCalled()
  })

  it('generateAnswer rate-limit → rate-limit', async () => {
    searchVerses.mockResolvedValue(sampleVerses)
    generateAnswer.mockResolvedValue({ ok: false, reason: 'rate-limit' })

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'rate-limit' })
  })

  it('generateAnswer timeout → timeout (사용자 재시도 가능하므로 별도)', async () => {
    searchVerses.mockResolvedValue(sampleVerses)
    generateAnswer.mockResolvedValue({ ok: false, reason: 'timeout' })

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'timeout' })
  })

  it('generateAnswer auth(서버 설정 문제) → unknown (화면엔 일시 오류)', async () => {
    searchVerses.mockResolvedValue(sampleVerses)
    generateAnswer.mockResolvedValue({ ok: false, reason: 'auth', detail: 'no key' })

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: false, reason: 'unknown' })
  })

  it('verses 0건이어도 정상 ok (buildPrompt 가 처리)', async () => {
    searchVerses.mockResolvedValue([])
    generateAnswer.mockResolvedValue({ ok: true, answer: '근거가 부족합니다' })

    const result = await askQuestion({ question: '질문' })

    expect(result).toEqual({ ok: true, answer: '근거가 부족합니다', verses: [] })
  })
})
