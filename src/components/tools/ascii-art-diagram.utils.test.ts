import { describe, expect, it } from "vitest"

import {
  drawBox,
  insertAt,
  MIN_BOX_WIDTH,
  MIN_BOX_HEIGHT,
  MAX_BOX_WIDTH,
} from "./ascii-art-diagram.utils"

describe("drawBox", () => {
  it("draws a minimal 2x2 box with corners only", () => {
    expect(drawBox(2, 2)).toBe("┌┐\n└┘")
  })

  it("draws a box of the requested width and height", () => {
    const box = drawBox(4, 3)
    expect(box).toBe("┌──┐\n│  │\n└──┘")
  })

  it("produces height lines", () => {
    expect(drawBox(5, 4).split("\n")).toHaveLength(4)
  })

  it("each line has the requested width", () => {
    const lines = drawBox(6, 3).split("\n")
    expect(lines.every((l) => [...l].length === 6)).toBe(true)
  })

  it("clamps width and height below the minimum", () => {
    expect(drawBox(1, 1)).toBe(drawBox(MIN_BOX_WIDTH, MIN_BOX_HEIGHT))
  })

  it("clamps width above the maximum", () => {
    const lines = drawBox(9999, 3).split("\n")
    expect([...lines[0]]).toHaveLength(MAX_BOX_WIDTH)
  })

  it("floors fractional dimensions", () => {
    expect(drawBox(4.9, 3.9)).toBe(drawBox(4, 3))
  })
})

describe("insertAt", () => {
  it("inserts text at the caret position", () => {
    const result = insertAt("ac", 1, 1, "b")
    expect(result.text).toBe("abc")
    expect(result.caret).toBe(2)
  })

  it("replaces a selection range", () => {
    const result = insertAt("hello", 1, 4, "X")
    expect(result.text).toBe("hXo")
    expect(result.caret).toBe(2)
  })

  it("appends when caret is at the end", () => {
    const result = insertAt("abc", 3, 3, "!")
    expect(result.text).toBe("abc!")
    expect(result.caret).toBe(4)
  })

  it("clamps out-of-range positions without mutating the input", () => {
    const original = "abc"
    const result = insertAt(original, -5, 99, "Z")
    expect(result.text).toBe("Z")
    expect(original).toBe("abc")
  })
})
