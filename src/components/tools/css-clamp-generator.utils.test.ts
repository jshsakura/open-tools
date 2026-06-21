import { describe, expect, it } from "vitest"

import {
  buildClamp,
  clampSlope,
  clampIntersection,
  preferredSizeAt,
  clampedSizeAt,
  type ClampGeometry,
} from "./css-clamp-generator.utils"

// Reference case: 16px @ 320px viewport up to 32px @ 1280px viewport.
// slope = (32 - 16) / (1280 - 320) = 16 / 960 = 0.016666...
// intersection = 16 - slope * 320 = 16 - 5.3333... = 10.6666...
const REF: ClampGeometry = {
  minViewport: 320,
  maxViewport: 1280,
  minSize: 16,
  maxSize: 32,
}

describe("clampSlope", () => {
  it("computes the linear slope between breakpoints", () => {
    expect(clampSlope(REF)).toBeCloseTo(16 / 960, 10)
  })

  it("returns 0 when the viewport range is degenerate", () => {
    expect(clampSlope({ ...REF, maxViewport: 320 })).toBe(0)
  })
})

describe("clampIntersection", () => {
  it("computes the y-intercept (size at viewport 0)", () => {
    expect(clampIntersection(REF)).toBeCloseTo(32 / 3, 10)
  })

  it("equals minSize when min and max sizes are equal", () => {
    expect(clampIntersection({ ...REF, maxSize: 16 })).toBe(16)
  })
})

describe("preferredSizeAt", () => {
  it("follows preferred = slope*vw + intersection", () => {
    const slope = clampSlope(REF)
    const intersection = clampIntersection(REF)
    const vw = 800
    expect(preferredSizeAt(REF, vw)).toBeCloseTo(slope * vw + intersection, 10)
  })

  it("equals minSize at the min viewport", () => {
    expect(preferredSizeAt(REF, REF.minViewport)).toBeCloseTo(REF.minSize, 10)
  })

  it("equals maxSize at the max viewport", () => {
    expect(preferredSizeAt(REF, REF.maxViewport)).toBeCloseTo(REF.maxSize, 10)
  })

  it("returns the midpoint size at the midpoint viewport", () => {
    expect(preferredSizeAt(REF, 800)).toBeCloseTo(24, 10)
  })
})

describe("clampedSizeAt boundary behavior", () => {
  it("clamps to minSize below the min viewport", () => {
    expect(clampedSizeAt(REF, 100)).toBe(16)
  })

  it("clamps to maxSize above the max viewport", () => {
    expect(clampedSizeAt(REF, 2000)).toBe(32)
  })

  it("returns minSize exactly at the min viewport", () => {
    expect(clampedSizeAt(REF, REF.minViewport)).toBeCloseTo(16, 10)
  })

  it("returns maxSize exactly at the max viewport", () => {
    expect(clampedSizeAt(REF, REF.maxViewport)).toBeCloseTo(32, 10)
  })

  it("follows the preferred value inside the range", () => {
    expect(clampedSizeAt(REF, 800)).toBeCloseTo(24, 10)
  })

  it("respects the lower/upper bounds when sizes are inverted (max < min)", () => {
    // With min=32, max=16 the slope is negative, so the preferred value
    // extrapolates ABOVE 32 below the min viewport and BELOW 16 above the max
    // viewport. The clamp bounds are always the numeric min/max of the sizes.
    const inverted: ClampGeometry = { ...REF, minSize: 32, maxSize: 16 }
    expect(clampedSizeAt(inverted, 100)).toBe(32)
    expect(clampedSizeAt(inverted, 2000)).toBe(16)
    // At the breakpoints it sits exactly on the declared sizes.
    expect(clampedSizeAt(inverted, REF.minViewport)).toBeCloseTo(32, 10)
    expect(clampedSizeAt(inverted, REF.maxViewport)).toBeCloseTo(16, 10)
  })
})

describe("buildClamp", () => {
  it("produces a clamp() with rem bounds and a vw preferred value", () => {
    expect(buildClamp({ ...REF, rootFontSize: 16 })).toBe(
      "clamp(1rem, 0.6667rem + 1.6667vw, 2rem)",
    )
  })

  it("omits the rem term when the intersection is zero", () => {
    // minSize 0 @ viewport 0 baseline -> intersection 0.
    const out = buildClamp({
      minViewport: 0,
      maxViewport: 1000,
      minSize: 0,
      maxSize: 10,
      rootFontSize: 16,
    })
    expect(out).toBe("clamp(0rem, 1vw, 0.625rem)")
  })

  it("returns null for a degenerate viewport range", () => {
    expect(
      buildClamp({ ...REF, maxViewport: 320, rootFontSize: 16 }),
    ).toBeNull()
  })

  it("returns null for a non-positive root font size", () => {
    expect(buildClamp({ ...REF, rootFontSize: 0 })).toBeNull()
  })
})
