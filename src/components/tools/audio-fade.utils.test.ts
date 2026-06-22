import { describe, it, expect } from "vitest"
import { buildFadeArgs, buildFadeFilter } from "./audio-fade.utils"

describe("buildFadeFilter", () => {
    it("builds a fade-in starting at 0", () => {
        expect(buildFadeFilter(30, 3, 0)).toBe("afade=t=in:st=0:d=3")
    })

    it("builds a fade-out starting at duration - fadeOut", () => {
        expect(buildFadeFilter(30, 0, 5)).toBe("afade=t=out:st=25:d=5")
    })

    it("combines both fades with a comma", () => {
        expect(buildFadeFilter(30, 2, 4)).toBe("afade=t=in:st=0:d=2,afade=t=out:st=26:d=4")
    })

    it("returns an empty string when no fade is requested", () => {
        expect(buildFadeFilter(30, 0, 0)).toBe("")
    })
})

describe("buildFadeArgs", () => {
    it("adds an -af flag with the fade chain", () => {
        const args = buildFadeArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            duration: 30,
            fadeIn: 2,
            fadeOut: 4,
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toBe("afade=t=in:st=0:d=2,afade=t=out:st=26:d=4")
        expect(args[args.length - 1]).toBe("out.mp3")
    })

    it("omits -af when there is no fade (plain re-encode)", () => {
        const args = buildFadeArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            duration: 30,
            fadeIn: 0,
            fadeOut: 0,
            format: "mp3",
            bitrate: 192,
        })
        expect(args).not.toContain("-af")
        expect(args).toContain("libmp3lame")
    })

    it("throws when combined fades exceed the duration", () => {
        expect(() =>
            buildFadeArgs({
                inputName: "a",
                outputName: "b",
                duration: 10,
                fadeIn: 6,
                fadeOut: 6,
                format: "mp3",
                bitrate: 192,
            }),
        ).toThrow()
    })

    it("throws for non-positive duration", () => {
        expect(() =>
            buildFadeArgs({
                inputName: "a",
                outputName: "b",
                duration: 0,
                fadeIn: 1,
                fadeOut: 1,
                format: "mp3",
                bitrate: 192,
            }),
        ).toThrow()
    })
})
