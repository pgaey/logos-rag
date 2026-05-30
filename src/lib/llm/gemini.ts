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

/** 양의 정수 환경변수를 읽는다. 없거나 비정상이면 fallback. */
function numFromEnv(key: string, fallback: number): number {
  const raw = process.env[key]
  if (!raw) return fallback
  const n = Number(raw)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

/**
 * buildPrompt 결과 문자열을 Gemini Flash 에 보내 한국어 답변을 받는다.
 * 외부 의존성(SDK 호출, 설정, 에러 분류)을 이 함수 한 곳에 격리한다.
 */
export async function generateAnswer(
  prompt: string,
): Promise<GenerateAnswerResult> {
  // 1. 입력 가드 — 빈 문자열 / 한도 초과는 SDK 호출 전에 거른다.
  const maxInputChars = numFromEnv('GEMINI_MAX_INPUT_CHARS', DEFAULTS.maxInputChars)
  const trimmed = prompt?.trim() ?? ''
  if (trimmed.length === 0 || prompt.length > maxInputChars) {
    return { ok: false, reason: 'invalid-input' }
  }

  // 2. 인증 — API 키 없으면 호출 불가.
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, reason: 'auth' }
  }

  const model = process.env.GEMINI_MODEL || DEFAULTS.model
  const ai = new GoogleGenAI({ apiKey })
  const response = await ai.models.generateContent({ model, contents: prompt })

  return { ok: true, answer: response.text ?? '' }
}
