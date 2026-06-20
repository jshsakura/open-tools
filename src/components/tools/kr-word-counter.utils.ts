// UTF-8 encodes Korean (and most non-ASCII BMP) characters in 3 bytes.
export const UTF8_MULTIBYTE = 3
// EUC-KR (legacy) encodes Korean characters in 2 bytes.
export const EUCKR_MULTIBYTE = 2

const ASCII_MAX = 127

/**
 * Returns the array of Unicode code points in the text.
 * Using Array.from ensures astral-plane characters (e.g. emoji) count once.
 */
export function toCodePoints(text: string): string[] {
  return Array.from(text)
}

/** Character count including whitespace, by code point. */
export function countCharsWithSpaces(text: string): number {
  return toCodePoints(text).length
}

/** Character count excluding whitespace, by code point. */
export function countCharsNoSpaces(text: string): number {
  return toCodePoints(text).filter((c) => !/\s/.test(c)).length
}

/** Word count: whitespace-delimited tokens of the trimmed text. */
export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

/** Line count: splits on CRLF / CR / LF. Empty string yields 0 lines. */
export function countLines(text: string): number {
  return text ? text.split(/\r\n|\r|\n/).length : 0
}

/**
 * Byte length of the text under a multibyte rule.
 *
 * @param multibyteBytes bytes per non-ASCII code point
 *   (UTF8_MULTIBYTE = 3 for UTF-8, EUCKR_MULTIBYTE = 2 for EUC-KR legacy).
 *   ASCII code points (<= 127) always count as 1 byte.
 */
export function countBytes(text: string, multibyteBytes: number): number {
  let bytes = 0
  for (const ch of toCodePoints(text)) {
    const code = ch.codePointAt(0) ?? 0
    bytes += code <= ASCII_MAX ? 1 : multibyteBytes
  }
  return bytes
}

export interface KrWordCounterStats {
  charsWithSpaces: number
  charsNoSpaces: number
  words: number
  lines: number
  utf8Bytes: number
  euckrBytes: number
}

/** Aggregate all counters for a piece of text. */
export function getKrWordCounterStats(text: string): KrWordCounterStats {
  return {
    charsWithSpaces: countCharsWithSpaces(text),
    charsNoSpaces: countCharsNoSpaces(text),
    words: countWords(text),
    lines: countLines(text),
    utf8Bytes: countBytes(text, UTF8_MULTIBYTE),
    euckrBytes: countBytes(text, EUCKR_MULTIBYTE),
  }
}
