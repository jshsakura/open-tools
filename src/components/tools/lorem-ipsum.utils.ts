const WORD_POOL = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
] as const

const LOREM_PREFIX = "Lorem ipsum dolor sit amet"

export type LoremUnit = "paragraphs" | "sentences" | "words"

export interface LoremOptions {
  unit: LoremUnit
  count: number
  startWithLorem: boolean
}

const MIN_SENTENCE_WORDS = 6
const MAX_SENTENCE_WORDS = 16
const MIN_PARAGRAPH_SENTENCES = 3
const MAX_PARAGRAPH_SENTENCES = 7

// Deterministic pseudo-random based on an incrementing seed so output is stable
// across renders for a given seed and avoids Math.random hydration mismatches.
function createRng(seed: number) {
  let state = seed % 2147483647
  if (state <= 0) state += 2147483646
  return () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1)
}

function buildSentence(rng: () => number): string {
  const length =
    MIN_SENTENCE_WORDS +
    Math.floor(rng() * (MAX_SENTENCE_WORDS - MIN_SENTENCE_WORDS + 1))
  const words = Array.from({ length }, () => pick(rng, WORD_POOL))
  const sentence = words.join(" ")
  return `${capitalize(sentence)}.`
}

function buildParagraph(rng: () => number): string {
  const length =
    MIN_PARAGRAPH_SENTENCES +
    Math.floor(rng() * (MAX_PARAGRAPH_SENTENCES - MIN_PARAGRAPH_SENTENCES + 1))
  return Array.from({ length }, () => buildSentence(rng)).join(" ")
}

function applyPrefix(text: string): string {
  return `${LOREM_PREFIX}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
}

export function generateLorem(options: LoremOptions, seed: number): string {
  const { unit, count, startWithLorem } = options
  const safeCount = Math.max(1, Math.floor(count))
  const rng = createRng(seed)

  if (unit === "words") {
    const words = Array.from({ length: safeCount }, () => pick(rng, WORD_POOL))
    const text = `${capitalize(words.join(" "))}.`
    return startWithLorem ? applyPrefix(text) : text
  }

  if (unit === "sentences") {
    const sentences = Array.from({ length: safeCount }, () => buildSentence(rng))
    if (startWithLorem) sentences[0] = applyPrefix(sentences[0])
    return sentences.join(" ")
  }

  const paragraphs = Array.from({ length: safeCount }, () => buildParagraph(rng))
  if (startWithLorem) paragraphs[0] = applyPrefix(paragraphs[0])
  return paragraphs.join("\n\n")
}
