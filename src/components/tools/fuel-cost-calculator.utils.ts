export type EfficiencyUnit = "kmPerL" | "lPer100km" | "mpg"

/** US gallon in liters. */
const LITERS_PER_GALLON = 3.785411784
const KM_PER_MILE = 1.609344

export interface FuelCostInput {
  distanceKm: number
  efficiency: number
  efficiencyUnit: EfficiencyUnit
  pricePerLiter: number
  roundTrip: boolean
  passengers: number
}

export interface FuelCostResult {
  /** Effective distance after round-trip doubling. */
  distance: number
  fuelNeeded: number
  totalCost: number
  costPerPerson: number
}

function isPositive(value: number): boolean {
  return Number.isFinite(value) && value > 0
}

/**
 * Normalizes any supported efficiency unit to liters consumed per kilometer.
 * - kmPerL: liters/km = 1 / kmPerL
 * - lPer100km: liters/km = value / 100
 * - mpg: convert to km/L first, then invert
 */
export function toLitersPerKm(efficiency: number, unit: EfficiencyUnit): number | null {
  if (!isPositive(efficiency)) {
    return null
  }

  if (unit === "kmPerL") {
    return 1 / efficiency
  }

  if (unit === "lPer100km") {
    return efficiency / 100
  }

  // mpg → km/L: miles/gallon * (km/mile) / (L/gallon)
  const kmPerL = (efficiency * KM_PER_MILE) / LITERS_PER_GALLON
  return 1 / kmPerL
}

export function computeFuelCost(input: FuelCostInput): FuelCostResult | null {
  const { distanceKm, efficiency, efficiencyUnit, pricePerLiter, roundTrip, passengers } = input

  if (!isPositive(distanceKm) || !isPositive(pricePerLiter)) {
    return null
  }

  const litersPerKm = toLitersPerKm(efficiency, efficiencyUnit)
  if (litersPerKm === null) {
    return null
  }

  const distance = roundTrip ? distanceKm * 2 : distanceKm
  const fuelNeeded = distance * litersPerKm
  const totalCost = fuelNeeded * pricePerLiter
  const people = Number.isFinite(passengers) && passengers > 0 ? passengers : 1
  const costPerPerson = totalCost / people

  return { distance, fuelNeeded, totalCost, costPerPerson }
}
