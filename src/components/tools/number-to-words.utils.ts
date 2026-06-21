// Pure conversion helpers for the Number to Words tool.
// All functions are side-effect free and return new strings.

export interface EnglishOptions {
  ordinal?: boolean
  currency?: boolean
}

const ONES = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
  "thirteen",
  "fourteen",
  "fifteen",
  "sixteen",
  "seventeen",
  "eighteen",
  "nineteen",
]

const TENS = [
  "",
  "",
  "twenty",
  "thirty",
  "forty",
  "fifty",
  "sixty",
  "seventy",
  "eighty",
  "ninety",
]

// Index 0 unused; scale words for groups of three digits.
const SCALES = ["", "thousand", "million", "billion", "trillion", "quadrillion"]

// Irregular ordinal word forms (cardinal -> ordinal).
const ORDINAL_WORDS: Record<string, string> = {
  one: "first",
  two: "second",
  three: "third",
  five: "fifth",
  eight: "eighth",
  nine: "ninth",
  twelve: "twelfth",
}

/** Convert a 0-999 chunk to words. Returns "" for 0. */
function threeDigitsToWords(n: number): string {
  if (n === 0) return ""
  const parts: string[] = []
  const hundreds = Math.floor(n / 100)
  const rest = n % 100

  if (hundreds > 0) {
    parts.push(`${ONES[hundreds]} hundred`)
  }

  if (rest > 0) {
    if (rest < 20) {
      parts.push(ONES[rest])
    } else {
      const tens = Math.floor(rest / 10)
      const ones = rest % 10
      parts.push(ones > 0 ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens])
    }
  }

  return parts.join(" ")
}

/** Convert a non-negative integer to English cardinal words. */
function integerToEnglishWords(value: number): string {
  if (value === 0) return "zero"

  const groups: number[] = []
  let remaining = value
  while (remaining > 0) {
    groups.push(remaining % 1000)
    remaining = Math.floor(remaining / 1000)
  }

  const parts: string[] = []
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i] === 0) continue
    const chunk = threeDigitsToWords(groups[i])
    const scale = SCALES[i]
    parts.push(scale ? `${chunk} ${scale}` : chunk)
  }

  return parts.join(" ")
}

/** Convert the last cardinal word of a phrase into its ordinal form. */
function toOrdinalPhrase(words: string): string {
  const tokens = words.split(" ")
  const lastIndex = tokens.length - 1
  const last = tokens[lastIndex]

  // Hyphenated word like "thirty-four" -> "thirty-fourth".
  if (last.includes("-")) {
    const [head, tail] = last.split("-")
    tokens[lastIndex] = `${head}-${ordinalizeWord(tail)}`
    return tokens.join(" ")
  }

  tokens[lastIndex] = ordinalizeWord(last)
  return tokens.join(" ")
}

function ordinalizeWord(word: string): string {
  if (ORDINAL_WORDS[word]) return ORDINAL_WORDS[word]
  if (word.endsWith("y")) return `${word.slice(0, -1)}ieth` // twenty -> twentieth
  return `${word}th`
}

/**
 * Convert a number to English words.
 * Supports negatives, decimals (digits read individually), an ordinal toggle,
 * and a USD currency mode ("... dollars and ... cents").
 */
export function toEnglishWords(value: number, opts: EnglishOptions = {}): string {
  if (!Number.isFinite(value)) return ""

  const negative = value < 0
  const abs = Math.abs(value)

  if (opts.currency) {
    // Round to two decimal places for cents.
    const cents = Math.round(abs * 100)
    const dollars = Math.floor(cents / 100)
    const centPart = cents % 100
    const dollarWords = integerToEnglishWords(dollars)
    const dollarLabel = dollars === 1 ? "dollar" : "dollars"
    let result = `${dollarWords} ${dollarLabel}`
    if (centPart > 0) {
      const centWords = integerToEnglishWords(centPart)
      const centLabel = centPart === 1 ? "cent" : "cents"
      result += ` and ${centWords} ${centLabel}`
    }
    return negative ? `negative ${result}` : result
  }

  const intPart = Math.floor(abs)
  const intWords = integerToEnglishWords(intPart)

  // Decimal handling: read each digit after the point individually.
  const str = String(abs)
  const dotIndex = str.indexOf(".")
  let result: string

  if (dotIndex !== -1) {
    const decimals = str.slice(dotIndex + 1)
    const digitWords = decimals
      .split("")
      .map((d) => ONES[Number(d)])
      .join(" ")
    result = `${intWords} point ${digitWords}`
  } else {
    result = opts.ordinal ? toOrdinalPhrase(intWords) : intWords
  }

  return negative ? `negative ${result}` : result
}

