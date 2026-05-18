-- Enable pgvector if not already (idempotent)
CREATE EXTENSION IF NOT EXISTS vector;

-- verses: WEB bible 31,102개 구절 + 768d embedding (gemini text-embedding-004) 저장
CREATE TABLE verses (
  id BIGSERIAL PRIMARY KEY,
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL,
  embedding extensions.vector(768),
  CONSTRAINT verses_book_chapter_verse_unique UNIQUE (book, chapter, verse)
);

-- RLS: 서버 전용 — 정책 0개 = anon/publishable 키 접근 차단 (secret key 만 가능)
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE verses IS 'WEB bible verses with 768-dim embeddings (gemini text-embedding-004)';
COMMENT ON COLUMN verses.embedding IS 'NULL until populated by scripts/embed-bible.ts (spec-01-04)';
