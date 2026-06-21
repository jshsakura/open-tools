import { describe, expect, it } from "vitest"

import {
  CANVAS_SIZE,
  createRng,
  generateBlobPath,
  generateCornerPath,
  generateLayeredWavePaths,
  generatePolygonPath,
  generateShape,
  generateStarPath,
  generateWavePath,
  SHAPE_TYPES,
} from "./svg-shapes-generator.utils"

// Counts the occurrences of a single-letter SVG command in a path string.
function countCommands(d: string, letter: string): number {
  return (d.match(new RegExp(`\\b${letter}\\b`, "g")) || []).length
}

// A path is "valid" enough if it starts with a move and contains only finite numbers.
function isValidPath(d: string): boolean {
  if (!/^M /.test(d)) return false
  const numbers = d.match(/-?\d+(\.\d+)?/g) || []
  return numbers.length > 0 && numbers.every((n) => Number.isFinite(Number(n)))
}

describe("createRng", () => {
  it("is deterministic for the same seed", () => {
    const a = createRng(0.5)
    const b = createRng(0.5)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })

  it("produces different sequences for different seeds", () => {
    const a = createRng(0.1)
    const b = createRng(0.9)
    expect(a()).not.toBe(b())
  })

  it("stays within the [0, 1) range", () => {
    const rng = createRng(0.42)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe("generateBlobPath", () => {
  it("is deterministic for the same seed", () => {
    expect(generateBlobPath(3, 0.5)).toBe(generateBlobPath(3, 0.5))
  })

  it("changes with the seed", () => {
    expect(generateBlobPath(3, 0.5)).not.toBe(generateBlobPath(3, 0.51))
  })

  it("produces a valid closed path", () => {
    const d = generateBlobPath(4, 0.3)
    expect(isValidPath(d)).toBe(true)
    expect(d.endsWith("Z")).toBe(true)
  })
})

describe("generateWavePath", () => {
  it("is deterministic and valid", () => {
    const d = generateWavePath(4, 0.2, CANVAS_SIZE * 0.5)
    expect(d).toBe(generateWavePath(4, 0.2, CANVAS_SIZE * 0.5))
    expect(isValidPath(d)).toBe(true)
    expect(d.endsWith("Z")).toBe(true)
  })

  it("uses more quadratic segments for higher complexity", () => {
    const low = countCommands(generateWavePath(2, 0.2, 100), "Q")
    const high = countCommands(generateWavePath(8, 0.2, 100), "Q")
    expect(high).toBeGreaterThan(low)
  })
})

describe("generateLayeredWavePaths", () => {
  it("returns three distinct valid layers", () => {
    const paths = generateLayeredWavePaths(4, 0.5)
    expect(paths).toHaveLength(3)
    expect(paths.every(isValidPath)).toBe(true)
    expect(new Set(paths).size).toBe(3)
  })
})

describe("generatePolygonPath", () => {
  it("creates exactly `sides` vertices (sides-1 line segments + move)", () => {
    const d = generatePolygonPath(5)
    // M + (sides-1) L commands.
    expect(countCommands(d, "L")).toBe(4)
    expect(isValidPath(d)).toBe(true)
  })

  it("never drops below 3 sides", () => {
    const d = generatePolygonPath(1)
    expect(countCommands(d, "L")).toBe(2)
  })
})

describe("generateStarPath", () => {
  it("creates 2 * points vertices", () => {
    const points = 5
    const d = generateStarPath(points)
    // M + (2*points - 1) L commands.
    expect(countCommands(d, "L")).toBe(points * 2 - 1)
    expect(isValidPath(d)).toBe(true)
  })
})

describe("generateCornerPath", () => {
  it("is deterministic and valid", () => {
    const d = generateCornerPath(3, 0.7)
    expect(d).toBe(generateCornerPath(3, 0.7))
    expect(isValidPath(d)).toBe(true)
  })
})

describe("generateShape", () => {
  it("returns at least one valid path for every shape type", () => {
    for (const type of SHAPE_TYPES) {
      const result = generateShape(type, 3, 0.5)
      expect(result.paths.length).toBeGreaterThan(0)
      expect(result.paths.every(isValidPath)).toBe(true)
    }
  })

  it("returns three paths for layered waves and one otherwise", () => {
    expect(generateShape("layeredWaves", 3, 0.5).paths).toHaveLength(3)
    expect(generateShape("blob", 3, 0.5).paths).toHaveLength(1)
  })

  it("is deterministic for a given seed", () => {
    expect(generateShape("blob", 4, 0.33)).toEqual(generateShape("blob", 4, 0.33))
  })
})
