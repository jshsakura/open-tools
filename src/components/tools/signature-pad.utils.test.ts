import { describe, expect, it } from "vitest"

import { exportFileName, midPoint, strokeToPath } from "./signature-pad.utils"

describe("midPoint", () => {
  it("returns the average of two points", () => {
    // Arrange
    const a = { x: 0, y: 0 }
    const b = { x: 10, y: 20 }

    // Act
    const mid = midPoint(a, b)

    // Assert
    expect(mid).toEqual({ x: 5, y: 10 })
  })

  it("handles negative coordinates", () => {
    expect(midPoint({ x: -4, y: 2 }, { x: 4, y: -6 })).toEqual({ x: 0, y: -2 })
  })

  it("returns the same point when both inputs are equal", () => {
    expect(midPoint({ x: 3, y: 3 }, { x: 3, y: 3 })).toEqual({ x: 3, y: 3 })
  })
})

describe("strokeToPath", () => {
  it("returns an empty string for no points", () => {
    expect(strokeToPath([])).toBe("")
  })

  it("renders a single point as a dot", () => {
    expect(strokeToPath([{ x: 5, y: 7 }])).toBe("M 5 7 L 5 7")
  })

  it("renders two points as a straight line", () => {
    const path = strokeToPath([
      { x: 0, y: 0 },
      { x: 10, y: 10 },
    ])
    expect(path).toBe("M 0 0 L 10 10")
  })

  it("uses quadratic curves through midpoints for 3+ points", () => {
    // Arrange
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 20, y: 0 },
    ]

    // Act
    const path = strokeToPath(points)

    // Assert: midpoint between (10,0) and (20,0) is (15,0)
    expect(path).toBe("M 0 0 Q 10 0 15 0 L 20 0")
  })

  it("always starts with a move to the first point", () => {
    const path = strokeToPath([
      { x: 2, y: 3 },
      { x: 4, y: 5 },
      { x: 6, y: 7 },
      { x: 8, y: 9 },
    ])
    expect(path.startsWith("M 2 3")).toBe(true)
  })
})

describe("exportFileName", () => {
  it("formats a timestamped png filename", () => {
    // Arrange: 2026-06-20 14:30:15 (month is 0-indexed)
    const date = new Date(2026, 5, 20, 14, 30, 15)

    // Act
    const name = exportFileName("signature", date)

    // Assert
    expect(name).toBe("signature-20260620-143015.png")
  })

  it("zero-pads month, day, and time components", () => {
    const date = new Date(2026, 0, 5, 3, 4, 9)
    expect(exportFileName("sig", date)).toBe("sig-20260105-030409.png")
  })

  it("sanitises the prefix to lowercase dashed slug", () => {
    const date = new Date(2026, 5, 20, 0, 0, 0)
    expect(exportFileName("My Signature!", date)).toBe(
      "my-signature-20260620-000000.png",
    )
  })

  it("falls back to 'signature' for an empty prefix", () => {
    const date = new Date(2026, 5, 20, 0, 0, 0)
    expect(exportFileName("   ", date)).toBe("signature-20260620-000000.png")
  })

  it("always ends with .png", () => {
    expect(exportFileName("anything").endsWith(".png")).toBe(true)
  })
})
