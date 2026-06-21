import { describe, expect, it } from "vitest"

import { codeToText, textToCode } from "./binary-text-converter.utils"

describe("textToCode", () => {
  it('encodes "A" to binary', () => {
    expect(textToCode("A", "binary", "space")).toBe("01000001")
  })

  it('encodes "A" to hex', () => {
    expect(textToCode("A", "hex", "space")).toBe("41")
  })

  it('encodes "A" to decimal', () => {
    expect(textToCode("A", "decimal", "space")).toBe("65")
  })

  it('encodes "A" to octal', () => {
    expect(textToCode("A", "octal", "space")).toBe("101")
  })

  it("encodes multiple characters space-separated", () => {
    expect(textToCode("AB", "hex", "space")).toBe("41 42")
  })

  it("uses comma separator", () => {
    expect(textToCode("AB", "decimal", "comma")).toBe("65,66")
  })

  it("uses no separator with fixed-width padding (binary)", () => {
    expect(textToCode("AB", "binary", "none")).toBe("0100000101000010")
  })

  it("uses no separator with fixed-width padding (hex)", () => {
    expect(textToCode("AB", "hex", "none")).toBe("4142")
  })

  it("returns empty string for empty input", () => {
    expect(textToCode("", "binary", "space")).toBe("")
  })

  it("encodes UTF-8 multibyte (Korean) as multiple bytes", () => {
    // "한" -> UTF-8 bytes 0xED 0x95 0x9C
    expect(textToCode("한", "hex", "space")).toBe("ed 95 9c")
  })

  it("encodes emoji (4-byte) correctly", () => {
    // "😀" U+1F600 -> F0 9F 98 80
    expect(textToCode("😀", "hex", "space")).toBe("f0 9f 98 80")
  })

  it("throws on unsupported base", () => {
    expect(() => textToCode("A", "base64", "space")).toThrow()
  })

  it("throws on unsupported separator", () => {
    expect(() => textToCode("A", "binary", "tab")).toThrow()
  })
})

describe("codeToText", () => {
  it('decodes binary "01000001" to "A"', () => {
    expect(codeToText("01000001", "binary", "space")).toBe("A")
  })

  it('decodes hex "41" to "A"', () => {
    expect(codeToText("41", "hex", "space")).toBe("A")
  })

  it('decodes decimal "65" to "A"', () => {
    expect(codeToText("65", "decimal", "space")).toBe("A")
  })

  it('decodes octal "101" to "A"', () => {
    expect(codeToText("101", "octal", "space")).toBe("A")
  })

  it("decodes comma-separated input", () => {
    expect(codeToText("65,66", "decimal", "comma")).toBe("AB")
  })

  it("decodes no-separator fixed-width input", () => {
    expect(codeToText("0100000101000010", "binary", "none")).toBe("AB")
  })

  it("tolerates extra whitespace", () => {
    expect(codeToText("  41   42  ", "hex", "space")).toBe("AB")
  })

  it("returns empty string for empty input", () => {
    expect(codeToText("", "hex", "space")).toBe("")
    expect(codeToText("   ", "hex", "space")).toBe("")
  })

  it("throws on invalid token characters", () => {
    expect(() => codeToText("zz", "hex", "space")).toThrow()
  })

  it("throws on token out of byte range", () => {
    expect(() => codeToText("999", "decimal", "space")).toThrow()
  })

  it("throws on invalid digit for octal base", () => {
    expect(() => codeToText("9", "octal", "space")).toThrow()
  })

  it("throws when no-separator length is not a multiple of byte width", () => {
    expect(() => codeToText("0100001", "binary", "none")).toThrow()
  })

  it("throws on bytes that are not valid UTF-8", () => {
    // 0xFF is never a valid standalone UTF-8 byte.
    expect(() => codeToText("ff", "hex", "space")).toThrow()
  })
})

describe("round trips", () => {
  const samples = ["A", "Hello, World!", "한글 테스트", "😀🎉", "abc123 XYZ"]
  const bases = ["binary", "hex", "decimal", "octal"] as const
  const seps = ["space", "none", "comma"] as const

  for (const text of samples) {
    for (const base of bases) {
      for (const sep of seps) {
        it(`round-trips "${text}" via ${base}/${sep}`, () => {
          const encoded = textToCode(text, base, sep)
          expect(codeToText(encoded, base, sep)).toBe(text)
        })
      }
    }
  }
})
