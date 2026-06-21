import { describe, it, expect } from "vitest"
import { growthSchedule } from "./compound-interest-calculator.utils"

describe("growthSchedule", () => {
  it("returns one row per year", () => {
    const rows = growthSchedule(1000, 5, 10, 12, 0)
    expect(rows).toHaveLength(10)
    expect(rows[0].year).toBe(1)
    expect(rows[9].year).toBe(10)
  })

  it("matches annual compounding of principal with no contributions", () => {
    // 1000 at 5% compounded yearly for 1 year -> 1050
    const rows = growthSchedule(1000, 5, 1, 1, 0)
    expect(rows[0].balance).toBeCloseTo(1050, 2)
    expect(rows[0].interest).toBeCloseTo(50, 2)
    expect(rows[0].contributions).toBe(0)
    expect(rows[0].principal).toBe(1000)
  })

  it("grows principal-only over multiple years (1000 @5% yearly, 3y)", () => {
    // 1000 * 1.05^3 = 1157.625
    const rows = growthSchedule(1000, 5, 3, 1, 0)
    expect(rows[2].balance).toBeCloseTo(1157.625, 2)
  })

  it("accumulates contributions into balance and contributions field", () => {
    // 0 principal, 100/mo, 0% over 2 years -> 2400 contributed, 0 interest
    const rows = growthSchedule(0, 0, 2, 12, 100)
    expect(rows[1].contributions).toBeCloseTo(2400, 6)
    expect(rows[1].balance).toBeCloseTo(2400, 6)
    expect(rows[1].interest).toBeCloseTo(0, 6)
  })

  it("interest is positive when rate and time are positive with contributions", () => {
    const rows = growthSchedule(1000, 6, 5, 12, 200)
    const last = rows[rows.length - 1]
    expect(last.balance).toBeGreaterThan(last.principal + last.contributions)
    expect(last.interest).toBeGreaterThan(0)
  })

  it("contributions accumulate monotonically year over year", () => {
    const rows = growthSchedule(1000, 5, 4, 12, 100)
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i].contributions).toBeGreaterThan(rows[i - 1].contributions)
      expect(rows[i].balance).toBeGreaterThan(rows[i - 1].balance)
    }
  })

  it("returns empty array for invalid input", () => {
    expect(growthSchedule(-1, 5, 10, 12, 0)).toEqual([])
    expect(growthSchedule(1000, 5, 0, 12, 0)).toEqual([])
    expect(growthSchedule(1000, 5, 10, 0, 0)).toEqual([])
    expect(growthSchedule(1000, -5, 10, 12, 0)).toEqual([])
  })
})
