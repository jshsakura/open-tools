import { describe, expect, it } from "vitest"

import {
  countSentences,
  countWords,
  getWordCounterStats,
} from "./word-counter.utils"

class MockSegmenter {
  constructor(_locale?: string | string[], _options?: Intl.SegmenterOptions) {}

  segment(_input: string): Iterable<Intl.SegmentData> {
    return [
      { segment: "Hello", index: 0, input: "", isWordLike: true },
      { segment: " ", index: 5, input: "", isWordLike: false },
      { segment: "세계", index: 6, input: "", isWordLike: true },
      { segment: " ", index: 8, input: "", isWordLike: false },
      { segment: "你好", index: 9, input: "", isWordLike: true },
      { segment: "，", index: 11, input: "", isWordLike: false },
      { segment: "世界", index: 12, input: "", isWordLike: true },
    ]
  }
}

describe("word-counter utils", () => {
  it("counts multilingual words via Segmenter using word-like segments", () => {
    expect(countWords("Hello 세계 你好，世界", MockSegmenter as unknown as typeof Intl.Segmenter)).toBe(4)
  })

  it("counts sentences with CJK punctuation delimiters", () => {
    expect(countSentences("안녕。你好！테스트？Final.")).toBe(4)
  })

  it("never displays 0s for very short non-empty text", () => {
    const stats = getWordCounterStats("a")
    expect(stats.words).toBe(1)
    expect(stats.readingTime).toBe("1s")
    expect(stats.speakingTime).toBe("1s")
  })

  it("falls back to whitespace split when Segmenter is unavailable", () => {
    expect(countWords("alpha beta", undefined)).toBe(2)
  })
})
