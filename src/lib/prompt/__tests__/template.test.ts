import { describe, it, expect } from 'vitest'
import { buildPrompt } from '../template'
import type { VerseMatch } from '@/lib/search/cosine'

const sampleVerses: VerseMatch[] = [
  { id: 1, book: 'Genesis', chapter: 1, verse: 1, text: 'In the beginning God created the heaven and the earth.', similarity: 0.9 },
  { id: 2, book: 'Genesis', chapter: 1, verse: 2, text: 'And the earth was without form, and void; and darkness was upon the face of the deep.', similarity: 0.85 },
]

describe('buildPrompt', () => {
  it('세 섹션(시스템/컨텍스트/질문)을 모두 포함한다', () => {
    const result = buildPrompt('천지창조에 대해 설명해 주세요', sampleVerses)
    expect(result).toContain('[System]')
    expect(result).toContain('[Relevant Bible Verses]')
    expect(result).toContain('[User Question]')
    expect(result).toContain('천지창조에 대해 설명해 주세요')
  })

  it('verse 를 번호 붙인 [Book Ch:V] 형식으로 나열한다', () => {
    const result = buildPrompt('질문', sampleVerses)
    expect(result).toContain('[Genesis 1:1]')
    expect(result).toContain('[Genesis 1:2]')
    expect(result).toContain('1.')
    expect(result).toContain('2.')
  })

  it('verses 가 빈 배열이면 No relevant verses found. 를 표시한다', () => {
    const result = buildPrompt('질문', [])
    expect(result).toContain('No relevant verses found.')
  })
})
