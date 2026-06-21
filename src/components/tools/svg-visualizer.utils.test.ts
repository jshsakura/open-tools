import { describe, expect, it } from "vitest"

import { describeSegment, isCommandLetter, parsePath } from "./svg-visualizer.utils"

describe("isCommandLetter", () => {
  it("recognizes upper and lower case commands", () => {
    expect(isCommandLetter("M")).toBe(true)
    expect(isCommandLetter("c")).toBe(true)
    expect(isCommandLetter("z")).toBe(true)
  })

  it("rejects non-command characters", () => {
    expect(isCommandLetter("5")).toBe(false)
    expect(isCommandLetter("-")).toBe(false)
  })
})

describe("parsePath", () => {
  it("returns no segments for empty input", () => {
    expect(parsePath("").segments).toEqual([])
    expect(parsePath("   ").segments).toEqual([])
  })

  it("parses a simple Move + Line", () => {
    const { segments, errors } = parsePath("M 10 20 L 30 40")
    expect(errors).toEqual([])
    expect(segments).toHaveLength(2)
    expect(segments[0]).toMatchObject({ type: "M", relative: false, args: [10, 20] })
    expect(segments[1]).toMatchObject({ type: "L", relative: false, args: [30, 40] })
  })

  it("parses a cubic Bézier with 6 args", () => {
    const { segments } = parsePath("M0 0 C 1 2 3 4 5 6")
    expect(segments[1]).toMatchObject({ type: "C", args: [1, 2, 3, 4, 5, 6] })
  })

  it("handles multiple commands and a close path", () => {
    const { segments } = parsePath("M 0 0 L 10 0 L 10 10 Z")
    expect(segments.map((s) => s.type)).toEqual(["M", "L", "L", "Z"])
    expect(segments[3].args).toEqual([])
  })

  it("distinguishes relative (lowercase) from absolute commands", () => {
    const { segments } = parsePath("m 5 5 l 10 10")
    expect(segments[0].relative).toBe(true)
    expect(segments[1].relative).toBe(true)
  })

  it("tolerates missing whitespace between command and numbers", () => {
    const { segments } = parsePath("M10,20L30,40")
    expect(segments[0].args).toEqual([10, 20])
    expect(segments[1].args).toEqual([30, 40])
  })

  it("expands repeated implicit args for a single command", () => {
    // "L 1 2 3 4" means two line-to segments.
    const { segments } = parsePath("M 0 0 L 1 2 3 4")
    const lineSegs = segments.filter((s) => s.type === "L")
    expect(lineSegs).toHaveLength(2)
    expect(lineSegs[0].args).toEqual([1, 2])
    expect(lineSegs[1].args).toEqual([3, 4])
  })

  it("parses negative and decimal coordinates", () => {
    const { segments } = parsePath("M -10.5 .25")
    expect(segments[0].args).toEqual([-10.5, 0.25])
  })

  it("reports an error when a command is missing arguments", () => {
    const { errors } = parsePath("M 10")
    expect(errors.length).toBeGreaterThan(0)
  })

  it("reports an error for numbers before any command", () => {
    const { errors } = parsePath("10 20 M 0 0")
    expect(errors.some((e) => e.includes("before any command"))).toBe(true)
  })

  it("ignores unknown garbage characters without throwing", () => {
    expect(() => parsePath("M 0 0 @#$ L 5 5")).not.toThrow()
    const { segments } = parsePath("M 0 0 @#$ L 5 5")
    expect(segments.map((s) => s.type)).toEqual(["M", "L"])
  })
})

describe("describeSegment", () => {
  it("labels absolute commands", () => {
    expect(describeSegment({ command: "C", type: "C", relative: false, args: [] })).toBe(
      "Cubic Bézier",
    )
  })

  it("flags relative commands", () => {
    expect(describeSegment({ command: "l", type: "L", relative: true, args: [] })).toBe(
      "Line To (relative)",
    )
  })
})
