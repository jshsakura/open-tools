import { describe, expect, it } from "vitest"

import {
  acquisitionTax,
  acquisitionTaxMultiHome,
  BASIC_DEDUCTION,
  brokerageFee,
  capitalGainsTax,
  EOK,
  longTermHoldingRate,
  MAN,
  MULTI_HOME_RATE_2,
  MULTI_HOME_RATE_3_PLUS,
  ONE_HOME_EXEMPTION,
  pyeongToSqm,
  sqmToPyeong,
} from "./kr-real-estate.utils"

describe("sqmToPyeong / pyeongToSqm", () => {
  it("converts square meters to pyeong using the 0.3025 factor", () => {
    expect(sqmToPyeong(100)).toBeCloseTo(30.25, 10)
  })

  it("converts pyeong back to square meters", () => {
    expect(pyeongToSqm(30.25)).toBeCloseTo(100, 10)
  })

  it("round-trips sqm -> pyeong -> sqm", () => {
    expect(pyeongToSqm(sqmToPyeong(84))).toBeCloseTo(84, 10)
  })

  it("round-trips pyeong -> sqm -> pyeong", () => {
    expect(sqmToPyeong(pyeongToSqm(25))).toBeCloseTo(25, 10)
  })

  it("maps 0 to 0 in both directions", () => {
    expect(sqmToPyeong(0)).toBe(0)
    expect(pyeongToSqm(0)).toBe(0)
  })
})

describe("brokerageFee", () => {
  it("returns 0 for a price of 0", () => {
    expect(brokerageFee(0)).toBe(0)
  })

  it("returns 0 for a negative price", () => {
    expect(brokerageFee(-1)).toBe(0)
  })

  it("applies 0.6% in the first band (< 5천만)", () => {
    expect(brokerageFee(1000 * MAN)).toBe(60_000)
  })

  it("caps the first band at 25만원 once the price approaches the limit", () => {
    // 0.006 * 49,999,999 = 299,999.99 -> floor 299,999, but cap is 250,000
    expect(brokerageFee(5000 * MAN - 1)).toBe(25 * MAN)
  })

  it("crosses into the second band exactly at 5천만 (0.5%)", () => {
    // 0.005 * 50,000,000 = 250,000
    expect(brokerageFee(5000 * MAN)).toBe(250_000)
  })

  it("caps the second band at 80만원 just below 2억", () => {
    // 0.005 * 199,999,999 = 999,999.995 -> floored 999,999, capped at 800,000
    expect(brokerageFee(2 * EOK - 1)).toBe(80 * MAN)
  })

  it("crosses into the third band exactly at 2억 (0.4%, uncapped)", () => {
    // 0.004 * 200,000,000 = 800,000
    expect(brokerageFee(2 * EOK)).toBe(800_000)
  })

  it("computes the uncapped third band just below 9억", () => {
    // 0.004 * 899,999,999 = 3,599,999.996 -> 3,599,999
    expect(brokerageFee(9 * EOK - 1)).toBe(3_599_999)
  })

  it("crosses into the fourth band exactly at 9억 (0.5%)", () => {
    // 0.005 * 900,000,000 = 4,500,000
    expect(brokerageFee(9 * EOK)).toBe(4_500_000)
  })

  it("crosses into the fifth band exactly at 12억 (0.6%)", () => {
    // 0.006 * 1,200,000,000 = 7,200,000
    expect(brokerageFee(12 * EOK)).toBe(7_200_000)
  })

  it("applies the top band at 15억 and above (0.7%)", () => {
    // 0.007 * 1,500,000,000 = 10,500,000
    expect(brokerageFee(15 * EOK)).toBe(10_500_000)
    // 0.007 * 1,600,000,000 = 11,200,000
    expect(brokerageFee(16 * EOK)).toBe(11_200_000)
  })
})

