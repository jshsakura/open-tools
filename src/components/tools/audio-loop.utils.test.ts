import { describe, it, expect } from "vitest"
import { buildLoopArgs, MIN_LOOPS, MAX_LOOPS } from "./audio-loop.utils"

describe("buildLoopArgs", () => {
    it("uses -stream_loop count-1 before -i", () => {
        const args = buildLoopArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            count: 3,
            format: "mp3",
            bitrate: 192,
        })
        const slIndex = args.indexOf("-stream_loop")
        const iIndex = args.indexOf("-i")
        expect(slIndex).toBeGreaterThanOrEqual(0)
        expect(slIndex).toBeLessThan(iIndex) // input option before -i
        expect(args[slIndex + 1]).toBe("2") // 3 plays = 2 extra loops
    })

    it("encodes to the chosen format", () => {
        const args = buildLoopArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            count: 5,
            format: "mp3",
            bitrate: 256,
        })
        expect(args).toContain("libmp3lame")
        expect(args[args.length - 1]).toBe("out.mp3")
    })

    it("rejects counts below the minimum or non-integers", () => {
        const base = { inputName: "a", outputName: "b", format: "mp3" as const, bitrate: 192 }
        expect(() => buildLoopArgs({ ...base, count: MIN_LOOPS - 1 })).toThrow()
        expect(() => buildLoopArgs({ ...base, count: 2.5 })).toThrow()
    })

    it("rejects counts above the maximum", () => {
        expect(() =>
            buildLoopArgs({
                inputName: "a",
                outputName: "b",
                count: MAX_LOOPS + 1,
                format: "mp3",
                bitrate: 192,
            }),
        ).toThrow()
    })
})
