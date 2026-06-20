import { describe, expect, it } from "vitest"

import {
  countBytes,
  countCharsNoSpaces,
  countCharsWithSpaces,
  countLines,
  countWords,
  EUCKR_MULTIBYTE,
  getKrWordCounterStats,
  toCodePoints,
  UTF8_MULTIBYTE,
} from "./kr-word-counter.utils"

const utf8 = (text: string) => countBytes(text, UTF8_MULTIBYTE)
const euckr = (text: string) => countBytes(text, EUCKR_MULTIBYTE)

describe("toCodePoints", () => {
  it("counts an emoji (astral-plane character) as a single code point", () => {
    expect(toCodePoints("😀")).toEqual(["😀"])
  })

  it("splits Korean syllables into individual code points", () => {
    expect(toCodePoints("가나다")).toHaveLength(3)
  })
})

describe("countCharsWithSpaces", () => {
  it("returns 0 for an empty string", () => {
    expect(countCharsWithSpaces("")).toBe(0)
  })

  it("counts ASCII characters including spaces", () => {
    expect(countCharsWithSpaces("ab c")).toBe(4)
  })

  it("counts an emoji once", () => {
    expect(countCharsWithSpaces("a😀b")).toBe(3)
  })
})

describe("countCharsNoSpaces", () => {
  it("returns 0 for whitespace-only input", () => {
    expect(countCharsNoSpaces("   \t\n ")).toBe(0)
  })

  it("excludes spaces, tabs and newlines", () => {
    expect(countCharsNoSpaces("a b\tc\nd")).toBe(4)
  })

  it("counts Korean characters", () => {
    expect(countCharsNoSpaces("가 나 다")).toBe(3)
  })
})

describe("countWords", () => {
  it("returns 0 for an empty string", () => {
    expect(countWords("")).toBe(0)
  })

  it("returns 0 for whitespace-only input", () => {
    expect(countWords("    \n\t")).toBe(0)
  })

  it("counts whitespace-delimited words", () => {
    expect(countWords("hello world foo")).toBe(3)
  })

  it("collapses repeated whitespace between words", () => {
    expect(countWords("  hello    world  ")).toBe(2)
  })

  it("counts Korean tokens separated by spaces", () => {
    expect(countWords("안녕 하세요 세계")).toBe(3)
  })
})

describe("countLines", () => {
  it("returns 0 for an empty string", () => {
    expect(countLines("")).toBe(0)
  })

  it("returns 1 for a single line with no newline", () => {
    expect(countLines("single line")).toBe(1)
  })

  it("counts LF-separated lines", () => {
    expect(countLines("a\nb\nc")).toBe(3)
  })

  it("counts CRLF-separated lines", () => {
    expect(countLines("a\r\nb")).toBe(2)
  })

  it("counts CR-separated lines", () => {
    expect(countLines("a\rb\rc")).toBe(3)
  })

  it("counts a trailing newline as an extra (empty) line", () => {
    expect(countLines("a\n")).toBe(2)
  })
})

describe("countBytes (UTF-8)", () => {
  it("returns 0 for an empty string", () => {
    expect(utf8("")).toBe(0)
  })

  it("counts pure ASCII as 1 byte each", () => {
    expect(utf8("hello")).toBe(5)
  })

  it("counts each Korean character as 3 bytes", () => {
    expect(utf8("가나다")).toBe(9)
  })

  it("counts an emoji as 3 bytes (single code point, non-ASCII)", () => {
    expect(utf8("😀")).toBe(3)
  })

  it("counts a mixed ASCII + Korean string correctly", () => {
    // "a" = 1, "가" = 3, "b" = 1
    expect(utf8("a가b")).toBe(5)
  })
})

describe("countBytes (EUC-KR legacy)", () => {
  it("returns 0 for an empty string", () => {
    expect(euckr("")).toBe(0)
  })

  it("counts pure ASCII as 1 byte each", () => {
    expect(euckr("hello")).toBe(5)
  })

  it("counts each Korean character as 2 bytes", () => {
    expect(euckr("가나다")).toBe(6)
  })

  it("counts an emoji as 2 bytes under the legacy rule", () => {
    expect(euckr("😀")).toBe(2)
  })

  it("counts a mixed ASCII + Korean string correctly", () => {
    // "a" = 1, "가" = 2, "b" = 1
    expect(euckr("a가b")).toBe(4)
  })
})

describe("getKrWordCounterStats", () => {
  it("returns all zero counters for an empty string", () => {
    expect(getKrWordCounterStats("")).toEqual({
      charsWithSpaces: 0,
      charsNoSpaces: 0,
      words: 0,
      lines: 0,
      utf8Bytes: 0,
      euckrBytes: 0,
    })
  })

  it("aggregates a mixed multi-line Korean/ASCII/emoji document", () => {
    // line 1: "안녕 세계" -> 5 code points (안 녕 space 세 계), 4 non-space
    // line 2: "hi 😀"     -> 4 code points (h i space 😀),    3 non-space
    const text = "안녕 세계\nhi 😀"
    const stats = getKrWordCounterStats(text)

    expect(stats.charsWithSpaces).toBe(10) // 5 + newline + 4
    expect(stats.charsNoSpaces).toBe(7) // excludes 2 spaces + 1 newline
    expect(stats.words).toBe(4) // 안녕, 세계, hi, 😀
    expect(stats.lines).toBe(2)
    // UTF-8: 안(3)녕(3) space(1) 세(3)계(3) newline(1) h(1)i(1) space(1) 😀(3)
    expect(stats.utf8Bytes).toBe(3 + 3 + 1 + 3 + 3 + 1 + 1 + 1 + 1 + 3)
    // EUC-KR: koreans/emoji => 2 each
    expect(stats.euckrBytes).toBe(2 + 2 + 1 + 2 + 2 + 1 + 1 + 1 + 1 + 2)
  })
})