describe("acquisitionTax", () => {
  it("returns 0 for a price of 0", () => {
    expect(acquisitionTax(0)).toBe(0)
  })

  it("returns 0 for a negative price", () => {
    expect(acquisitionTax(-1)).toBe(0)
  })

  it("applies 1.1% at and below 6억", () => {
    // 0.011 * 600,000,000 = 6,600,000
    expect(acquisitionTax(6 * EOK)).toBe(6_600_000)
  })

  it("applies 1.1% for a small price well inside the first band", () => {
    // 0.011 * 100,000,000 = 1,100,000
    expect(acquisitionTax(1 * EOK)).toBe(1_100_000)
  })

  it("just above 6억 enters the progressive band (rate slightly above 1.1%)", () => {
    // 6억 boundary stays in the flat band; +1 won crosses into progressive.
    // Progressive at exactly 6억 would also be 1.1%, so just above is ~unchanged.
    expect(acquisitionTax(6 * EOK + 1)).toBe(6_600_000)
  })

  it("computes the progressive midpoint at 7.5억", () => {
    // base = (7.5 * 2/3) - 3 = 2.0 ; rate = 0.02 + 0.001 = 0.021
    // 0.021 * 750,000,000 = 15,750,000
    expect(acquisitionTax(7.5 * EOK)).toBe(15_750_000)
  })

  it("computes the top of the progressive band at exactly 9억 (~3.1%)", () => {
    // base = (9 * 2/3) - 3 = 3 ; rate = 0.03 + 0.001 = 0.031
    // 0.031 * 900,000,000 = 27,900,000
    expect(acquisitionTax(9 * EOK)).toBe(27_900_000)
  })

  it("jumps to the flat 3.3% band just above 9억", () => {
    // 0.033 * 900,000,001 = 29,700,000.033 -> floored 29,700,000
    expect(acquisitionTax(9 * EOK + 1)).toBe(29_700_000)
  })

  it("applies 3.3% well above 9억", () => {
    // 0.033 * 1,000,000,000 = 33,000,000
    expect(acquisitionTax(10 * EOK)).toBe(33_000_000)
  })
})

describe("acquisitionTaxMultiHome", () => {
  it("returns 0 for non-positive prices", () => {
    expect(acquisitionTaxMultiHome(0, 2)).toBe(0)
    expect(acquisitionTaxMultiHome(-1, 3)).toBe(0)
  })

  it("falls back to the standard banded rate for a single home", () => {
    // 1 home at 6억 -> standard 1.1% = 6,600,000
    expect(acquisitionTaxMultiHome(6 * EOK, 1)).toBe(acquisitionTax(6 * EOK))
    expect(acquisitionTaxMultiHome(6 * EOK, 1)).toBe(6_600_000)
  })

  it("applies 8% for a 2nd home (조정대상지역 간이)", () => {
    // 0.08 * 1,000,000,000 = 80,000,000
    expect(acquisitionTaxMultiHome(10 * EOK, 2)).toBe(10 * EOK * MULTI_HOME_RATE_2)
    expect(acquisitionTaxMultiHome(10 * EOK, 2)).toBe(80_000_000)
  })

  it("applies 12% for a 3rd+ home", () => {
    // 0.12 * 1,000,000,000 = 120,000,000
    expect(acquisitionTaxMultiHome(10 * EOK, 3)).toBe(10 * EOK * MULTI_HOME_RATE_3_PLUS)
    expect(acquisitionTaxMultiHome(10 * EOK, 4)).toBe(120_000_000)
  })
})

describe("longTermHoldingRate", () => {
  it("is 0% below 3 years", () => {
    expect(longTermHoldingRate(0)).toBe(0)
    expect(longTermHoldingRate(2)).toBe(0)
  })

  it("is 2% at exactly 3 years", () => {
    expect(longTermHoldingRate(3)).toBeCloseTo(0.02, 10)
  })

  it("grows 2% per year and caps at 30% (17 years)", () => {
    expect(longTermHoldingRate(10)).toBeCloseTo(0.16, 10)
    expect(longTermHoldingRate(17)).toBeCloseTo(0.3, 10)
    expect(longTermHoldingRate(30)).toBeCloseTo(0.3, 10)
  })
})

