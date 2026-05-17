import { XMLParser } from 'fast-xml-parser'
import * as fs from 'fs'
import * as path from 'path'

const WEB_URL =
  'https://raw.githubusercontent.com/gratis-bible/bible/master/en/web.xml'

// OSIS book code → full name (canonical order: Genesis → Revelation)
const BOOK_MAP: Record<string, string> = {
  // 구약 39권
  Gen: 'Genesis',
  Exod: 'Exodus',
  Lev: 'Leviticus',
  Num: 'Numbers',
  Deut: 'Deuteronomy',
  Josh: 'Joshua',
  Judg: 'Judges',
  Ruth: 'Ruth',
  '1Sam': '1 Samuel',
  '2Sam': '2 Samuel',
  '1Kgs': '1 Kings',
  '2Kgs': '2 Kings',
  '1Chr': '1 Chronicles',
  '2Chr': '2 Chronicles',
  Ezra: 'Ezra',
  Neh: 'Nehemiah',
  Esth: 'Esther',
  Job: 'Job',
  Ps: 'Psalms',
  Prov: 'Proverbs',
  Eccl: 'Ecclesiastes',
  Song: 'Song of Solomon',
  Isa: 'Isaiah',
  Jer: 'Jeremiah',
  Lam: 'Lamentations',
  Ezek: 'Ezekiel',
  Dan: 'Daniel',
  Hos: 'Hosea',
  Joel: 'Joel',
  Amos: 'Amos',
  Obad: 'Obadiah',
  Jonah: 'Jonah',
  Mic: 'Micah',
  Nah: 'Nahum',
  Hab: 'Habakkuk',
  Zeph: 'Zephaniah',
  Hag: 'Haggai',
  Zech: 'Zechariah',
  Mal: 'Malachi',
  // 신약 27권
  Matt: 'Matthew',
  Mark: 'Mark',
  Luke: 'Luke',
  John: 'John',
  Acts: 'Acts',
  Rom: 'Romans',
  '1Cor': '1 Corinthians',
  '2Cor': '2 Corinthians',
  Gal: 'Galatians',
  Eph: 'Ephesians',
  Phil: 'Philippians',
  Col: 'Colossians',
  '1Thess': '1 Thessalonians',
  '2Thess': '2 Thessalonians',
  '1Tim': '1 Timothy',
  '2Tim': '2 Timothy',
  Titus: 'Titus',
  Phlm: 'Philemon',
  Heb: 'Hebrews',
  Jas: 'James',
  '1Pet': '1 Peter',
  '2Pet': '2 Peter',
  '1John': '1 John',
  '2John': '2 John',
  '3John': '3 John',
  Jude: 'Jude',
  Rev: 'Revelation',
}

// OSIS code 의 canonical order index
const BOOK_ORDER: Record<string, number> = Object.fromEntries(
  Object.keys(BOOK_MAP).map((code, i) => [code, i]),
)

interface VerseRecord {
  book: string
  chapter: number
  verse: number
  text: string
}

// verse 노드에서 순수 텍스트만 추출 (inline 자식 노드 제거)
function extractText(node: unknown): string {
  if (node === null || node === undefined) return ''
  if (typeof node === 'string') return node
  if (typeof node === 'number' || typeof node === 'boolean') return String(node)

  if (typeof node === 'object') {
    const obj = node as Record<string, unknown>
    // fast-xml-parser 의 textNodeName '#text' 에 해당하는 값 추출
    const textParts: string[] = []
    if ('#text' in obj && obj['#text'] !== undefined) {
      textParts.push(String(obj['#text']))
    }
    return textParts.join(' ').trim()
  }

  return String(node)
}

// OSIS osisID ("Gen.1.1") 파싱
function parseOsisID(
  osisID: string,
): { bookCode: string; chapter: number; verse: number } | null {
  const parts = osisID.split('.')
  if (parts.length !== 3) return null
  const [bookCode, chStr, vsStr] = parts
  const chapter = parseInt(chStr, 10)
  const verse = parseInt(vsStr, 10)
  if (isNaN(chapter) || isNaN(verse)) return null
  return { bookCode, chapter, verse }
}

