import { describe, expect, it } from "vitest"

import { ROMAN_MAX, ROMAN_MIN, fromRoman, toRoman } from "./roman-numeral-converter.utils"

describe("toRoman", () => {
  it("converts known values", () => {
    expect(toRoman(1)).toBe("I")
    expect(toRoman(4)).toBe("IV")
    expect(toRoman(9)).toBe("IX")
    expect(toRoman(40)).toBe("XL")
    expect(toRoman(90)).toBe("XC")
    expect(toRoman(400)).toBe("CD")
    expect(toRoman(900)).toBe("CM")
    expect(toRoman(2024)).toBe("MMXXIV")
    expect(toRoman(3999)).toBe("MMMCMXCIX")
  })

  it("rejects out-of-range and non-integer input", () => {
    expect(toRoman(0)).toBeNull()
    expect(toRoman(ROMAN_MAX + 1)).toBeNull()
    expect(toRoman(-5)).toBeNull()
    expect(toRoman(3.5)).toBeNull()
  })
})

describe("fromRoman", () => {
  it("parses subtractive forms", () => {
    expect(fromRoman("IV")).toBe(4)
    expect(fromRoman("IX")).toBe(9)
    expect(fromRoman("XL")).toBe(40)
    expect(fromRoman("XC")).toBe(90)
    expect(fromRoman("CD")).toBe(400)
    expect(fromRoman("CM")).toBe(900)
  })

  it("is case-insensitive and trims whitespace", () => {
    expect(fromRoman(" mmxxiv ")).toBe(2024)
  })

  it("rejects invalid numerals", () => {
    expect(fromRoman("IIII")).toBeNull()
    expect(fromRoman("VV")).toBeNull()
    expect(fromRoman("ABC")).toBeNull()
    expect(fromRoman("")).toBeNull()
    expect(fromRoman("IC")).toBeNull()
  })
})

describe("round trip 1..3999", () => {
  it("toRoman then fromRoman recovers every value", () => {
    for (let n = ROMAN_MIN; n <= ROMAN_MAX; n += 1) {
      const roman = toRoman(n)
      expect(roman).not.toBeNull()
      expect(fromRoman(roman as string)).toBe(n)
    }
  })
})