describe("capitalGainsTax", () => {
  it("returns all zeros when there is no gain", () => {
    const r = capitalGainsTax({
      salePrice: 5 * EOK,
      purchasePrice: 6 * EOK,
      yearsHeld: 5,
      isOneHomeExempt: false,
    })
    expect(r).toEqual({ gain: 0, taxableGain: 0, taxBase: 0, tax: 0 })
  })

  it("fully exempts a 1-home sale at or below the 12억 exemption", () => {
    const r = capitalGainsTax({
      salePrice: ONE_HOME_EXEMPTION,
      purchasePrice: 8 * EOK,
      yearsHeld: 5,
      isOneHomeExempt: true,
    })
    expect(r.gain).toBe(4 * EOK)
    expect(r.taxableGain).toBe(0)
    expect(r.tax).toBe(0)
  })

  it("pro-rates the taxable gain above 12억 for a 1-home sale", () => {
    // sale 16억, buy 12억 -> gain 4억; taxed ratio = (16-12)/16 = 0.25
    // taxableGain = 4억 * 0.25 = 1억. yearsHeld < 3 -> no long-term deduction.
    // taxBase = 1억 - 250만 = 97,500,000.
    // bracket <=1.5억: rate 0.35, deduction 15,440,000.
    // tax = floor(97,500,000 * 0.35 - 15,440,000) = 34,125,000 - 15,440,000 = 18,685,000
    const r = capitalGainsTax({
      salePrice: 16 * EOK,
      purchasePrice: 12 * EOK,
      yearsHeld: 2,
      isOneHomeExempt: true,
    })
    expect(r.gain).toBe(4 * EOK)
    expect(r.taxableGain).toBe(1 * EOK)
    expect(r.taxBase).toBe(1 * EOK - BASIC_DEDUCTION)
    expect(r.tax).toBe(18_685_000)
  })

  it("taxes the full gain for a non-exempt sale with progressive bracket", () => {
    // gain = 3억 - 1억 = 2억; not exempt. yearsHeld 2 -> no long-term deduction.
    // taxBase = 2억 - 250만 = 197,500,000.
    // bracket <=3억: rate 0.38, deduction 19,940,000.
    // tax = floor(197,500,000 * 0.38 - 19,940,000) = 75,050,000 - 19,940,000 = 55,110,000
    const r = capitalGainsTax({
      salePrice: 3 * EOK,
      purchasePrice: 1 * EOK,
      yearsHeld: 2,
      isOneHomeExempt: false,
    })
    expect(r.gain).toBe(2 * EOK)
    expect(r.taxableGain).toBe(2 * EOK)
    expect(r.taxBase).toBe(2 * EOK - BASIC_DEDUCTION)
    expect(r.tax).toBe(55_110_000)
  })

  it("applies the long-term holding deduction to a long-held non-exempt sale", () => {
    // gain = 1.5억; yearsHeld 10 -> long-term 16%.
    // afterLongTerm = 150,000,000 * 0.84 = 126,000,000.
    // taxBase = 126,000,000 - 2,500,000 = 123,500,000.
    // bracket <=1.5억: rate 0.35, deduction 15,440,000.
    // tax = floor(123,500,000 * 0.35 - 15,440,000) = 43,225,000 - 15,440,000 = 27,785,000
    const r = capitalGainsTax({
      salePrice: 2.5 * EOK,
      purchasePrice: 1 * EOK,
      yearsHeld: 10,
      isOneHomeExempt: false,
    })
    expect(r.taxableGain).toBe(1.5 * EOK)
    expect(r.taxBase).toBe(123_500_000)
    expect(r.tax).toBe(27_785_000)
  })

  it("yields 0 tax when deductions wipe out a small gain", () => {
    // gain = 200만 < basic deduction 250만 -> taxBase 0.
    const r = capitalGainsTax({
      salePrice: 1 * EOK + 200 * MAN,
      purchasePrice: 1 * EOK,
      yearsHeld: 1,
      isOneHomeExempt: false,
    })
    expect(r.gain).toBe(200 * MAN)
    expect(r.taxBase).toBe(0)
    expect(r.tax).toBe(0)
  })
})
