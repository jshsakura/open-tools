import { describe, expect, it } from "vitest"

import { computeSplit, type SplitPersonInput } from "./split-bill-calculator.utils"

const even3: SplitPersonInput[] = [
  { name: "A", weight: 1 },
  { name: "B", weight: 1 },
  { name: "C", weight: 1 },
]

describe("computeSplit — even mode", () => {
  it("splits a tax/tip-free bill evenly across 3 people", () => {
    // Act
    const result = computeSplit({ bill: 90, tax: 0, tip: 0, mode: "even", people: even3 })

    // Assert
    expect(result).not.toBeNull()
    expect(result!.total).toBe(90)
    expect(result!.perPerson).toBe(30)
    expect(result!.shares.map((s) => s.amount)).toEqual([30, 30, 30])
  })

  it("includes tax and tip in the total and per-person amount", () => {
    // Act: bill 100, 10% tax (10), 12% tip (12) → total 122
    const result = computeSplit({ bill: 100, tax: 10, tip: 12, mode: "even", people: even3 })

    // Assert
    expect(result!.taxAmount).toBeCloseTo(10, 6)
    expect(result!.tipAmount).toBeCloseTo(12, 6)
    expect(result!.total).toBeCloseTo(122, 6)
    expect(result!.perPerson).toBeCloseTo(122 / 3, 6)
  })

  it("distributes the rounding remainder so per-person amounts sum to the total", () => {
    // Act: 100 / 3 = 33.333... → 33.34, 33.33, 33.33
    const result = computeSplit({ bill: 100, tax: 0, tip: 0, mode: "even", people: even3 })

    // Assert
    const amounts = result!.shares.map((s) => s.amount)
    const sum = amounts.reduce((a, b) => a + b, 0)
    expect(sum).toBeCloseTo(100, 6)
    expect(amounts).toContain(33.34)
    expect(amounts.filter((a) => a === 33.33)).toHaveLength(2)
  })
})

describe("computeSplit — weighted mode", () => {
  it("splits by weight (1:2:1 of 120 → 30/60/30)", () => {
    // Arrange
    const people: SplitPersonInput[] = [
      { name: "A", weight: 1 },
      { name: "B", weight: 2 },
      { name: "C", weight: 1 },
    ]

    // Act
    const result = computeSplit({ bill: 120, tax: 0, tip: 0, mode: "weighted", people })

    // Assert
    expect(result!.shares.map((s) => s.amount)).toEqual([30, 60, 30])
    expect(result!.shares[1].fraction).toBeCloseTo(0.5, 6)
  })

  it("applies tax and tip before weighting", () => {
    // Act: bill 100, 10% tax + 10% tip → 120, weights 1:1
    const result = computeSplit({
      bill: 100,
      tax: 10,
      tip: 10,
      mode: "weighted",
      people: [
        { name: "A", weight: 1 },
        { name: "B", weight: 1 },
      ],
    })

    // Assert
    expect(result!.total).toBeCloseTo(120, 6)
    expect(result!.shares.map((s) => s.amount)).toEqual([60, 60])
  })

  it("treats a zero-weight person as owing nothing", () => {
    // Act
    const result = computeSplit({
      bill: 100,
      tax: 0,
      tip: 0,
      mode: "weighted",
      people: [
        { name: "A", weight: 0 },
        { name: "B", weight: 1 },
      ],
    })

    // Assert
    expect(result!.shares[0].amount).toBe(0)
    expect(result!.shares[1].amount).toBe(100)
  })
})

describe("computeSplit — invariants and edge cases", () => {
  it("keeps the sum of shares equal to the total for awkward weights", () => {
    // Act
    const result = computeSplit({
      bill: 99.99,
      tax: 7,
      tip: 3,
      mode: "weighted",
      people: [
        { name: "A", weight: 3 },
        { name: "B", weight: 5 },
        { name: "C", weight: 7 },
      ],
    })

    // Assert
    const sum = result!.shares.reduce((acc, s) => acc + s.amount, 0)
    expect(sum).toBeCloseTo(result!.total, 2)
  })

  it("returns null for a negative bill", () => {
    expect(computeSplit({ bill: -1, tax: 0, tip: 0, mode: "even", people: even3 })).toBeNull()
  })

  it("returns null for a NaN bill", () => {
    expect(computeSplit({ bill: NaN, tax: 0, tip: 0, mode: "even", people: even3 })).toBeNull()
  })

  it("returns null when there are no people", () => {
    expect(computeSplit({ bill: 100, tax: 0, tip: 0, mode: "even", people: [] })).toBeNull()
  })

  it("ignores negative tax and tip values (treated as 0)", () => {
    // Act
    const result = computeSplit({ bill: 100, tax: -5, tip: -2, mode: "even", people: even3 })

    // Assert
    expect(result!.total).toBe(100)
  })
})
