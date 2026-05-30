import { GoogleGenAI } from '@google/genai'

/**
 * generateAnswer 의 결과. discriminated union 으로 호출자가 분기를 강제하도록 한다.
 * 운영성 실패는 throw 하지 않고 모두 { ok: false } 로 반환한다.
 */
export type GenerateAnswerResult =
  | { ok: true; answer: string }
  | { ok: false; reason: ErrorReason; detail?: string }

export type ErrorReason =
  | 'rate-limit'
  | 'auth'
  | 'timeout'
  | 'network'
  | 'invalid-input'
  | 'unknown'

const DEFAULTS = {
  model: 'gemini-2.5-flash',
  timeoutMs: 30_000,
  maxRetries: 2,
  maxInputChars: 30_000,
  backoffBaseMs: 500,
} as const

/**
 * buildPrompt 결과 문자열을 Gemini Flash 에 보내 한국어 답변을 받는다.
 * 외부 의존성(SDK 호출, 설정, 에러 분류)을 이 함수 한 곳에 격리한다.
 */
export async function generateAnswer(
  prompt: string,
): Promise<GenerateAnswerResult> {
  const apiKey = process.env.GEMINI_API_KEY
  const model = process.env.GEMINI_MODEL || DEFAULTS.model

  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({ model, contents: prompt })

  return { ok: true, answer: response.text ?? '' }
}
