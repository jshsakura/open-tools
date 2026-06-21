import { describe, expect, it } from "vitest"

import { computeFuelCost, toLitersPerKm, type FuelCostInput } from "./fuel-cost-calculator.utils"

const base: FuelCostInput = {
  distanceKm: 100,
  efficiency: 10,
  efficiencyUnit: "kmPerL",
  pricePerLiter: 1700,
  roundTrip: false,
  passengers: 1,
}

describe("toLitersPerKm — unit equivalence", () => {
  it("km/L: 10 km/L → 0.1 L/km", () => {
    expect(toLitersPerKm(10, "kmPerL")).toBeCloseTo(0.1, 10)
  })

  it("L/100km: 10 L/100km → 0.1 L/km (equivalent to 10 km/L)", () => {
    expect(toLitersPerKm(10, "lPer100km")).toBeCloseTo(0.1, 10)
  })

  it("mpg: ~23.5 mpg ≈ 10 km/L → ~0.1 L/km", () => {
    // 10 km/L = 10 * 3.785411784 / 1.609344 ≈ 23.521 mpg
    const mpg = (10 * 3.785411784) / 1.609344
    expect(toLitersPerKm(mpg, "mpg")).toBeCloseTo(0.1, 6)
  })

  it("returns null for non-positive efficiency", () => {
    expect(toLitersPerKm(0, "kmPerL")).toBeNull()
    expect(toLitersPerKm(NaN, "mpg")).toBeNull()
  })
})

describe("computeFuelCost — core math", () => {
  it("cost = distance / efficiency * price (100 km, 10 km/L, 1700)", () => {
    // Act: 100/10 = 10 L * 1700 = 17000
    const result = computeFuelCost(base)

    // Assert
    expect(result!.fuelNeeded).toBeCloseTo(10, 6)
    expect(result!.totalCost).toBeCloseTo(17000, 6)
  })

  it("produces identical cost across all three efficiency units", () => {
    const fromKmPerL = computeFuelCost(base)!
    const fromL100 = computeFuelCost({ ...base, efficiency: 10, efficiencyUnit: "lPer100km" })!
    const mpg = (10 * 3.785411784) / 1.609344
    const fromMpg = computeFuelCost({ ...base, efficiency: mpg, efficiencyUnit: "mpg" })!

    expect(fromL100.totalCost).toBeCloseTo(fromKmPerL.totalCost, 4)
    expect(fromMpg.totalCost).toBeCloseTo(fromKmPerL.totalCost, 4)
  })
})

describe("computeFuelCost — round trip and passengers", () => {
  it("doubles distance, fuel, and cost for a round trip", () => {
    // Act
    const oneWay = computeFuelCost(base)!
    const roundTrip = computeFuelCost({ ...base, roundTrip: true })!

    // Assert
    expect(roundTrip.distance).toBe(oneWay.distance * 2)
    expect(roundTrip.fuelNeeded).toBeCloseTo(oneWay.fuelNeeded * 2, 6)
    expect(roundTrip.totalCost).toBeCloseTo(oneWay.totalCost * 2, 6)
  })

  it("splits cost evenly across passengers", () => {
    // Act
    const result = computeFuelCost({ ...base, passengers: 4 })

    // Assert
    expect(result!.costPerPerson).toBeCloseTo(17000 / 4, 6)
  })

  it("treats zero or invalid passengers as a single person", () => {
    expect(computeFuelCost({ ...base, passengers: 0 })!.costPerPerson).toBeCloseTo(17000, 6)
    expect(computeFuelCost({ ...base, passengers: NaN })!.costPerPerson).toBeCloseTo(17000, 6)
  })
})

describe("computeFuelCost — invalid input", () => {
  it("returns null for non-positive distance", () => {
    expect(computeFuelCost({ ...base, distanceKm: 0 })).toBeNull()
  })

  it("returns null for non-positive price", () => {
    expect(computeFuelCost({ ...base, pricePerLiter: -1 })).toBeNull()
  })

  it("returns null for non-positive efficiency", () => {
    expect(computeFuelCost({ ...base, efficiency: 0 })).toBeNull()
  })
})
