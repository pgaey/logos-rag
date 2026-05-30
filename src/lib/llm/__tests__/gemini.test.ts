import { describe, it, expect, vi, beforeEach } from 'vitest'

// @google/genai SDK 를 통째로 mock 한다. 라이브 호출 없이 결정적으로 검증한다.
// vi.hoisted 로 mock 함수를 끌어올려 vi.mock 팩토리에서 안전하게 참조한다.
const generateContent = vi.hoisted(() => vi.fn())

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => ({ models: { generateContent } })),
}))

import { generateAnswer } from '../gemini'

beforeEach(() => {
  vi.clearAllMocks()
  process.env.GEMINI_API_KEY = 'test-key'
  // 테스트 간 누수 방지: Gemini env 오버라이드를 매번 초기화한다.
  delete process.env.GEMINI_MODEL
  delete process.env.GEMINI_TIMEOUT_MS
  delete process.env.GEMINI_MAX_RETRIES
  delete process.env.GEMINI_MAX_INPUT_CHARS
})

describe('generateAnswer — happy path', () => {
  it('정상 응답이면 { ok: true, answer } 를 반환한다', async () => {
    generateContent.mockResolvedValue({ text: '한국어 답변' })

    const result = await generateAnswer('유효한 프롬프트')

    expect(result).toEqual({ ok: true, answer: '한국어 답변' })
    expect(generateContent).toHaveBeenCalledTimes(1)
  })
})

describe('generateAnswer — 입력 가드 & 인증', () => {
  it('빈 입력(공백만)이면 invalid-input 을 반환하고 SDK 를 호출하지 않는다', async () => {
    const result = await generateAnswer('   ')

    expect(result).toEqual({ ok: false, reason: 'invalid-input' })
    expect(generateContent).not.toHaveBeenCalled()
  })

  it('입력이 GEMINI_MAX_INPUT_CHARS 를 초과하면 invalid-input 을 반환한다', async () => {
    process.env.GEMINI_MAX_INPUT_CHARS = '10'

    const result = await generateAnswer('이 문장은 열 글자를 확실히 넘는다')

    expect(result).toEqual({ ok: false, reason: 'invalid-input' })
    expect(generateContent).not.toHaveBeenCalled()
  })

  it('GEMINI_API_KEY 가 없으면 auth 를 반환한다', async () => {
    delete process.env.GEMINI_API_KEY

    const result = await generateAnswer('유효한 프롬프트')

    expect(result).toEqual({ ok: false, reason: 'auth' })
    expect(generateContent).not.toHaveBeenCalled()
  })
})
