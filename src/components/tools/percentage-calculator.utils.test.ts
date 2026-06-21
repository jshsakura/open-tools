import { describe, it, expect } from "vitest"
import {
  percentOf,
  whatPercent,
  percentageChange,
  adjustByPercent,
} from "./percentage-calculator.utils"

describe("percentOf (P% of B)", () => {
  it("computes a known value", () => {
    expect(percentOf(20, 85)).toBeCloseTo(17, 6)
  })
  it("handles zero base", () => {
    expect(percentOf(50, 0)).toBe(0)
  })
  it("returns null for non-finite input", () => {
    expect(percentOf(NaN, 10)).toBeNull()
  })
})

describe("whatPercent (A is what % of B)", () => {
  it("computes a known value", () => {
    expect(whatPercent(25, 200)).toBeCloseTo(12.5, 6)
  })
  it("handles part larger than whole", () => {
    expect(whatPercent(150, 100)).toBeCloseTo(150, 6)
  })
  it("returns null when whole is zero", () => {
    expect(whatPercent(10, 0)).toBeNull()
  })
})

describe("percentageChange", () => {
  it("computes an increase", () => {
    const r = percentageChange(120, 150)!
    expect(r.difference).toBeCloseTo(30, 6)
    expect(r.percentChange).toBeCloseTo(25, 6)
    expect(r.isIncrease).toBe(true)
  })
  it("computes a decrease", () => {
    const r = percentageChange(120, 96)!
    expect(r.difference).toBeCloseTo(-24, 6)
    expect(r.percentChange).toBeCloseTo(-20, 6)
    expect(r.isIncrease).toBe(false)
  })
  it("returns null when old value is zero", () => {
    expect(percentageChange(0, 10)).toBeNull()
  })
})

describe("adjustByPercent (increase/decrease N by X%)", () => {
  it("increases a value", () => {
    const r = adjustByPercent(200, 15)!
    expect(r.delta).toBeCloseTo(30, 6)
    expect(r.result).toBeCloseTo(230, 6)
  })
  it("decreases a value with a negative percent", () => {
    const r = adjustByPercent(200, -10)!
    expect(r.delta).toBeCloseTo(-20, 6)
    expect(r.result).toBeCloseTo(180, 6)
  })
  it("returns the same value for 0%", () => {
    const r = adjustByPercent(200, 0)!
    expect(r.result).toBe(200)
  })
  it("returns null for non-finite input", () => {
    expect(adjustByPercent(NaN, 10)).toBeNull()
  })
})
