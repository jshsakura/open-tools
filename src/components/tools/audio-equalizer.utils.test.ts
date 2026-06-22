import { describe, it, expect } from "vitest"
import { buildEqArgs, buildEqFilter } from "./audio-equalizer.utils"

describe("buildEqFilter", () => {
    it("includes both bass and treble when non-zero", () => {
        expect(buildEqFilter(6, -3)).toBe("bass=g=6,treble=g=-3")
    })

    it("omits a band with 0 gain", () => {
        expect(buildEqFilter(5, 0)).toBe("bass=g=5")
        expect(buildEqFilter(0, 4)).toBe("treble=g=4")
    })

    it("returns an empty string when both gains are 0", () => {
        expect(buildEqFilter(0, 0)).toBe("")
    })
})

describe("buildEqArgs", () => {
    it("applies the eq filter via -af and encodes", () => {
        const args = buildEqArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            bass: 6,
            treble: 2,
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toBe("bass=g=6,treble=g=2")
        expect(args).toContain("libmp3lame")
        expect(args[args.length - 1]).toBe("out.mp3")
    })

    it("omits -af when both gains are 0 (plain re-encode)", () => {
        const args = buildEqArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            bass: 0,
            treble: 0,
            format: "mp3",
            bitrate: 192,
        })
        expect(args).not.toContain("-af")
        expect(args).toContain("libmp3lame")
    })
})
