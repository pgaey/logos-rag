-- user_daily_quotas: 사용자별 "오늘 사용한 질문 횟수" 집계 (spec-04-01)
-- 사용처: src/lib/quota/check.ts → askQuestion 이 검색·LLM 직전에 일일 한도 확인·차감
-- 목적: 공개 시 한 사용자의 대량 호출이 Gemini 비용/무료 tier 한도를 소진해
--       다른 사용자를 먹통으로 만드는 것을 막는다.

-- 사용자당 1행. period_date 로 "오늘"을 표시하고, 날짜가 지나면 호출 시 lazy 리셋한다
-- (cron 전체 리셋 불필요). request_count 가 그 날의 누적 사용량.
CREATE TABLE user_daily_quotas (
  user_id       uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  period_date   date        NOT NULL DEFAULT current_date,
  request_count int         NOT NULL DEFAULT 0,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS: 서버 전용 — 정책 0개 = anon/publishable 키 직접 접근 차단 (secret key 만 가능).
-- quota 변경은 신뢰할 수 있는 서버(admin client)만 해야 하므로 verses 와 동일 패턴.
ALTER TABLE user_daily_quotas ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE user_daily_quotas IS 'Per-user daily question quota counter (spec-04-01). Server-only via secret key; RLS enabled with zero policies.';

-- consume_daily_quota: 조회 → 한도 비교 → 조건부 증가를 단일 함수(트랜잭션)에서 원자적으로.
-- 동시요청 race 방지: INSERT ... ON CONFLICT DO UPDATE 가 해당 행에 lock 을 잡아
--   동시 호출을 순차화한다. 이어지는 조건부 UPDATE 도 같은 트랜잭션 내에서 실행된다.
-- lazy reset: period_date 가 오늘(current_date, UTC)보다 과거면 request_count 를 0 으로.
-- 반환: allowed(한도 내 증가 성공 여부), remaining(남은 횟수, 차단 시 0).
CREATE OR REPLACE FUNCTION consume_daily_quota(p_user_id uuid, p_limit int)
RETURNS TABLE (allowed boolean, remaining int)
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  -- 1) 행 보장 + 날짜 경과 시 리셋. 행에 lock 이 걸려 동시 호출이 직렬화된다.
  INSERT INTO user_daily_quotas (user_id, period_date, request_count)
    VALUES (p_user_id, current_date, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET request_count = CASE
          WHEN user_daily_quotas.period_date < current_date THEN 0
          ELSE user_daily_quotas.request_count
        END,
        period_date = current_date,
        updated_at  = now();

  -- 2) 한도 미만일 때만 +1 (원자적). 증가한 행이 있으면 FOUND = true.
  UPDATE user_daily_quotas
    SET request_count = request_count + 1,
        updated_at    = now()
    WHERE user_id = p_user_id AND request_count < p_limit
    RETURNING request_count INTO v_count;

  IF FOUND THEN
    RETURN QUERY SELECT true, p_limit - v_count;
  ELSE
    RETURN QUERY SELECT false, 0;
  END IF;
END;
$$;

COMMENT ON FUNCTION consume_daily_quota IS 'Atomically check+increment a user''s daily quota with lazy date reset. Returns (allowed, remaining).';
