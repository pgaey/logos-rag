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
})

describe('generateAnswer — happy path', () => {
  it('정상 응답이면 { ok: true, answer } 를 반환한다', async () => {
    generateContent.mockResolvedValue({ text: '한국어 답변' })

    const result = await generateAnswer('유효한 프롬프트')

    expect(result).toEqual({ ok: true, answer: '한국어 답변' })
    expect(generateContent).toHaveBeenCalledTimes(1)
  })
})
