import { describe, it, expect } from "vitest"
import { amortize } from "./loan-calculator.utils"

describe("amortize", () => {
  it("computes the standard monthly payment (200k @6% / 360mo ~= 1199.10)", () => {
    const r = amortize(200000, 6, 360)!
    expect(r.monthlyPayment).toBeCloseTo(1199.1, 1)
    expect(r.payoffMonths).toBe(360)
  })

  it("pays the loan off exactly (final balance is zero)", () => {
    const r = amortize(10000, 5, 12)!
    expect(r.schedule[r.schedule.length - 1].balance).toBeCloseTo(0, 6)
    // total principal repaid equals the loan amount
    const principalRepaid = r.schedule.reduce((s, row) => s + row.principal, 0)
    expect(principalRepaid).toBeCloseTo(10000, 4)
  })

  it("handles zero interest (payment = principal / months)", () => {
    const r = amortize(12000, 0, 12)!
    expect(r.monthlyPayment).toBeCloseTo(1000, 6)
    expect(r.totalInterest).toBeCloseTo(0, 6)
    expect(r.payoffMonths).toBe(12)
    expect(r.totalPayment).toBeCloseTo(12000, 4)
  })

  it("accelerates payoff with an extra monthly payment", () => {
    const base = amortize(100000, 5, 240)!
    const withExtra = amortize(100000, 5, 240, 200)!
    expect(withExtra.payoffMonths).toBeLessThan(base.payoffMonths)
    expect(withExtra.totalInterest).toBeLessThan(base.totalInterest)
  })

  it("extra payment on a zero-interest loan just shortens the term", () => {
    // 12000 over 12mo = 1000/mo; +1000 extra -> 2000/mo -> 6 months
    const r = amortize(12000, 0, 12, 1000)!
    expect(r.payoffMonths).toBe(6)
    expect(r.totalInterest).toBeCloseTo(0, 6)
  })

  it("returns null for invalid input", () => {
    expect(amortize(0, 5, 12)).toBeNull()
    expect(amortize(1000, 5, 0)).toBeNull()
    expect(amortize(1000, -1, 12)).toBeNull()
    expect(amortize(1000, 5, 12, -50)).toBeNull()
  })
})
