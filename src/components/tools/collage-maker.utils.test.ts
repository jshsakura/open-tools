import { describe, it, expect } from "vitest"
import { computeCells, computeCanvasSize, ASPECT_RATIOS } from "./collage-maker.utils"

describe("computeCells", () => {
  it("returns one cell per grid slot (cols * rows)", () => {
    expect(computeCells(1000, 1000, 2, 2, 10)).toHaveLength(4)
    expect(computeCells(1000, 1000, 3, 2, 10)).toHaveLength(6)
    expect(computeCells(1000, 1000, 4, 1, 0)).toHaveLength(4)
  })

  it("returns an empty array for non-positive dimensions", () => {
    expect(computeCells(1000, 1000, 0, 2, 10)).toEqual([])
    expect(computeCells(1000, 1000, 2, 0, 10)).toEqual([])
  })

  it("applies the gap as both outer margin and inner spacing", () => {
    const gap = 10
    const cells = computeCells(1000, 1000, 2, 1, gap)
    // outer margin on the left equals the gap
    expect(cells[0].x).toBe(gap)
    expect(cells[0].y).toBe(gap)
    // two cells + three gaps (outer, inner, outer) span the full width
    const totalWidth = cells[0].w * 2 + gap * 3
    expect(totalWidth).toBeCloseTo(1000)
  })

  it("computes correct cell size for a 2x2 grid with gap", () => {
    const gap = 20
    const cells = computeCells(1000, 1000, 2, 2, gap)
    // (1000 - 20*3) / 2 = 470
    expect(cells[0].w).toBeCloseTo(470)
    expect(cells[0].h).toBeCloseTo(470)
  })

  it("handles non-square canvases with distinct cell width and height", () => {
    const cells = computeCells(1600, 900, 2, 1, 0)
    expect(cells).toHaveLength(2)
    expect(cells[0].w).toBeCloseTo(800)
    expect(cells[0].h).toBeCloseTo(900)
    expect(cells[1].x).toBeCloseTo(800)
  })

  it("keeps every cell within the canvas bounds", () => {
    const width = 1200
    const height = 675
    const gap = 16
    const cells = computeCells(width, height, 3, 2, gap)
    for (const c of cells) {
      expect(c.x).toBeGreaterThanOrEqual(0)
      expect(c.y).toBeGreaterThanOrEqual(0)
      expect(c.x + c.w).toBeLessThanOrEqual(width + 0.0001)
      expect(c.y + c.h).toBeLessThanOrEqual(height + 0.0001)
    }
  })

  it("places cells in row-major order", () => {
    const cells = computeCells(900, 900, 3, 2, 0)
    // second cell is to the right of the first (same row)
    expect(cells[1].x).toBeGreaterThan(cells[0].x)
    expect(cells[1].y).toBeCloseTo(cells[0].y)
    // fourth cell starts a new row below the first
    expect(cells[3].y).toBeGreaterThan(cells[0].y)
    expect(cells[3].x).toBeCloseTo(cells[0].x)
  })

  it("never returns negative cell sizes when gap exceeds canvas", () => {
    const cells = computeCells(50, 50, 4, 4, 40)
    for (const c of cells) {
      expect(c.w).toBeGreaterThanOrEqual(0)
      expect(c.h).toBeGreaterThanOrEqual(0)
    }
  })
})

describe("computeCanvasSize", () => {
  it("returns a square for 1:1", () => {
    expect(computeCanvasSize(1200, 1, 1)).toEqual({ width: 1200, height: 1200 })
  })

  it("scales height down for landscape ratios", () => {
    expect(computeCanvasSize(1600, 16, 9)).toEqual({ width: 1600, height: 900 })
    expect(computeCanvasSize(1200, 4, 3)).toEqual({ width: 1200, height: 900 })
  })

  it("scales width down for portrait ratios", () => {
    expect(computeCanvasSize(1600, 9, 16)).toEqual({ width: 900, height: 1600 })
    expect(computeCanvasSize(1200, 3, 4)).toEqual({ width: 900, height: 1200 })
  })

  it("covers every catalog aspect ratio without exceeding the base size", () => {
    for (const r of ASPECT_RATIOS) {
      const { width, height } = computeCanvasSize(1000, r.ratioW, r.ratioH)
      expect(Math.max(width, height)).toBe(1000)
      expect(width).toBeGreaterThan(0)
      expect(height).toBeGreaterThan(0)
    }
  })
})
