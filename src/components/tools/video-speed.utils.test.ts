import { describe, it, expect } from "vitest"
import { buildAtempoChain, buildSpeedArgs } from "./video-speed.utils"

describe("buildAtempoChain", () => {
    it("returns a single in-range filter for 1.5x", () => {
        expect(buildAtempoChain(1.5)).toBe("atempo=1.5")
    })

    it("returns a single 1.0 filter for normal speed", () => {
        expect(buildAtempoChain(1)).toBe("atempo=1.0")
    })

    it("returns 2.0 for the max in-range speed", () => {
        expect(buildAtempoChain(2)).toBe("atempo=2.0")
    })

    it("chains two 2.0 steps for 4x", () => {
        expect(buildAtempoChain(4)).toBe("atempo=2.0,atempo=2.0")
    })

    it("chains two 0.5 steps for 0.25x", () => {
        expect(buildAtempoChain(0.25)).toBe("atempo=0.5,atempo=0.5")
    })

    it("returns a single 0.5 filter for 0.5x", () => {
        expect(buildAtempoChain(0.5)).toBe("atempo=0.5")
    })

    it("throws on non-positive or non-finite speed", () => {
        expect(() => buildAtempoChain(0)).toThrow()
        expect(() => buildAtempoChain(-1)).toThrow()
        expect(() => buildAtempoChain(NaN)).toThrow()
    })
})

describe("buildSpeedArgs", () => {
    it("uses setpts=PTS/2 for 2x", () => {
        const args = buildSpeedArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            speed: 2,
            keepAudio: true,
        })
        expect(args).toContain("setpts=PTS/2")
    })

    it("uses setpts=PTS/0.5 for 0.5x", () => {
        const args = buildSpeedArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            speed: 0.5,
            keepAudio: true,
        })
        expect(args).toContain("setpts=PTS/0.5")
    })

    it("includes the atempo chain when audio is kept (4x)", () => {
        const args = buildSpeedArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            speed: 4,
            keepAudio: true,
        })
        expect(args).toContain("atempo=2.0,atempo=2.0")
        expect(args).toContain("-filter:a")
        expect(args).toContain("aac")
        expect(args).not.toContain("-an")
    })

    it("drops audio with -an when keepAudio is false", () => {
        const args = buildSpeedArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            speed: 2,
            keepAudio: false,
        })
        expect(args).toContain("-an")
        expect(args).not.toContain("-filter:a")
        expect(args).not.toContain("aac")
    })

    it("always re-encodes video with libx264 and ends with the output name", () => {
        const args = buildSpeedArgs({
            inputName: "input.mp4",
            outputName: "fast.mp4",
            speed: 1.5,
            keepAudio: true,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args).toContain("setpts=PTS/1.5")
        expect(args[args.length - 1]).toBe("fast.mp4")
    })

    it("throws on invalid speed", () => {
        expect(() =>
            buildSpeedArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                speed: 0,
                keepAudio: true,
            }),
        ).toThrow()
    })
})