async function main(): Promise<void> {
  // 1. Fetch
  console.log(`[fetch:bible] fetching from ${WEB_URL}...`)
  let xmlText: string
  try {
    const response = await fetch(WEB_URL)
    if (!response.ok) {
      console.error(
        `[fetch:bible] HTTP error: ${response.status} ${response.statusText}`,
      )
      process.exit(1)
    }
    xmlText = await response.text()
  } catch (err) {
    console.error(
      '[fetch:bible] fetch failed:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  }

  // 2. Parse XML
  let parsed: Record<string, unknown>
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      textNodeName: '#text',
      isArray: (_name: string) => false,
    })
    parsed = parser.parse(xmlText) as Record<string, unknown>
  } catch (err) {
    console.error(
      '[fetch:bible] XML parse failed:',
      err instanceof Error ? err.message : err,
    )
    process.exit(1)
  }

  // 3. verse 노드 수집 — OSIS 구조: osis.osisText.div[].chapter[].verse[]
  const verses: VerseRecord[] = []
  const booksFound = new Set<string>()

  function collectVerses(node: unknown): void {
    if (!node || typeof node !== 'object') return

    const obj = node as Record<string, unknown>

    // verse 노드 처리
    if ('osisID' in obj && typeof obj['osisID'] === 'string') {
      const parsed2 = parseOsisID(obj['osisID'])
      if (parsed2) {
        const { bookCode, chapter, verse } = parsed2
        if (bookCode in BOOK_MAP) {
          const bookName = BOOK_MAP[bookCode]
          const text = extractText(node).trim()
          booksFound.add(bookCode)
          verses.push({ book: bookName, chapter, verse, text })
        }
      }
      return
    }

    // 재귀 순회
    for (const key of Object.keys(obj)) {
      const child = obj[key]
      if (Array.isArray(child)) {
        for (const item of child) {
          collectVerses(item)
        }
      } else if (child && typeof child === 'object') {
        collectVerses(child)
      }
    }
  }

  collectVerses(parsed)

  console.log(
    `[fetch:bible] parsed ${verses.length} verses across ${booksFound.size} books`,
  )

  // 4. 정렬 (canonical order → chapter asc → verse asc)
  verses.sort((a, b) => {
    const bookA = Object.keys(BOOK_MAP).find((k) => BOOK_MAP[k] === a.book) ?? ''
    const bookB = Object.keys(BOOK_MAP).find((k) => BOOK_MAP[k] === b.book) ?? ''
    const orderDiff = (BOOK_ORDER[bookA] ?? 999) - (BOOK_ORDER[bookB] ?? 999)
    if (orderDiff !== 0) return orderDiff
    if (a.chapter !== b.chapter) return a.chapter - b.chapter
    return a.verse - b.verse
  })

  // 5. 검증
  const uniqueBooks = new Set(verses.map((v) => {
    return Object.keys(BOOK_MAP).find((k) => BOOK_MAP[k] === v.book) ?? ''
  }))
  const emptyCount = verses.filter((v) => !v.text).length

  if (uniqueBooks.size !== 66) {
    console.error(
      `[fetch:bible] FAIL: expected 66 books, got ${uniqueBooks.size}`,
    )
    process.exit(1)
  }

  if (emptyCount > 0) {
    console.error(
      `[fetch:bible] FAIL: ${emptyCount} verse(s) have empty/null text`,
    )
    process.exit(1)
  }

  // 6. JSON 출력
  const outDir = path.resolve(process.cwd(), 'data')
  const outPath = path.join(outDir, 'web-bible.json')
  const jsonStr = JSON.stringify(verses, null, 2)
  const byteSize = Buffer.byteLength(jsonStr, 'utf8')

  console.log(`[fetch:bible] writing data/web-bible.json (${byteSize} bytes)`)

  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(outPath, jsonStr, 'utf8')

  console.log(`[fetch:bible] books: ${uniqueBooks.size}`)
  console.log(`[fetch:bible] verses: ${verses.length}`)
  console.log(`[fetch:bible] empty/null text: ${emptyCount}`)
  console.log('[fetch:bible] done.')
}

main().catch((err: unknown) => {
  console.error('[fetch:bible] unexpected error:', err)
  process.exit(1)
})
