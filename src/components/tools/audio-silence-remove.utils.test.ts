import { describe, it, expect } from "vitest"
import { buildSilenceArgs, buildSilenceFilter } from "./audio-silence-remove.utils"

describe("buildSilenceFilter", () => {
    it("trims leading silence with a single silenceremove", () => {
        const f = buildSilenceFilter("leading", -50)
        expect(f).toBe("silenceremove=start_periods=1:start_threshold=-50dB")
    })

    it("trims trailing silence via reverse → trim → reverse", () => {
        const f = buildSilenceFilter("trailing", -50)
        expect(f).toBe("areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse")
    })

    it("trims both ends", () => {
        const f = buildSilenceFilter("both", -45)
        expect(f).toBe(
            "silenceremove=start_periods=1:start_threshold=-45dB," +
                "areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
        )
    })

    it("embeds the chosen threshold", () => {
        expect(buildSilenceFilter("leading", -30)).toContain("-30dB")
    })
})

describe("buildSilenceArgs", () => {
    it("applies the filter via -af and encodes to the format", () => {
        const args = buildSilenceArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            mode: "both",
            threshold: -50,
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toContain("silenceremove")
        expect(args).toContain("libmp3lame")
        expect(args[args.length - 1]).toBe("out.mp3")
    })
})
