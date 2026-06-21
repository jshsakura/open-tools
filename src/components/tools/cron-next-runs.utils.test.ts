import { describe, expect, it } from "vitest"

import { describeCron, nextRuns } from "./cron-next-runs.utils"

describe("describeCron", () => {
  it('describes "* * * * *" as "Every minute" in English', () => {
    // Act
    const result = describeCron("* * * * *", "en")

    // Assert
    expect(result).toBe("Every minute")
  })

  it("returns a Korean description for the ko locale", () => {
    // Act
    const result = describeCron("* * * * *", "ko")

    // Assert: differs from the English wording and is non-empty
    expect(result).not.toBe("Every minute")
    expect(result.length).toBeGreaterThan(0)
  })

  it("falls back to English for unknown locales", () => {
    // Act
    const result = describeCron("* * * * *", "fr-unknown")

    // Assert
    expect(result).toBe("Every minute")
  })

  it("throws on an invalid expression", () => {
    expect(() => describeCron("not a cron", "en")).toThrow()
  })

  it("throws on an empty expression", () => {
    expect(() => describeCron("   ", "en")).toThrow()
  })
})

describe("nextRuns", () => {
  it('yields midnight datetimes incrementing by 1 day for "0 0 * * *" (UTC)', () => {
    // Act
    const runs = nextRuns("0 0 * * *", 5, "utc")

    // Assert
    expect(runs).toHaveLength(5)
    const DAY_MS = 24 * 60 * 60 * 1000
    for (let i = 0; i < runs.length; i++) {
      expect(runs[i].getUTCHours()).toBe(0)
      expect(runs[i].getUTCMinutes()).toBe(0)
      expect(runs[i].getUTCSeconds()).toBe(0)
      if (i > 0) {
        // Assert: consecutive midnights are exactly one day apart
        expect(runs[i].getTime() - runs[i - 1].getTime()).toBe(DAY_MS)
      }
    }
  })

  it("returns strictly increasing future times", () => {
    // Act
    const runs = nextRuns("*/15 * * * *", 4, "utc")

    // Assert
    expect(runs).toHaveLength(4)
    for (let i = 1; i < runs.length; i++) {
      expect(runs[i].getTime()).toBeGreaterThan(runs[i - 1].getTime())
    }
  })

  it("supports 6-field expressions (with seconds)", () => {
    // Act
    const runs = nextRuns("0 0 0 * * *", 3, "utc")

    // Assert
    expect(runs).toHaveLength(3)
    expect(runs[0].getUTCHours()).toBe(0)
    expect(runs[0].getUTCSeconds()).toBe(0)
  })

  it("clamps the count to at least 1", () => {
    // Act
    const runs = nextRuns("* * * * *", 0, "local")

    // Assert
    expect(runs).toHaveLength(1)
  })

  it("throws on an invalid expression", () => {
    expect(() => nextRuns("99 99 99 99 99", 3, "utc")).toThrow()
  })

  it("throws on an empty expression", () => {
    expect(() => nextRuns("", 3, "utc")).toThrow()
  })
})
