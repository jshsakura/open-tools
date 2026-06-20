import { describe, expect, it } from "vitest"

import { computeVat } from "./vat-calculator.utils"

describe("computeVat — addVat mode", () => {
  it("adds 10% VAT to a net amount (10000 → net 10000, vat 1000, gross 11000)", () => {
    // Arrange
    const amount = 10000
    const rate = 10

    // Act
    const result = computeVat(amount, rate, "addVat")

    // Assert
    expect(result).toEqual({ net: 10000, vat: 1000, gross: 11000 })
  })

  it("adds a custom 20% VAT rate", () => {
    // Arrange / Act
    const result = computeVat(5000, 20, "addVat")

    // Assert
    expect(result.net).toBe(5000)
    expect(result.vat).toBe(1000)
    expect(result.gross).toBe(6000)
  })

  it("treats a 0% rate as no VAT, so gross equals net", () => {
    // Act
    const result = computeVat(7777, 0, "addVat")

    // Assert
    expect(result).toEqual({ net: 7777, vat: 0, gross: 7777 })
  })

  it("returns all zeros for a 0 amount", () => {
    // Act
    const result = computeVat(0, 10, "addVat")

    // Assert
    expect(result).toEqual({ net: 0, vat: 0, gross: 0 })
  })

  it("supports fractional rates (8.5%)", () => {
    // Act
    const result = computeVat(2000, 8.5, "addVat")

    // Assert
    expect(result.net).toBe(2000)
    expect(result.vat).toBeCloseTo(170, 10)
    expect(result.gross).toBeCloseTo(2170, 10)
  })
})

describe("computeVat — extractVat mode", () => {
  it("extracts 10% VAT from a gross amount (11000 → net 10000, vat 1000, gross 11000)", () => {
    // Act
    const result = computeVat(11000, 10, "extractVat")

    // Assert
    expect(result.gross).toBe(11000)
    expect(result.net).toBeCloseTo(10000, 6)
    expect(result.vat).toBeCloseTo(1000, 6)
  })

  it("extracts a custom 25% VAT rate", () => {
    // Act
    const result = computeVat(1250, 25, "extractVat")

    // Assert
    expect(result.gross).toBe(1250)
    expect(result.net).toBeCloseTo(1000, 6)
    expect(result.vat).toBeCloseTo(250, 6)
  })

  it("treats a 0% rate as no VAT, so net equals gross", () => {
    // Act
    const result = computeVat(9000, 0, "extractVat")

    // Assert
    expect(result).toEqual({ net: 9000, vat: 0, gross: 9000 })
  })

  it("returns all zeros for a 0 amount", () => {
    // Act
    const result = computeVat(0, 10, "extractVat")

    // Assert
    expect(result).toEqual({ net: 0, vat: 0, gross: 0 })
  })
})

describe("computeVat — invariants and edge cases", () => {
  it("round-trips: addVat then extractVat recovers the original net amount", () => {
    // Arrange
    const originalNet = 12345
    const rate = 10

    // Act
    const added = computeVat(originalNet, rate, "addVat")
    const extracted = computeVat(added.gross, rate, "extractVat")

    // Assert
    expect(extracted.net).toBeCloseTo(originalNet, 6)
    expect(extracted.gross).toBe(added.gross)
  })

  it("keeps net + vat === gross for addVat", () => {
    // Act
    const result = computeVat(33333, 13, "addVat")

    // Assert
    expect(result.net + result.vat).toBeCloseTo(result.gross, 6)
  })

  it("keeps net + vat === gross for extractVat", () => {
    // Act
    const result = computeVat(33333, 13, "extractVat")

    // Assert
    expect(result.net + result.vat).toBeCloseTo(result.gross, 6)
  })

  it("returns all zeros when amount is NaN", () => {
    // Act
    const result = computeVat(NaN, 10, "addVat")

    // Assert
    expect(result).toEqual({ net: 0, vat: 0, gross: 0 })
  })

  it("returns all zeros when rate is NaN", () => {
    // Act
    const result = computeVat(10000, NaN, "addVat")

    // Assert
    expect(result).toEqual({ net: 0, vat: 0, gross: 0 })
  })
})
