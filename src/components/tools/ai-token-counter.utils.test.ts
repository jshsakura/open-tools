import { describe, expect, it } from "vitest"

import { MODEL_RATES, cost, estimateTokens } from "./ai-token-counter.utils"

describe("ai-token-counter utils", () => {
  describe("estimateTokens", () => {
    it("returns 0 for an empty string", () => {
      expect(estimateTokens("")).toBe(0)
    })

    it("returns a positive estimate for plain prose", () => {
      // Arrange
      const text = "The quick brown fox jumps over the lazy dog"

      // Act
      const tokens = estimateTokens(text)

      // Assert — 9 words, ~43 chars: blended estimate lands in a sane range
      expect(tokens).toBeGreaterThan(5)
      expect(tokens).toBeLessThan(20)
    })

    it("grows monotonically as text gets longer", () => {
      const short = estimateTokens("hello")
      const long = estimateTokens("hello world this is a longer sentence")
      expect(long).toBeGreaterThan(short)
    })

    it("weights punctuation-heavy input higher than plain words", () => {
      // Arrange — same word count, different punctuation density
      const plain = estimateTokens("a b c d")
      const punct = estimateTokens("a! b! c! d!")

      // Assert
      expect(punct).toBeGreaterThan(plain)
    })

    it("always returns a non-negative integer", () => {
      const tokens = estimateTokens("  spaced   out   text  ")
      expect(Number.isInteger(tokens)).toBe(true)
      expect(tokens).toBeGreaterThanOrEqual(0)
    })
  })

  describe("cost", () => {
    it("returns 0 for zero tokens", () => {
      expect(cost(0, 5)).toBe(0)
    })

    it("returns 0 for a zero or negative rate", () => {
      expect(cost(1000, 0)).toBe(0)
      expect(cost(1000, -5)).toBe(0)
    })

    it("computes price per million correctly", () => {
      // Arrange / Act — 1M tokens at $2.50/1M
      const result = cost(1_000_000, 2.5)

      // Assert
      expect(result).toBeCloseTo(2.5, 6)
    })

    it("scales linearly with token count", () => {
      const single = cost(500_000, 10)
      const double = cost(1_000_000, 10)
      expect(double).toBeCloseTo(single * 2, 6)
    })
  })

  describe("MODEL_RATES", () => {
    it("exposes the five required models", () => {
      const ids = MODEL_RATES.map((m) => m.id)
      expect(ids).toEqual(
        expect.arrayContaining([
          "gpt-4o",
          "gpt-4o-mini",
          "claude-sonnet",
          "claude-haiku",
          "gemini-flash",
        ]),
      )
    })

    it("has positive input and output rates for every model", () => {
      for (const m of MODEL_RATES) {
        expect(m.inputPerM).toBeGreaterThan(0)
        expect(m.outputPerM).toBeGreaterThan(0)
      }
    })
  })
})
