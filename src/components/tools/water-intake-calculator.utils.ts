export type WeightUnit = "kg" | "lb"
export type Sex = "female" | "male"
export type Climate = "temperate" | "hot"
export type ActivityLevel = "low" | "moderate" | "high"

const LB_TO_KG = 0.45359237
const ML_PER_KG = 33
const ML_PER_ACTIVE_MINUTE = 12
const ML_PER_OZ = 29.5735
const WAKING_HOURS = 16

/** Multiplier applied to the base weight-derived intake. */
const SEX_FACTOR: Record<Sex, number> = { female: 1, male: 1.1 }
const CLIMATE_FACTOR: Record<Climate, number> = { temperate: 1, hot: 1.15 }

export interface WaterIntakeInput {
  weight: number
  weightUnit: WeightUnit
  activityMinutes: number
  sex: Sex
  climate: Climate
}

export interface WaterIntakeResult {
  baseMl: number
  activityExtraMl: number
  /** Extra ml contributed by the sex + climate multipliers. */
  adjustmentMl: number
  totalMl: number
  liters: number
  ounces: number
  perHourMl: number
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

export function toKilograms(weight: number, unit: WeightUnit): number {
  return unit === "lb" ? weight * LB_TO_KG : weight
}

export function computeWaterIntake(input: WaterIntakeInput): WaterIntakeResult | null {
  const { weight, weightUnit, activityMinutes, sex, climate } = input

  if (!isPositive(weight)) {
    return null
  }

  const activity = Number.isFinite(activityMinutes) && activityMinutes >= 0 ? activityMinutes : 0

  const weightKg = toKilograms(weight, weightUnit)
  const baseMl = weightKg * ML_PER_KG
  const activityExtraMl = activity * ML_PER_ACTIVE_MINUTE

  const subtotal = baseMl + activityExtraMl
  const multiplier = SEX_FACTOR[sex] * CLIMATE_FACTOR[climate]
  const totalMl = subtotal * multiplier
  const adjustmentMl = totalMl - subtotal

  return {
    baseMl,
    activityExtraMl,
    adjustmentMl,
    totalMl,
    liters: totalMl / 1000,
    ounces: totalMl / ML_PER_OZ,
    perHourMl: totalMl / WAKING_HOURS,
  }
}

export interface DrinkSlot {
  /** Hour offset within the waking window (0-based). */
  hour: number
  cups: number
}

/**
 * Spreads `cups` total cups across `WAKING_HOURS`, returning a per-hour cup
 * count whose sum equals `cups` (rounded to the nearest whole cup).
 */
export function buildDrinkSchedule(totalMl: number, cupSizeMl: number): DrinkSlot[] {
  if (!isPositive(totalMl) || !isPositive(cupSizeMl)) {
    return []
  }

  const totalCups = Math.max(1, Math.round(totalMl / cupSizeMl))
  const slots: DrinkSlot[] = Array.from({ length: WAKING_HOURS }, (_, hour) => ({ hour, cups: 0 }))

  // Evenly distribute by walking a fractional step so cups land at spaced hours.
  const step = WAKING_HOURS / totalCups
  for (let i = 0; i < totalCups; i++) {
    const hour = Math.min(WAKING_HOURS - 1, Math.floor(i * step))
    slots[hour] = { ...slots[hour], cups: slots[hour].cups + 1 }
  }

  return slots
}
