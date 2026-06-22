import { describe, it, expect } from "vitest"
import {
    buildBoomerangArgs,
    clampLoops,
    MIN_LOOPS,
    MAX_LOOPS,
} from "./video-boomerang.utils"

/** Pull the filter_complex string out of an arg list for inspection. */
function getFilterComplex(args: string[]): string {
    const idx = args.indexOf("-filter_complex")
    expect(idx).toBeGreaterThanOrEqual(0)
    return args[idx + 1]
}

describe("buildBoomerangArgs", () => {
    it("builds a split / reverse / concat=n=2 filter for a single loop", () => {
        const args = buildBoomerangArgs({
            inputName: "input.mp4",
            outputName: "boomerang.mp4",
            loops: 1,
        })
        const fc = getFilterComplex(args)
        expect(fc).toContain("split")
        expect(fc).toContain("reverse")
        expect(fc).toContain("concat=n=2:v=1[v]")
    })

    it("scales the concat n with the loop count (n = 2 * loops)", () => {
        const fc1 = getFilterComplex(
            buildBoomerangArgs({ inputName: "in.mp4", outputName: "o.mp4", loops: 1 }),
        )
        const fc3 = getFilterComplex(
            buildBoomerangArgs({ inputName: "in.mp4", outputName: "o.mp4", loops: 3 }),
        )
        expect(fc1).toContain("concat=n=2:")
        expect(fc3).toContain("concat=n=6:")
    })

    it("adds one reverse per loop", () => {
        const fc = getFilterComplex(
            buildBoomerangArgs({ inputName: "in.mp4", outputName: "o.mp4", loops: 3 }),
        )
        const reverseCount = (fc.match(/reverse/g) || []).length
        expect(reverseCount).toBe(3)
    })

    it("drops audio with -an", () => {
        const args = buildBoomerangArgs({
            inputName: "in.mp4",
            outputName: "o.mp4",
            loops: 1,
        })
        expect(args).toContain("-an")
    })

    it("maps the concatenated [v] output", () => {
        const args = buildBoomerangArgs({
            inputName: "in.mp4",
            outputName: "o.mp4",
            loops: 1,
        })
        const mapIdx = args.indexOf("-map")
        expect(mapIdx).toBeGreaterThanOrEqual(0)
        expect(args[mapIdx + 1]).toBe("[v]")
    })

    it("encodes the output with libx264", () => {
        const args = buildBoomerangArgs({
            inputName: "in.mp4",
            outputName: "o.mp4",
            loops: 1,
        })
        expect(args).toContain("libx264")
    })

    it("ends with the output name", () => {
        const args = buildBoomerangArgs({
            inputName: "in.mp4",
            outputName: "boom.mp4",
            loops: 2,
        })
        expect(args[args.length - 1]).toBe("boom.mp4")
    })

    it("clamps out-of-range / invalid loop counts before building", () => {
        const fcHigh = getFilterComplex(
            buildBoomerangArgs({ inputName: "in.mp4", outputName: "o.mp4", loops: 99 }),
        )
        expect(fcHigh).toContain(`concat=n=${2 * MAX_LOOPS}:`)

        const fcLow = getFilterComplex(
            buildBoomerangArgs({ inputName: "in.mp4", outputName: "o.mp4", loops: 0 }),
        )
        expect(fcLow).toContain(`concat=n=${2 * MIN_LOOPS}:`)
    })
})

describe("clampLoops", () => {
    it("keeps in-range integers untouched", () => {
        expect(clampLoops(1)).toBe(1)
        expect(clampLoops(3)).toBe(3)
    })
    it("clamps to bounds", () => {
        expect(clampLoops(0)).toBe(MIN_LOOPS)
        expect(clampLoops(-5)).toBe(MIN_LOOPS)
        expect(clampLoops(100)).toBe(MAX_LOOPS)
    })
    it("floors fractional values", () => {
        expect(clampLoops(2.9)).toBe(2)
    })
    it("falls back to MIN_LOOPS for non-finite input", () => {
        expect(clampLoops(NaN)).toBe(MIN_LOOPS)
        expect(clampLoops(Infinity)).toBe(MIN_LOOPS)
    })
})
