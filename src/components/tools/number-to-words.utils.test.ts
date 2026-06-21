import { describe, expect, it } from "vitest"
import {
  toEnglishWords,
  toKoreanFormalAmount,
  toKoreanWords,
} from "./number-to-words.utils"

describe("toEnglishWords", () => {
  it("converts zero", () => {
    expect(toEnglishWords(0)).toBe("zero")
  })

  it("converts single digits", () => {
    expect(toEnglishWords(1)).toBe("one")
    expect(toEnglishWords(9)).toBe("nine")
  })

  it("converts teens", () => {
    expect(toEnglishWords(13)).toBe("thirteen")
    expect(toEnglishWords(19)).toBe("nineteen")
  })

  it("converts tens with hyphenation", () => {
    expect(toEnglishWords(20)).toBe("twenty")
    expect(toEnglishWords(34)).toBe("thirty-four")
    expect(toEnglishWords(99)).toBe("ninety-nine")
  })

  it("converts hundreds", () => {
    expect(toEnglishWords(100)).toBe("one hundred")
    expect(toEnglishWords(305)).toBe("three hundred five")
    expect(toEnglishWords(999)).toBe("nine hundred ninety-nine")
  })

  it("converts thousands", () => {
    expect(toEnglishWords(1000)).toBe("one thousand")
    expect(toEnglishWords(1234)).toBe(
      "one thousand two hundred thirty-four",
    )
    expect(toEnglishWords(10000)).toBe("ten thousand")
  })

  it("converts millions, billions, trillions", () => {
    expect(toEnglishWords(1000000)).toBe("one million")
    expect(toEnglishWords(2500000)).toBe(
      "two million five hundred thousand",
    )
    expect(toEnglishWords(1000000000)).toBe("one billion")
    expect(toEnglishWords(1000000000000)).toBe("one trillion")
  })

  it("converts negatives", () => {
    expect(toEnglishWords(-5)).toBe("negative five")
    expect(toEnglishWords(-1234)).toBe(
      "negative one thousand two hundred thirty-four",
    )
  })

  it("reads decimals digit by digit", () => {
    expect(toEnglishWords(3.14)).toBe("three point one four")
    expect(toEnglishWords(0.5)).toBe("zero point five")
    expect(toEnglishWords(12.05)).toBe("twelve point zero five")
  })

  it("produces ordinals", () => {
    expect(toEnglishWords(1, { ordinal: true })).toBe("first")
    expect(toEnglishWords(2, { ordinal: true })).toBe("second")
    expect(toEnglishWords(3, { ordinal: true })).toBe("third")
    expect(toEnglishWords(5, { ordinal: true })).toBe("fifth")
    expect(toEnglishWords(8, { ordinal: true })).toBe("eighth")
    expect(toEnglishWords(9, { ordinal: true })).toBe("ninth")
    expect(toEnglishWords(12, { ordinal: true })).toBe("twelfth")
    expect(toEnglishWords(20, { ordinal: true })).toBe("twentieth")
    expect(toEnglishWords(21, { ordinal: true })).toBe("twenty-first")
    expect(toEnglishWords(34, { ordinal: true })).toBe("thirty-fourth")
    expect(toEnglishWords(100, { ordinal: true })).toBe("one hundredth")
  })

  it("formats USD currency", () => {
    expect(toEnglishWords(1, { currency: true })).toBe("one dollar")
    expect(toEnglishWords(2, { currency: true })).toBe("two dollars")
    expect(toEnglishWords(1234.56, { currency: true })).toBe(
      "one thousand two hundred thirty-four dollars and fifty-six cents",
    )
    expect(toEnglishWords(0.99, { currency: true })).toBe(
      "zero dollars and ninety-nine cents",
    )
    expect(toEnglishWords(5.01, { currency: true })).toBe(
      "five dollars and one cent",
    )
    expect(toEnglishWords(-3.5, { currency: true })).toBe(
      "negative three dollars and fifty cents",
    )
  })
})

describe("toKoreanWords", () => {
  it("converts zero", () => {
    expect(toKoreanWords(0)).toBe("영")
  })

  it("converts within a single group", () => {
    expect(toKoreanWords(1)).toBe("일")
    expect(toKoreanWords(10)).toBe("십")
    expect(toKoreanWords(11)).toBe("십일")
    expect(toKoreanWords(100)).toBe("백")
    expect(toKoreanWords(1234)).toBe("천이백삼십사")
  })

  it("handles 만 boundary", () => {
    expect(toKoreanWords(10000)).toBe("만")
    expect(toKoreanWords(10001)).toBe("만일")
    expect(toKoreanWords(12345)).toBe("만이천삼백사십오")
  })

  it("handles 천이백만 grouping", () => {
    expect(toKoreanWords(12000000)).toBe("천이백만")
  })

  it("handles 억 boundary", () => {
    expect(toKoreanWords(100000000)).toBe("억")
    expect(toKoreanWords(123456789)).toBe("억이천삼백사십오만육천칠백팔십구")
    expect(toKoreanWords(223456789)).toBe("이억이천삼백사십오만육천칠백팔십구")
  })

  it("handles 조 boundary", () => {
    expect(toKoreanWords(1000000000000)).toBe("조")
  })

  it("handles negatives", () => {
    expect(toKoreanWords(-1234)).toBe("마이너스 천이백삼십사")
  })
})

describe("toKoreanFormalAmount", () => {
  it("converts zero", () => {
    expect(toKoreanFormalAmount(0)).toBe("일금 영원정")
  })

  it("uses explicit leading ones (일천/일백/일십)", () => {
    expect(toKoreanFormalAmount(1234)).toBe("일금 일천이백삼십사원정")
    expect(toKoreanFormalAmount(10)).toBe("일금 일십원정")
    expect(toKoreanFormalAmount(100)).toBe("일금 일백원정")
  })

  it("handles 만/억 grouping", () => {
    expect(toKoreanFormalAmount(12000000)).toBe("일금 일천이백만원정")
    expect(toKoreanFormalAmount(100000000)).toBe("일금 일억원정")
  })

  it("handles negatives", () => {
    expect(toKoreanFormalAmount(-1234)).toBe("일금 마이너스 일천이백삼십사원정")
  })
})
