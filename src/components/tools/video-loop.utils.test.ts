import { describe, it, expect } from "vitest"
import { buildLoopArgs, estimatedDuration } from "./video-loop.utils"

describe("buildLoopArgs", () => {
    it("uses -stream_loop 2 (totalPlays - 1) for 3 total plays", () => {
        const args = buildLoopArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            totalPlays: 3,
        })
        const idx = args.indexOf("-stream_loop")
        expect(idx).toBeGreaterThanOrEqual(0)
        expect(args[idx + 1]).toBe("2")
    })

    it("places -stream_loop before -i", () => {
        const args = buildLoopArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            totalPlays: 4,
        })
        const loopIndex = args.indexOf("-stream_loop")
        const inputIndex = args.indexOf("-i")
        expect(loopIndex).toBeGreaterThanOrEqual(0)
        expect(inputIndex).toBeGreaterThanOrEqual(0)
        expect(loopIndex).toBeLessThan(inputIndex)
    })

    it("re-encodes with libx264 / aac", () => {
        const args = buildLoopArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            totalPlays: 2,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
    })

    it("uses -stream_loop 0 for a single play (no extra loops)", () => {
        const args = buildLoopArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            totalPlays: 1,
        })
        const idx = args.indexOf("-stream_loop")
        expect(args[idx + 1]).toBe("0")
    })

    it("ends with the output name", () => {
        const args = buildLoopArgs({
            inputName: "input.mp4",
            outputName: "looped.mp4",
            totalPlays: 5,
        })
        expect(args[args.length - 1]).toBe("looped.mp4")
    })

    it("throws when totalPlays is less than 1", () => {
        expect(() =>
            buildLoopArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                totalPlays: 0,
            }),
        ).toThrow()
    })

    it("throws when totalPlays is not an integer", () => {
        expect(() =>
            buildLoopArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                totalPlays: 2.5,
            }),
        ).toThrow()
    })
})

describe("estimatedDuration", () => {
    it("multiplies source duration by total plays", () => {
        expect(estimatedDuration(10, 3)).toBe(30)
        expect(estimatedDuration(2.5, 4)).toBe(10)
    })

    it("returns 0 for non-positive source duration", () => {
        expect(estimatedDuration(0, 3)).toBe(0)
        expect(estimatedDuration(-5, 3)).toBe(0)
    })

    it("returns 0 for non-finite inputs", () => {
        expect(estimatedDuration(NaN, 3)).toBe(0)
        expect(estimatedDuration(10, NaN)).toBe(0)
        expect(estimatedDuration(Infinity, 3)).toBe(0)
    })

    it("returns 0 for non-positive play counts", () => {
        expect(estimatedDuration(10, 0)).toBe(0)
    })
})
