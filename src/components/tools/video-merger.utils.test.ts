import { describe, it, expect } from "vitest"
import { buildConcatArgs } from "./video-merger.utils"

const RES = { width: 1280, height: 720 }

describe("buildConcatArgs", () => {
    it("emits one -i flag per input", () => {
        const args = buildConcatArgs(["a.mp4", "b.mov", "c.webm"], "out.mp4", RES)
        const inputCount = args.filter((a) => a === "-i").length
        expect(inputCount).toBe(3)
        // input filenames present in order
        const iIndices = args.flatMap((a, i) => (a === "-i" ? [args[i + 1]] : []))
        expect(iIndices).toEqual(["a.mp4", "b.mov", "c.webm"])
    })

    it("builds filter_complex containing concat=n=N:v=1:a=1 for N inputs", () => {
        const args = buildConcatArgs(["a.mp4", "b.mp4", "c.mp4", "d.mp4"], "out.mp4", RES)
        const fcIndex = args.indexOf("-filter_complex")
        expect(fcIndex).toBeGreaterThanOrEqual(0)
        const graph = args[fcIndex + 1]
        expect(graph).toContain("concat=n=4:v=1:a=1")
    })

    it("scales every input to the common resolution", () => {
        const args = buildConcatArgs(["a.mp4", "b.mp4"], "out.mp4", RES)
        const graph = args[args.indexOf("-filter_complex") + 1]
        // two scale chains, each referencing the target resolution
        const scaleMatches = graph.match(/scale=1280:720/g) ?? []
        expect(scaleMatches.length).toBe(2)
        expect(graph).toContain("[0:v]")
        expect(graph).toContain("[1:v]")
        expect(graph).toContain("setsar=1")
    })

    it("maps the joined [v] and [a] streams", () => {
        const args = buildConcatArgs(["a.mp4", "b.mp4"], "out.mp4", RES)
        const maps = args.flatMap((a, i) => (a === "-map" ? [args[i + 1]] : []))
        expect(maps).toContain("[v]")
        expect(maps).toContain("[a]")
    })

    it("puts the output name last", () => {
        const args = buildConcatArgs(["a.mp4", "b.mp4"], "merged.mp4", RES)
        expect(args[args.length - 1]).toBe("merged.mp4")
    })

    it("throws when given no inputs", () => {
        expect(() => buildConcatArgs([], "out.mp4", RES)).toThrow()
    })
})
