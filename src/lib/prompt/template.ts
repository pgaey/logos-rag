import type { VerseMatch } from '@/lib/search/cosine'

const SYSTEM_INSTRUCTION = `You are a biblical assistant. Answer the user's question in Korean.
Base your answer on the provided Bible verses and cite them in your response using the format [Book Ch:V].
If the provided verses are insufficient, acknowledge it honestly.`

export function buildPrompt(question: string, verses: VerseMatch[]): string {
  const context =
    verses.length === 0
      ? 'No relevant verses found.'
      : verses
          .map((v, i) => `${i + 1}. [${v.book} ${v.chapter}:${v.verse}] ${v.text}`)
          .join('\n')

  return [
    `[System]\n${SYSTEM_INSTRUCTION}`,
    `[Relevant Bible Verses]\n${context}`,
    `[User Question]\n${question}`,
  ].join('\n\n')
}
