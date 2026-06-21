export type Sex = "male" | "female"
export type ActivityLevel = "low" | "light" | "moderate" | "high"
export type Goal = "lose" | "maintain" | "gain"

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  low: 1.2,
  light: 1.375,
  moderate: 1.55,
  high: 1.725,
}

// Calorie adjustment applied to TDEE per goal (kcal/day).
export const GOAL_ADJUSTMENTS: Record<Goal, number> = {
  lose: -500,
  maintain: 0,
  gain: 350,
}

// Standard macro split (% of calories) per goal: [protein, carbs, fat].
export const MACRO_SPLITS: Record<Goal, { protein: number; carbs: number; fat: number }> = {
  lose: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  gain: { protein: 0.3, carbs: 0.45, fat: 0.25 },
}

// Calories per gram of each macronutrient.
export const KCAL_PER_GRAM_PROTEIN = 4
export const KCAL_PER_GRAM_CARBS = 4
export const KCAL_PER_GRAM_FAT = 9

const KG_PER_LB = 0.45359237
const CM_PER_INCH = 2.54
const INCHES_PER_FOOT = 12

/** Convert feet + inches to centimeters. */
export function feetInchesToCm(feet: number, inches: number): number {
  return (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH
}

/** Convert pounds to kilograms. */
export function lbToKg(lb: number): number {
  return lb * KG_PER_LB
}

/**
 * Mifflin-St Jeor basal metabolic rate.
 * weightKg, heightCm, age in years.
 */
export function mifflinStJeorBmr(sex: Sex, weightKg: number, heightCm: number, age: number): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return sex === "male" ? base + 5 : base - 161
}

/** Total daily energy expenditure = BMR * activity multiplier. */
export function tdee(bmr: number, activity: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity]
}

export interface MacroGrams {
  protein: number
  carbs: number
  fat: number
}

/** Split target calories into macro grams using the goal's standard split. */
export function macroGrams(targetCalories: number, goal: Goal): MacroGrams {
  const split = MACRO_SPLITS[goal]
  return {
    protein: (targetCalories * split.protein) / KCAL_PER_GRAM_PROTEIN,
    carbs: (targetCalories * split.carbs) / KCAL_PER_GRAM_CARBS,
    fat: (targetCalories * split.fat) / KCAL_PER_GRAM_FAT,
  }
}

export interface CalorieInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
}

export interface CalorieResult {
  bmr: number
  maintenance: number
  targetCalories: number
  macros: MacroGrams
}

/**
 * Compute BMR, maintenance TDEE, goal-adjusted target and macros.
 * Returns null for non-positive or non-finite inputs.
 */
export function computeCalories(input: CalorieInput): CalorieResult | null {
  const { sex, age, heightCm, weightKg, activity, goal } = input
  if (
    !Number.isFinite(age) ||
    !Number.isFinite(heightCm) ||
    !Number.isFinite(weightKg) ||
    age <= 0 ||
    heightCm <= 0 ||
    weightKg <= 0
  ) {
    return null
  }

  const bmr = mifflinStJeorBmr(sex, weightKg, heightCm, age)
  const maintenance = tdee(bmr, activity)
  const targetCalories = Math.max(0, maintenance + GOAL_ADJUSTMENTS[goal])

  return {
    bmr,
    maintenance,
    targetCalories,
    macros: macroGrams(targetCalories, goal),
  }
}
