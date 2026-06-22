import { describe, it, expect } from "vitest"
import { buildTrimArgs } from "./audio-trimmer.utils"

describe("buildTrimArgs", () => {
    it("seeks before input with -ss and uses -t for the segment length", () => {
        const args = buildTrimArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            start: 10,
            end: 25,
        })
        const ssIndex = args.indexOf("-ss")
        const iIndex = args.indexOf("-i")
        const tIndex = args.indexOf("-t")
        expect(ssIndex).toBeGreaterThanOrEqual(0)
        expect(ssIndex).toBeLessThan(iIndex) // -ss before -i for fast seek
        expect(args[ssIndex + 1]).toBe("10")
        expect(args[tIndex + 1]).toBe("15") // duration = end - start
    })

    it("stream-copies for a lossless, fast trim", () => {
        const args = buildTrimArgs({ inputName: "a.wav", outputName: "b.wav", start: 0, end: 5 })
        const cIndex = args.indexOf("-c")
        expect(args[cIndex + 1]).toBe("copy")
    })

    it("puts the output name last", () => {
        const args = buildTrimArgs({ inputName: "a.mp3", outputName: "cut.mp3", start: 1, end: 2 })
        expect(args[args.length - 1]).toBe("cut.mp3")
    })

    it("throws when end is not greater than start", () => {
        expect(() => buildTrimArgs({ inputName: "a", outputName: "b", start: 5, end: 5 })).toThrow()
        expect(() => buildTrimArgs({ inputName: "a", outputName: "b", start: 8, end: 3 })).toThrow()
    })

    it("throws when start is negative", () => {
        expect(() => buildTrimArgs({ inputName: "a", outputName: "b", start: -1, end: 3 })).toThrow()
    })
})
