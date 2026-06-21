import { describe, it, expect } from "vitest"
import { scaleToWidth, scaleToHeight, scaleByPercent } from "./image-resizer.utils"

describe("scaleToWidth", () => {
  it("locks height to the aspect ratio", () => {
    expect(scaleToWidth(800, 16 / 9)).toEqual({ width: 800, height: 450 })
  })
  it("rounds the derived height", () => {
    expect(scaleToWidth(100, 3)).toEqual({ width: 100, height: 33 })
  })
  it("returns zero height for non-positive width", () => {
    expect(scaleToWidth(0, 1.5)).toEqual({ width: 0, height: 0 })
  })
  it("returns zero height for non-positive aspect ratio", () => {
    expect(scaleToWidth(500, 0)).toEqual({ width: 500, height: 0 })
  })
})

describe("scaleToHeight", () => {
  it("locks width to the aspect ratio", () => {
    expect(scaleToHeight(450, 16 / 9)).toEqual({ width: 800, height: 450 })
  })
  it("rounds the derived width", () => {
    expect(scaleToHeight(33, 3)).toEqual({ width: 99, height: 33 })
  })
  it("returns zero width for non-positive height", () => {
    expect(scaleToHeight(0, 1.5)).toEqual({ width: 0, height: 0 })
  })
})

describe("scaleByPercent", () => {
  it("halves both dimensions at 50%", () => {
    expect(scaleByPercent(1000, 800, 50)).toEqual({ width: 500, height: 400 })
  })
  it("keeps dimensions at 100%", () => {
    expect(scaleByPercent(1920, 1080, 100)).toEqual({ width: 1920, height: 1080 })
  })
  it("rounds scaled dimensions", () => {
    expect(scaleByPercent(101, 101, 25)).toEqual({ width: 25, height: 25 })
  })
  it("clamps to a minimum of 1px when source is positive", () => {
    expect(scaleByPercent(2, 2, 1)).toEqual({ width: 1, height: 1 })
  })
  it("returns zero for zero percent", () => {
    expect(scaleByPercent(1000, 800, 0)).toEqual({ width: 0, height: 0 })
  })
})
