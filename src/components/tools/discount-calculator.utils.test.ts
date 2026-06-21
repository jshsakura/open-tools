import { describe, it, expect } from "vitest"
import { applyStackedDiscounts, computeDiscount } from "./discount-calculator.utils"

describe("applyStackedDiscounts", () => {
  it("applies a single discount", () => {
    expect(applyStackedDiscounts(100, [20])).toBeCloseTo(80, 6)
  })
  it("compounds stacked discounts (20% then 10% = 28% off)", () => {
    // 100 -> 80 -> 72
    expect(applyStackedDiscounts(100, [20, 10])).toBeCloseTo(72, 6)
  })
  it("is order-independent for the resulting price", () => {
    const a = applyStackedDiscounts(100, [20, 10])
    const b = applyStackedDiscounts(100, [10, 20])
    expect(a).toBeCloseTo(b, 9)
  })
  it("ignores empty / zero discounts", () => {
    expect(applyStackedDiscounts(100, [])).toBe(100)
    expect(applyStackedDiscounts(100, [0, 0])).toBe(100)
  })
  it("clamps discounts above 100%", () => {
    expect(applyStackedDiscounts(100, [150])).toBe(0)
  })
})

describe("computeDiscount", () => {
  const base = {
    originalPrice: 100,
    discounts: [20],
    coupon: 0,
    taxPercent: 0,
    quantity: 1,
  }

  it("computes a single discount", () => {
    const r = computeDiscount(base)!
    expect(r.unitAfterCoupon).toBeCloseTo(80, 6)
    expect(r.effectivePercentOff).toBeCloseTo(20, 6)
    expect(r.finalTotal).toBeCloseTo(80, 6)
    expect(r.totalSaved).toBeCloseTo(20, 6)
  })

  it("applies a coupon after percentage discounts", () => {
    const r = computeDiscount({ ...base, coupon: 5 })!
    expect(r.unitAfterCoupon).toBeCloseTo(75, 6)
    expect(r.effectivePercentOff).toBeCloseTo(25, 6)
  })

  it("applies tax after discounts", () => {
    const r = computeDiscount({ ...base, taxPercent: 10 })!
    // subtotal 80, +10% tax = 88
    expect(r.taxAmount).toBeCloseTo(8, 6)
    expect(r.finalTotal).toBeCloseTo(88, 6)
  })

  it("multiplies by quantity", () => {
    const r = computeDiscount({ ...base, quantity: 3 })!
    expect(r.subtotal).toBeCloseTo(240, 6)
    expect(r.totalSaved).toBeCloseTo(60, 6)
  })

  it("combines stacked discounts, coupon, quantity and tax", () => {
    const r = computeDiscount({
      originalPrice: 100,
      discounts: [20, 10],
      coupon: 2,
      taxPercent: 10,
      quantity: 2,
    })!
    // 100 -> 72 -> 70 per unit; subtotal 140; tax 14; total 154
    expect(r.unitAfterCoupon).toBeCloseTo(70, 6)
    expect(r.subtotal).toBeCloseTo(140, 6)
    expect(r.finalTotal).toBeCloseTo(154, 6)
  })

  it("returns null for invalid price or quantity", () => {
    expect(computeDiscount({ ...base, originalPrice: -1 })).toBeNull()
    expect(computeDiscount({ ...base, quantity: 0 })).toBeNull()
  })

  it("never produces a negative unit price after a large coupon", () => {
    const r = computeDiscount({ ...base, coupon: 1000 })!
    expect(r.unitAfterCoupon).toBe(0)
  })
})
