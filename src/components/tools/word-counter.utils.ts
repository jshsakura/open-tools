export type SegmenterCtor = typeof Intl.Segmenter

export function countWords(
  text: string,
  Segmenter: SegmenterCtor | undefined = globalThis.Intl?.Segmenter,
): number {
  const trimmed = text.trim()
  if (trimmed === "") return 0

  const fallbackWordCount = trimmed.split(/\s+/).filter(Boolean).length

  if (Segmenter) {
    try {
      const segmenter = new Segmenter(undefined, { granularity: "word" })
      const segments = segmenter.segment(trimmed)
      let wordCount = 0
      for (const segment of segments) {
        if (segment.isWordLike) {
          wordCount++
        }
      }
      return wordCount
    } catch {
      return fallbackWordCount
    }
  }

  return fallbackWordCount
}

export function countSentences(text: string): number {
  if (!text.trim()) return 0

  return text.split(/[.!?。！？]+/).filter((s) => s.trim().length > 0).length
}

export function formatTime(minutes: number): string {
  if (minutes < 1 / 60) {
    return "1s"
  }
  if (minutes < 1) {
    const seconds = Math.round(minutes * 60)
    return `${seconds}s`
  }
  const m = Math.floor(minutes)
  const s = Math.round((minutes - m) * 60)
  if (s === 0) return `${m}m`
  return `${m}m ${s}s`
}

export function getWordCounterStats(text: string) {
  const charsWithSpaces = text.length
  const charsNoSpaces = text.replace(/\s/g, "").length
  const words = countWords(text)
  const sentences = countSentences(text)
  const paragraphs =
    text.trim() === ""
      ? 0
      : text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length
  const lines = text === "" ? 0 : text.split("\n").length
  const readingMinutes = words / 200
  const speakingMinutes = words / 130

  return {
    charsWithSpaces,
    charsNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTime: words === 0 ? "—" : formatTime(readingMinutes),
    speakingTime: words === 0 ? "—" : formatTime(speakingMinutes),
  }
}
