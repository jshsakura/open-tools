export type TemperatureUnit = "C" | "F" | "K"

/** Rankine is included as a derived display unit alongside the four base units. */
export type DisplayUnit = TemperatureUnit | "R"

export const ABSOLUTE_ZERO_C = -273.15

export function toCelsius(value: number, unit: TemperatureUnit): number {
  if (unit === "C") return value
  if (unit === "F") return (value - 32) * (5 / 9)
  return value - 273.15
}

export function fromCelsius(value: number, unit: DisplayUnit): number {
  if (unit === "C") return value
  if (unit === "F") return (value * 9) / 5 + 32
  if (unit === "K") return value + 273.15
  // Rankine = (Celsius + 273.15) * 9/5
  return (value + 273.15) * (9 / 5)
}

export interface TemperatureConversion {
  celsius: number
  C: number
  F: number
  K: number
  R: number
}

export function convertTemperature(value: number, fromUnit: TemperatureUnit): TemperatureConversion | null {
  if (!Number.isFinite(value)) {
    return null
  }

  const celsius = toCelsius(value, fromUnit)

  return {
    celsius,
    C: celsius,
    F: fromCelsius(celsius, "F"),
    K: fromCelsius(celsius, "K"),
    R: fromCelsius(celsius, "R"),
  }
}
