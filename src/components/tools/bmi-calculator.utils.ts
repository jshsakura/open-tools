export type BmiCategory = "underweight" | "normal" | "overweight" | "obesity"

export const BMI_UNDERWEIGHT_MAX = 18.5
export const BMI_NORMAL_MAX = 25
export const BMI_OVERWEIGHT_MAX = 30

// Healthy BMI band used for the ideal weight range.
export const HEALTHY_BMI_MIN = 18.5
export const HEALTHY_BMI_MAX = 24.9

const KG_PER_LB = 0.45359237
const CM_PER_INCH = 2.54
const INCHES_PER_FOOT = 12

/** Convert feet + inches to centimeters. */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * INCHES_PER_FOOT + inches
  return totalInches * CM_PER_INCH
}

/** Convert pounds to kilograms. */
export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

/** Convert kilograms to pounds. */
export function kgToLb(kg: number): number {
  return kg / KG_PER_LB
}

/** Classify a BMI value into a category. Boundaries: <18.5, <25, <30, else. */
export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < BMI_UNDERWEIGHT_MAX) return "underweight"
  if (bmi < BMI_NORMAL_MAX) return "normal"
  if (bmi < BMI_OVERWEIGHT_MAX) return "overweight"
  return "obesity"
}

export interface BmiResult {
  bmi: number
  category: BmiCategory
  healthyMinKg: number
  healthyMaxKg: number
}

/**
 * Compute BMI from height in centimeters and weight in kilograms.
 * Returns null for non-positive or non-finite inputs.
 */
export function computeBmi(heightCm: number, weightKg: number): BmiResult | null {
  if (
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return null
  }

  const heightM = heightCm / 100
  const heightSquared = heightM * heightM
  const bmi = weightKg / heightSquared

  return {
    bmi,
    category: getBmiCategory(bmi),
    healthyMinKg: HEALTHY_BMI_MIN * heightSquared,
    healthyMaxKg: HEALTHY_BMI_MAX * heightSquared,
  }
}

/**
 * Position (0-1) of a BMI value on a gauge that spans the visible BMI range.
 * Clamped so under/over-extreme values stay on the bar.
 */
export const GAUGE_MIN_BMI = 10
export const GAUGE_MAX_BMI = 40

export function gaugePosition(bmi: number): number {
  if (!Number.isFinite(bmi)) return 0
  const clamped = Math.min(GAUGE_MAX_BMI, Math.max(GAUGE_MIN_BMI, bmi))
  return (clamped - GAUGE_MIN_BMI) / (GAUGE_MAX_BMI - GAUGE_MIN_BMI)
}
