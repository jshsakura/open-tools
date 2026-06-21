import { describe, it, expect } from "vitest"
import {
  computeCalories,
  feetInchesToCm,
  lbToKg,
  macroGrams,
  mifflinStJeorBmr,
  tdee,
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  KCAL_PER_GRAM_PROTEIN,
  KCAL_PER_GRAM_CARBS,
  KCAL_PER_GRAM_FAT,
} from "./calorie-calculator.utils"

describe("unit conversions", () => {
  it("converts feet+inches to cm (5ft10in ~= 177.8cm)", () => {
    expect(feetInchesToCm(5, 10)).toBeCloseTo(177.8, 1)
  })
  it("converts pounds to kg (150lb ~= 68.04kg)", () => {
    expect(lbToKg(150)).toBeCloseTo(68.039, 2)
  })
})

describe("mifflinStJeorBmr", () => {
  // Known value: male, 80kg, 180cm, 30y -> 10*80+6.25*180-5*30+5 = 1780
  it("computes male BMR", () => {
    expect(mifflinStJeorBmr("male", 80, 180, 30)).toBeCloseTo(1780, 6)
  })
  // female, 65kg, 170cm, 30y -> 10*65+6.25*170-5*30-161 = 1401.5
  it("computes female BMR (uses -161 constant)", () => {
    expect(mifflinStJeorBmr("female", 65, 170, 30)).toBeCloseTo(1401.5, 6)
  })
})

describe("tdee", () => {
  it("applies activity multipliers", () => {
    expect(tdee(1780, "moderate")).toBeCloseTo(1780 * ACTIVITY_MULTIPLIERS.moderate, 6)
    expect(tdee(1780, "low")).toBeCloseTo(1780 * 1.2, 6)
  })
})

describe("macroGrams", () => {
  it("splits calories into grams using kcal/gram constants", () => {
    // maintain split: 30/40/30 of 2000 kcal
    const m = macroGrams(2000, "maintain")
    expect(m.protein).toBeCloseTo((2000 * 0.3) / KCAL_PER_GRAM_PROTEIN, 6)
    expect(m.carbs).toBeCloseTo((2000 * 0.4) / KCAL_PER_GRAM_CARBS, 6)
    expect(m.fat).toBeCloseTo((2000 * 0.3) / KCAL_PER_GRAM_FAT, 6)
  })
  it("macro calories sum back to the target", () => {
    const m = macroGrams(2200, "lose")
    const kcal =
      m.protein * KCAL_PER_GRAM_PROTEIN + m.carbs * KCAL_PER_GRAM_CARBS + m.fat * KCAL_PER_GRAM_FAT
    expect(kcal).toBeCloseTo(2200, 4)
  })
})

describe("computeCalories", () => {
  const base = {
    sex: "male" as const,
    age: 30,
    heightCm: 180,
    weightKg: 80,
    activity: "moderate" as const,
    goal: "maintain" as const,
  }

  it("computes BMR, maintenance and target", () => {
    const r = computeCalories(base)!
    expect(r.bmr).toBeCloseTo(1780, 6)
    expect(r.maintenance).toBeCloseTo(1780 * 1.55, 6)
    expect(r.targetCalories).toBeCloseTo(1780 * 1.55, 6) // maintain => +0
  })

  it("applies goal adjustment to the target", () => {
    const lose = computeCalories({ ...base, goal: "lose" })!
    const gain = computeCalories({ ...base, goal: "gain" })!
    expect(lose.targetCalories).toBeCloseTo(lose.maintenance + GOAL_ADJUSTMENTS.lose, 6)
    expect(gain.targetCalories).toBeCloseTo(gain.maintenance + GOAL_ADJUSTMENTS.gain, 6)
  })

  it("returns null for invalid input", () => {
    expect(computeCalories({ ...base, age: 0 })).toBeNull()
    expect(computeCalories({ ...base, weightKg: -1 })).toBeNull()
    expect(computeCalories({ ...base, heightCm: NaN })).toBeNull()
  })
})
