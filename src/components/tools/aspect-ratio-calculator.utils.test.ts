import { describe, it, expect } from "vitest"
import {
  gcd,
  reduceRatio,
  solveHeight,
  solveWidth,
  toTailwindAspect,
  toCssAspect,
} from "./aspect-ratio-calculator.utils"

describe("gcd", () => {
  it("computes the greatest common divisor", () => {
    expect(gcd(1920, 1080)).toBe(120)
  })
  it("returns the other value when one is zero", () => {
    expect(gcd(12, 0)).toBe(12)
    expect(gcd(0, 9)).toBe(9)
  })
  it("handles negatives via absolute value", () => {
    expect(gcd(-16, -9)).toBe(1)
  })
})

describe("reduceRatio", () => {
  it("reduces 1920x1080 to 16:9", () => {
    expect(reduceRatio(1920, 1080)).toEqual({ w: 16, h: 9 })
  })
  it("reduces 1280x960 to 4:3", () => {
    expect(reduceRatio(1280, 960)).toEqual({ w: 4, h: 3 })
  })
  it("reduces a square to 1:1", () => {
    expect(reduceRatio(500, 500)).toEqual({ w: 1, h: 1 })
  })
  it("returns null for zero or negative dimensions", () => {
    expect(reduceRatio(0, 1080)).toBeNull()
    expect(reduceRatio(1920, 0)).toBeNull()
    expect(reduceRatio(-1920, 1080)).toBeNull()
  })
})

describe("solveHeight", () => {
  it("solves height from width and ratio", () => {
    expect(solveHeight(1920, { w: 16, h: 9 })).toBe(1080)
  })
  it("returns null for invalid ratio width", () => {
    expect(solveHeight(1920, { w: 0, h: 9 })).toBeNull()
  })
  it("returns null for non-positive width", () => {
    expect(solveHeight(0, { w: 16, h: 9 })).toBeNull()
  })
})

describe("solveWidth", () => {
  it("solves width from height and ratio", () => {
    expect(solveWidth(1080, { w: 16, h: 9 })).toBe(1920)
  })
  it("returns null for invalid ratio height", () => {
    expect(solveWidth(1080, { w: 16, h: 0 })).toBeNull()
  })
  it("returns null for non-positive height", () => {
    expect(solveWidth(0, { w: 16, h: 9 })).toBeNull()
  })
})

describe("toTailwindAspect", () => {
  it("maps 16:9 to aspect-video", () => {
    expect(toTailwindAspect({ w: 16, h: 9 })).toBe("aspect-video")
  })
  it("maps 1:1 to aspect-square", () => {
    expect(toTailwindAspect({ w: 1, h: 1 })).toBe("aspect-square")
  })
  it("falls back to arbitrary value for uncommon ratios", () => {
    expect(toTailwindAspect({ w: 21, h: 9 })).toBe("aspect-[21/9]")
  })
  it("returns empty string for null", () => {
    expect(toTailwindAspect(null)).toBe("")
  })
})

describe("toCssAspect", () => {
  it("formats a CSS aspect-ratio declaration", () => {
    expect(toCssAspect({ w: 16, h: 9 })).toBe("aspect-ratio: 16 / 9;")
  })
  it("returns empty string for null", () => {
    expect(toCssAspect(null)).toBe("")
  })
})
