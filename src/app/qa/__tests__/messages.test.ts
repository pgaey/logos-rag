import { describe, it, expect } from 'vitest'
import { messageForReason } from '../messages'
import type { AskResult } from '../actions'

// AskResult 의 실패(ok:false) reason 만 추출. actions.ts 의 union 과 항상 동기화된다
// (타입에서 끌어오므로, actions 의 reason 이 바뀌면 여기 REASONS 도 갱신 강제).
type FailureReason = Extract<AskResult, { ok: false }>['reason']

const REASONS: FailureReason[] = [
  'unauthorized',
  'invalid-input',
  'rate-limit',
  'timeout',
  'unknown',
]

describe('messageForReason', () => {
  it.each(REASONS)('"%s" → 비어있지 않은 한국어 메시지', (reason) => {
    const msg = messageForReason(reason)
    expect(typeof msg).toBe('string')
    expect(msg.trim().length).toBeGreaterThan(0)
  })

  it('사용자가 행동 가능한 reason 4종은 서로 구분되는 안내를 준다', () => {
    // unauthorized(재로그인) / invalid-input(질문수정) / rate-limit(대기) /
    // timeout(재시도) 은 안내가 달라야 사용자가 무엇을 할지 알 수 있다.
    const distinct = new Set([
      messageForReason('unauthorized'),
      messageForReason('invalid-input'),
      messageForReason('rate-limit'),
      messageForReason('timeout'),
    ])
    expect(distinct.size).toBe(4)
  })

  it('정의되지 않은 reason 값에도 일반 메시지로 폴백한다(방어적)', () => {
    const msg = messageForReason('not-a-real-reason' as FailureReason)
    expect(msg.trim().length).toBeGreaterThan(0)
  })
})
