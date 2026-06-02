import type { AskResult } from './actions'

// askQuestion 의 실패 reason → 사용자에게 보여줄 한국어 안내.
// UI 에서 분리한 순수 함수라 vitest(node env)로 단위 테스트 가능하다.

// actions.ts 의 AskResult union 에서 ok:false 쪽 reason 만 추출.
// actions 의 reason 이 바뀌면 MESSAGES 키 누락이 컴파일 에러로 잡힌다(동기화 강제).
type FailureReason = Extract<AskResult, { ok: false }>['reason']

// 일시적 서버 오류 등 사용자가 할 수 있는 게 없을 때의 일반 메시지.
const FALLBACK = '일시적인 오류가 발생했습니다.'

const MESSAGES: Record<FailureReason, string> = {
  unauthorized: '로그인이 만료되었습니다. 다시 로그인해 주세요.',
  'invalid-input': '질문을 다시 확인해 주세요.',
  'rate-limit': '요청이 많습니다. 잠시 후 다시 시도해 주세요.',
  timeout: '응답이 지연되고 있습니다. 다시 시도해 주세요.',
  unknown: FALLBACK,
}

/**
 * 실패 reason 을 사용자 안내 문구로 매핑한다.
 * 타입상 들어올 수 없는 값이라도(런타임 방어) FALLBACK 으로 접는다.
 */
export function messageForReason(reason: FailureReason): string {
  return MESSAGES[reason] ?? FALLBACK
}
