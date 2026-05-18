-- match_verses: cosine similarity 기반 verse 검색 RPC
-- 사용처: src/lib/search/cosine.ts (spec-01-05), phase-02 검색 단계
-- 동작: query_embedding 과 verses.embedding 사이 cosine distance 가 가장 작은 top-K 반환
--       1 - distance = similarity (높을수록 가까움)
--       embedding 이 NULL 인 row 는 검색 대상 제외 (부분 적재 상태 대응)

CREATE OR REPLACE FUNCTION match_verses(
  query_embedding extensions.vector(768),
  match_count int
)
RETURNS TABLE (
  id bigint,
  book text,
  chapter int,
  verse int,
  text text,
  similarity float
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    v.id,
    v.book,
    v.chapter,
    v.verse,
    v.text,
    1 - (v.embedding <=> query_embedding) AS similarity
  FROM verses v
  WHERE v.embedding IS NOT NULL
  ORDER BY v.embedding <=> query_embedding
  LIMIT match_count;
$$;

COMMENT ON FUNCTION match_verses IS 'Cosine similarity search over verses.embedding (skips NULL embeddings)';
