import { describe, it, expect } from "vitest"
import {
  hexToRgb,
  rgbToHex,
  generateColorScale,
  SHADES,
} from "./tailwind-config-builder.utils"

describe("hexToRgb", () => {
  it("parses a 6-digit hex", () => {
    expect(hexToRgb("#3b82f6")).toEqual({ r: 59, g: 130, b: 246 })
  })
  it("parses a hex without leading hash", () => {
    expect(hexToRgb("ffffff")).toEqual({ r: 255, g: 255, b: 255 })
  })
  it("expands a 3-digit shorthand", () => {
    expect(hexToRgb("#fff")).toEqual({ r: 255, g: 255, b: 255 })
  })
  it("returns null for invalid input", () => {
    expect(hexToRgb("#zzz")).toBeNull()
    expect(hexToRgb("not-a-color")).toBeNull()
  })
})

describe("rgbToHex", () => {
  it("round-trips a known color", () => {
    expect(rgbToHex({ r: 59, g: 130, b: 246 })).toBe("#3b82f6")
  })
  it("clamps out-of-range channels", () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe("#ff0080")
  })
})

describe("generateColorScale", () => {
  it("produces all ten shades", () => {
    const scale = generateColorScale("#3b82f6")
    expect(Object.keys(scale).map(Number)).toEqual([...SHADES])
  })
  it("uses the base color for the 500 shade", () => {
    expect(generateColorScale("#3b82f6")[500]).toBe("#3b82f6")
  })
  it("makes low shades lighter than the base", () => {
    const scale = generateColorScale("#3b82f6")
    expect(scale[50]).not.toBe(scale[500])
    // 50 is near-white: all channels should be high.
    const rgb = hexToRgb(scale[50])!
    expect(rgb.r).toBeGreaterThan(200)
    expect(rgb.g).toBeGreaterThan(200)
    expect(rgb.b).toBeGreaterThan(200)
  })
  it("makes high shades darker than the base", () => {
    const scale = generateColorScale("#3b82f6")
    const rgb = hexToRgb(scale[900])!
    const base = hexToRgb(scale[500])!
    expect(rgb.r).toBeLessThan(base.r)
    expect(rgb.b).toBeLessThan(base.b)
  })
  it("falls back to a neutral scale for invalid hex", () => {
    const scale = generateColorScale("invalid")
    expect(scale[500]).toBe("#64748b")
  })
})
