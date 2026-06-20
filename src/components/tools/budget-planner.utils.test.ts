import { describe, expect, it } from "vitest"

import { summarize } from "./budget-planner.utils"

describe("summarize — empty and single-type", () => {
  it("returns all zeros for an empty list", () => {
    // Act
    const result = summarize([])

    // Assert
    expect(result).toEqual({ income: 0, expense: 0, balance: 0 })
  })

  it("sums income only and leaves expense at 0", () => {
    // Act
    const result = summarize([
      { type: "income", amount: 3000000 },
      { type: "income", amount: 500000 },
    ])

    // Assert
    expect(result).toEqual({ income: 3500000, expense: 0, balance: 3500000 })
  })

  it("sums expense only and produces a negative balance", () => {
    // Act
    const result = summarize([
      { type: "expense", amount: 1000 },
      { type: "expense", amount: 2000 },
    ])

    // Assert
    expect(result).toEqual({ income: 0, expense: 3000, balance: -3000 })
  })
})

describe("summarize — mixed entries", () => {
  it("computes balance as income minus expense", () => {
    // Arrange / Act
    const result = summarize([
      { type: "income", amount: 5000 },
      { type: "expense", amount: 1500 },
      { type: "income", amount: 1000 },
      { type: "expense", amount: 500 },
    ])

    // Assert
    expect(result.income).toBe(6000)
    expect(result.expense).toBe(2000)
    expect(result.balance).toBe(4000)
  })

  it("yields a zero balance when income equals expense", () => {
    // Act
    const result = summarize([
      { type: "income", amount: 2500 },
      { type: "expense", amount: 2500 },
    ])

    // Assert
    expect(result.balance).toBe(0)
  })
})

describe("summarize — edge cases", () => {
  it("treats NaN amounts as 0 so one bad entry never corrupts totals", () => {
    // Act
    const result = summarize([
      { type: "income", amount: NaN },
      { type: "income", amount: 1000 },
      { type: "expense", amount: NaN },
      { type: "expense", amount: 400 },
    ])

    // Assert
    expect(result).toEqual({ income: 1000, expense: 400, balance: 600 })
  })

  it("treats Infinity amounts as 0", () => {
    // Act
    const result = summarize([
      { type: "income", amount: Infinity },
      { type: "expense", amount: 200 },
    ])

    // Assert
    expect(result).toEqual({ income: 0, expense: 200, balance: -200 })
  })

  it("accepts negative amounts as provided (e.g. a refund recorded as income)", () => {
    // Act
    const result = summarize([
      { type: "income", amount: -500 },
      { type: "expense", amount: 100 },
    ])

    // Assert
    expect(result.income).toBe(-500)
    expect(result.expense).toBe(100)
    expect(result.balance).toBe(-600)
  })

  it("handles large sums without overflow or precision loss", () => {
    // Act
    const result = summarize([
      { type: "income", amount: 1_000_000_000_000 },
      { type: "expense", amount: 999_999_999_999 },
    ])

    // Assert
    expect(result.income).toBe(1_000_000_000_000)
    expect(result.expense).toBe(999_999_999_999)
    expect(result.balance).toBe(1)
  })
})
