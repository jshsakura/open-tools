import { describe, it, expect } from "vitest"
import {
  computeBmi,
  getBmiCategory,
  feetInchesToCm,
  lbToKg,
  kgToLb,
  gaugePosition,
} from "./bmi-calculator.utils"

describe("getBmiCategory boundaries", () => {
  it("classifies just under 18.5 as underweight", () => {
    expect(getBmiCategory(18.49)).toBe("underweight")
  })
  it("classifies exactly 18.5 as normal", () => {
    expect(getBmiCategory(18.5)).toBe("normal")
  })
  it("classifies just under 25 as normal", () => {
    expect(getBmiCategory(24.99)).toBe("normal")
  })
  it("classifies exactly 25 as overweight", () => {
    expect(getBmiCategory(25)).toBe("overweight")
  })
  it("classifies exactly 30 as obesity", () => {
    expect(getBmiCategory(30)).toBe("obesity")
  })
})

describe("computeBmi (metric)", () => {
  it("computes a known BMI value", () => {
    // 65 kg at 1.70 m -> 65 / 2.89 = 22.49...
    const result = computeBmi(170, 65)
    expect(result).not.toBeNull()
    expect(result!.bmi).toBeCloseTo(22.49, 2)
    expect(result!.category).toBe("normal")
  })
  it("computes a known obese BMI value", () => {
    // 100 kg at 1.70 m -> 34.6
    const result = computeBmi(170, 100)
    expect(result!.bmi).toBeCloseTo(34.6, 1)
    expect(result!.category).toBe("obesity")
  })
  it("returns healthy weight range for the height", () => {
    const result = computeBmi(170, 65)!
    // 18.5 * 2.89 = 53.465, 24.9 * 2.89 = 71.961
    expect(result.healthyMinKg).toBeCloseTo(53.47, 1)
    expect(result.healthyMaxKg).toBeCloseTo(71.96, 1)
  })
  it("returns null for non-positive inputs", () => {
    expect(computeBmi(0, 65)).toBeNull()
    expect(computeBmi(170, 0)).toBeNull()
    expect(computeBmi(-1, 65)).toBeNull()
    expect(computeBmi(NaN, 65)).toBeNull()
  })
})

describe("computeBmi (imperial via conversion)", () => {
  it("matches metric BMI when converting 5ft7in / 143lb", () => {
    // 5'7" = 170.18 cm, 143 lb = 64.86 kg -> ~22.4
    const cm = feetInchesToCm(5, 7)
    const kg = lbToKg(143)
    expect(cm).toBeCloseTo(170.18, 1)
    expect(kg).toBeCloseTo(64.86, 1)
    const result = computeBmi(cm, kg)!
    expect(result.bmi).toBeCloseTo(22.4, 1)
    expect(result.category).toBe("normal")
  })
  it("round-trips kg <-> lb", () => {
    expect(kgToLb(lbToKg(150))).toBeCloseTo(150, 6)
  })
})

describe("gaugePosition", () => {
  it("maps the gauge min to 0 and max to 1", () => {
    expect(gaugePosition(10)).toBe(0)
    expect(gaugePosition(40)).toBe(1)
  })
  it("maps the midpoint to 0.5", () => {
    expect(gaugePosition(25)).toBeCloseTo(0.5, 5)
  })
  it("clamps out-of-range values", () => {
    expect(gaugePosition(5)).toBe(0)
    expect(gaugePosition(60)).toBe(1)
  })
})
