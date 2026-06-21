import { describe, expect, it } from "vitest"

import {
  buildDrinkSchedule,
  computeWaterIntake,
  toKilograms,
  type WaterIntakeInput,
} from "./water-intake-calculator.utils"

const baseInput: WaterIntakeInput = {
  weight: 65,
  weightUnit: "kg",
  activityMinutes: 0,
  sex: "female",
  climate: "temperate",
}

describe("computeWaterIntake — base formula", () => {
  it("computes 33 ml/kg with no adjustments (65 kg → 2145 ml)", () => {
    // Act
    const result = computeWaterIntake(baseInput)

    // Assert
    expect(result!.baseMl).toBeCloseTo(2145, 6)
    expect(result!.totalMl).toBeCloseTo(2145, 6)
    expect(result!.liters).toBeCloseTo(2.145, 6)
  })

  it("adds 12 ml per active minute", () => {
    // Act: 65 kg base 2145 + 30 min * 12 = 360 → 2505
    const result = computeWaterIntake({ ...baseInput, activityMinutes: 30 })

    // Assert
    expect(result!.activityExtraMl).toBe(360)
    expect(result!.totalMl).toBeCloseTo(2505, 6)
  })
})

describe("computeWaterIntake — imperial units", () => {
  it("converts pounds to kilograms before applying the formula", () => {
    // Arrange: 143.3 lb ≈ 65 kg
    const result = computeWaterIntake({ ...baseInput, weight: 143.3, weightUnit: "lb" })

    // Assert
    expect(result!.baseMl).toBeCloseTo(2145, 0)
  })

  it("exposes the result in fluid ounces", () => {
    // Act
    const result = computeWaterIntake(baseInput)

    // Assert: 2145 ml / 29.5735 ≈ 72.5 oz
    expect(result!.ounces).toBeCloseTo(72.53, 1)
  })

  it("toKilograms converts 100 lb to ~45.36 kg", () => {
    expect(toKilograms(100, "lb")).toBeCloseTo(45.359237, 5)
    expect(toKilograms(70, "kg")).toBe(70)
  })
})

describe("computeWaterIntake — adjustment factors", () => {
  it("applies the male factor (×1.1)", () => {
    // Act
    const result = computeWaterIntake({ ...baseInput, sex: "male" })

    // Assert
    expect(result!.totalMl).toBeCloseTo(2145 * 1.1, 6)
    expect(result!.adjustmentMl).toBeCloseTo(2145 * 0.1, 6)
  })

  it("applies the hot-climate factor (×1.15)", () => {
    // Act
    const result = computeWaterIntake({ ...baseInput, climate: "hot" })

    // Assert
    expect(result!.totalMl).toBeCloseTo(2145 * 1.15, 6)
  })

  it("compounds sex and climate factors", () => {
    // Act
    const result = computeWaterIntake({ ...baseInput, sex: "male", climate: "hot" })

    // Assert
    expect(result!.totalMl).toBeCloseTo(2145 * 1.1 * 1.15, 6)
  })

  it("returns null for non-positive weight", () => {
    expect(computeWaterIntake({ ...baseInput, weight: 0 })).toBeNull()
    expect(computeWaterIntake({ ...baseInput, weight: NaN })).toBeNull()
  })
})

describe("buildDrinkSchedule", () => {
  it("distributes the rounded cup count across 16 waking hours", () => {
    // Act: 2000 ml / 250 = 8 cups
    const schedule = buildDrinkSchedule(2000, 250)

    // Assert
    const totalCups = schedule.reduce((sum, slot) => sum + slot.cups, 0)
    expect(schedule).toHaveLength(16)
    expect(totalCups).toBe(8)
  })

  it("returns an empty schedule for invalid input", () => {
    expect(buildDrinkSchedule(0, 250)).toEqual([])
    expect(buildDrinkSchedule(2000, 0)).toEqual([])
  })
})
