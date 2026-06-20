import { describe, expect, it } from "vitest"

import {
  computeSimilarityMetrics,
  diceCoefficient,
  jaccardSimilarity,
  levenshteinDistance,
  levenshteinRatio,
  tokenize,
} from "./text-similarity.utils"

describe("levenshteinDistance", () => {
  it("returns 0 for identical strings", () => {
    expect(levenshteinDistance("kitten", "kitten")).toBe(0)
  })

  it("computes the known distance between kitten and sitting", () => {
    expect(levenshteinDistance("kitten", "sitting")).toBe(3)
  })

  it("returns length of the other string when one is empty", () => {
    expect(levenshteinDistance("", "abc")).toBe(3)
    expect(levenshteinDistance("abc", "")).toBe(3)
  })
})

describe("levenshteinRatio", () => {
  it("is 100 for identical strings", () => {
    expect(levenshteinRatio("hello world", "hello world")).toBe(100)
  })

  it("is 100 when both strings are empty", () => {
    expect(levenshteinRatio("", "")).toBe(100)
  })

  it("is 0 when exactly one string is empty", () => {
    expect(levenshteinRatio("hello", "")).toBe(0)
  })

  it("is low for totally different strings", () => {
    expect(levenshteinRatio("abcdef", "uvwxyz")).toBeLessThan(20)
  })

  it("matches a known ratio for kitten/sitting", () => {
    // 3 edits over length 7 -> (7-3)/7 = 0.5714...
    expect(levenshteinRatio("kitten", "sitting")).toBeCloseTo((4 / 7) * 100, 5)
  })
})

describe("tokenize", () => {
  it("lowercases, splits on whitespace and strips edge punctuation", () => {
    expect([...tokenize("Hello, WORLD! foo")]).toEqual(["hello", "world", "foo"])
  })

  it("deduplicates tokens", () => {
    expect(tokenize("the the the").size).toBe(1)
  })
})

describe("jaccardSimilarity", () => {
  it("is 100 for identical token sets regardless of order", () => {
    expect(jaccardSimilarity("the quick fox", "fox the quick")).toBe(100)
  })

  it("is 100 when both are empty", () => {
    expect(jaccardSimilarity("", "")).toBe(100)
  })

  it("is 0 when there are no shared tokens", () => {
    expect(jaccardSimilarity("alpha beta", "gamma delta")).toBe(0)
  })

  it("matches a known value with partial overlap", () => {
    // A = {a,b,c}, B = {b,c,d} -> intersection 2, union 4 -> 50%
    expect(jaccardSimilarity("a b c", "b c d")).toBeCloseTo(50, 5)
  })
})

describe("diceCoefficient", () => {
  it("is 100 for identical token sets", () => {
    expect(diceCoefficient("one two three", "three two one")).toBe(100)
  })

  it("is 0 for disjoint token sets", () => {
    expect(diceCoefficient("alpha beta", "gamma delta")).toBe(0)
  })

  it("matches a known value with partial overlap", () => {
    // A = {a,b,c}, B = {b,c,d} -> 2*2 / (3+3) = 66.66%
    expect(diceCoefficient("a b c", "b c d")).toBeCloseTo((4 / 6) * 100, 5)
  })
})

describe("computeSimilarityMetrics", () => {
  it("reports 100 across all metrics for identical strings", () => {
    const metrics = computeSimilarityMetrics("same text here", "same text here")
    expect(metrics.levenshtein).toBe(100)
    expect(metrics.jaccard).toBe(100)
    expect(metrics.dice).toBe(100)
  })

  it("reports low/zero across metrics for totally different strings", () => {
    const metrics = computeSimilarityMetrics("abcdef", "uvwxyz")
    expect(metrics.levenshtein).toBeLessThan(20)
    expect(metrics.jaccard).toBe(0)
    expect(metrics.dice).toBe(0)
  })

  it("reports 100 across all metrics for empty strings", () => {
    const metrics = computeSimilarityMetrics("", "")
    expect(metrics.levenshtein).toBe(100)
    expect(metrics.jaccard).toBe(100)
    expect(metrics.dice).toBe(100)
  })
})
