import { describe, it, expect, vi, beforeEach } from 'vitest'

// @google/genai SDK 를 통째로 mock 한다. 라이브 호출 없이 결정적으로 검증한다.
// vi.hoisted 로 mock 함수를 끌어올려 vi.mock 팩토리에서 안전하게 참조한다.
const generateContent = vi.hoisted(() => vi.fn())

// 화살표 함수는 `new` 로 호출할 수 없어 일반 함수로 둔다 (vitest 4: "not a constructor").
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(function () {
    return { models: { generateContent } }
  }),
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

describe('generateAnswer — 에러 분류 (재시도 안 함)', () => {
  it('401 / API key invalid 계열 에러는 auth 로 분류한다', async () => {
    generateContent.mockRejectedValue(new Error('got status: 401 API key not valid'))

    const result = await generateAnswer('유효한 프롬프트')

    expect(result).toMatchObject({ ok: false, reason: 'auth' })
    expect(generateContent).toHaveBeenCalledTimes(1)
  })

  it('네트워크 계열 에러(fetch failed)는 network 로 분류한다', async () => {
    generateContent.mockRejectedValue(new Error('fetch failed'))

    const result = await generateAnswer('유효한 프롬프트')

    expect(result).toMatchObject({ ok: false, reason: 'network' })
    expect(generateContent).toHaveBeenCalledTimes(1)
  })

  it('분류 불가 에러는 unknown 으로 분류하고 detail 에 프롬프트를 누설하지 않는다', async () => {
    generateContent.mockRejectedValue(new Error('완전 예상 밖의 무언가'))

    const result = await generateAnswer('비밀스러운 사용자 질문 본문')

    expect(result).toMatchObject({ ok: false, reason: 'unknown' })
    expect(generateContent).toHaveBeenCalledTimes(1)
    if (!result.ok) {
      expect(result.detail ?? '').not.toContain('비밀스러운 사용자 질문 본문')
    }
  })
})

describe('generateAnswer — 429 재시도 & timeout', () => {
  it('429 가 한 번 발생해도 재시도 후 성공하면 ok 를 반환한다', async () => {
    vi.useFakeTimers()
    generateContent
      .mockRejectedValueOnce(new Error('got status: 429 RESOURCE_EXHAUSTED'))
      .mockResolvedValueOnce({ text: '재시도 후 답변' })

    const promise = generateAnswer('유효한 프롬프트')
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toEqual({ ok: true, answer: '재시도 후 답변' })
    expect(generateContent).toHaveBeenCalledTimes(2)
    vi.useRealTimers()
  })

  it('429 가 재시도 한도(maxRetries)까지 계속되면 rate-limit 을 반환한다', async () => {
    vi.useFakeTimers()
    process.env.GEMINI_MAX_RETRIES = '2'
    generateContent.mockRejectedValue(new Error('429 quota exceeded'))

    const promise = generateAnswer('유효한 프롬프트')
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toMatchObject({ ok: false, reason: 'rate-limit' })
    // 최초 1회 + 재시도 2회 = 3회
    expect(generateContent).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })

  it('SDK 응답이 GEMINI_TIMEOUT_MS 를 넘으면 timeout 을 반환한다', async () => {
    vi.useFakeTimers()
    process.env.GEMINI_TIMEOUT_MS = '100'
    // 영원히 미해결 — timeout 타이머만 발화하도록 한다.
    generateContent.mockReturnValue(new Promise(() => {}))

    const promise = generateAnswer('유효한 프롬프트')
    await vi.runAllTimersAsync()
    const result = await promise

    expect(result).toMatchObject({ ok: false, reason: 'timeout' })
    vi.useRealTimers()
  })
})