// ----- Korean -----

const KO_DIGITS = ["", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구"]
// Positional units within a 4-digit group.
const KO_SMALL_UNITS = ["", "십", "백", "천"]
// Big units for each 4-digit group: 10^0, 10^4, 10^8, 10^12, 10^16.
const KO_BIG_UNITS = ["", "만", "억", "조", "경"]

/** Convert a 0-9999 group to Korean (e.g. 1234 -> 천이백삼십사). */
function koGroupToWords(group: number): string {
  if (group === 0) return ""
  let result = ""
  const digits = String(group).padStart(4, "0").split("").map(Number)
  // digits[0] = 천 position, [1] = 백, [2] = 십, [3] = 일
  for (let i = 0; i < 4; i += 1) {
    const digit = digits[i]
    if (digit === 0) continue
    const unitIndex = 3 - i // 3 for thousands ... 0 for ones
    // For 십/백/천 positions a leading 1 is implicit (e.g. 10 -> 십, not 일십).
    const digitWord = digit === 1 && unitIndex > 0 ? "" : KO_DIGITS[digit]
    result += digitWord + KO_SMALL_UNITS[unitIndex]
  }
  return result
}

/**
 * Convert a non-negative integer to Korean number words with 만/억/조 grouping.
 * Example: 12000000 -> 천이백만, 100000000 -> 억.
 */
export function toKoreanWords(value: number): string {
  if (!Number.isFinite(value)) return ""
  const negative = value < 0
  const intValue = Math.floor(Math.abs(value))
  if (intValue === 0) return "영"

  const groups: number[] = []
  let remaining = intValue
  while (remaining > 0) {
    groups.push(remaining % 10000)
    remaining = Math.floor(remaining / 10000)
  }

  let result = ""
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i] === 0) continue
    let chunk = koGroupToWords(groups[i])
    // A standalone leading 1 before a big unit is dropped (만/억/조),
    // e.g. 10000 -> 만 (not 일만), 100000000 -> 억.
    if (groups[i] === 1 && i > 0) chunk = ""
    result += chunk + KO_BIG_UNITS[i]
  }

  return negative ? `마이너스 ${result}` : result
}

/**
 * Formal Korean amount used on invoices/checks.
 * Example: 1234 -> "일금 일천이백삼십사원정".
 * Unlike toKoreanWords, leading 1 before 천/백/십 is kept explicit (일천, 일백, 일십).
 */
function koGroupToFormalWords(group: number): string {
  if (group === 0) return ""
  let result = ""
  const digits = String(group).padStart(4, "0").split("").map(Number)
  for (let i = 0; i < 4; i += 1) {
    const digit = digits[i]
    if (digit === 0) continue
    const unitIndex = 3 - i
    result += KO_DIGITS[digit] + KO_SMALL_UNITS[unitIndex]
  }
  return result
}

export function toKoreanFormalAmount(value: number): string {
  if (!Number.isFinite(value)) return ""
  const intValue = Math.floor(Math.abs(value))
  if (intValue === 0) return "일금 영원정"

  const groups: number[] = []
  let remaining = intValue
  while (remaining > 0) {
    groups.push(remaining % 10000)
    remaining = Math.floor(remaining / 10000)
  }

  let body = ""
  for (let i = groups.length - 1; i >= 0; i -= 1) {
    if (groups[i] === 0) continue
    body += koGroupToFormalWords(groups[i]) + KO_BIG_UNITS[i]
  }

  const prefix = value < 0 ? "일금 마이너스 " : "일금 "
  return `${prefix}${body}원정`
}
