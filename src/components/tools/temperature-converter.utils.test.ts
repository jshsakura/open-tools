import { describe, expect, it } from "vitest"

import { convertTemperature, fromCelsius, toCelsius } from "./temperature-converter.utils"

describe("convertTemperature — known reference points", () => {
  it("0°C = 32°F = 273.15K = 491.67°R", () => {
    // Act
    const result = convertTemperature(0, "C")

    // Assert
    expect(result!.F).toBeCloseTo(32, 6)
    expect(result!.K).toBeCloseTo(273.15, 6)
    expect(result!.R).toBeCloseTo(491.67, 6)
  })

  it("100°C = 212°F = 373.15K", () => {
    // Act
    const result = convertTemperature(100, "C")

    // Assert
    expect(result!.F).toBeCloseTo(212, 6)
    expect(result!.K).toBeCloseTo(373.15, 6)
  })

  it("converts from Fahrenheit back to Celsius (212°F → 100°C)", () => {
    // Act
    const result = convertTemperature(212, "F")

    // Assert
    expect(result!.C).toBeCloseTo(100, 6)
    expect(result!.K).toBeCloseTo(373.15, 6)
  })

  it("converts from Kelvin (273.15K → 0°C / 32°F)", () => {
    // Act
    const result = convertTemperature(273.15, "K")

    // Assert
    expect(result!.C).toBeCloseTo(0, 6)
    expect(result!.F).toBeCloseTo(32, 6)
  })

  it("absolute zero is 0K and 0°R (-273.15°C)", () => {
    // Act
    const result = convertTemperature(-273.15, "C")

    // Assert
    expect(result!.K).toBeCloseTo(0, 6)
    expect(result!.R).toBeCloseTo(0, 6)
  })
})

describe("toCelsius / fromCelsius helpers", () => {
  it("toCelsius is the inverse of fromCelsius for F", () => {
    expect(toCelsius(98.6, "F")).toBeCloseTo(37, 6)
    expect(fromCelsius(37, "F")).toBeCloseTo(98.6, 6)
  })

  it("computes Rankine via fromCelsius (25°C → 536.67°R)", () => {
    expect(fromCelsius(25, "R")).toBeCloseTo(536.67, 6)
  })
})

describe("convertTemperature — invalid input", () => {
  it("returns null for NaN", () => {
    expect(convertTemperature(NaN, "C")).toBeNull()
  })
})
