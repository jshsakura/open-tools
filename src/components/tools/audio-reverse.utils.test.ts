import { describe, it, expect } from "vitest"
import { buildReverseArgs } from "./audio-reverse.utils"

describe("buildReverseArgs", () => {
    it("applies areverse via -af", () => {
        const args = buildReverseArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toBe("areverse")
        expect(args[args.length - 1]).toBe("out.mp3")
    })

    it("encodes with the chosen codec/bitrate (lossy)", () => {
        const args = buildReverseArgs({
            inputName: "in.wav",
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 320,
        })
        expect(args).toContain("libmp3lame")
        expect(args[args.indexOf("-b:a") + 1]).toBe("320k")
    })

    it("omits bitrate for lossless output", () => {
        const args = buildReverseArgs({
            inputName: "in.mp3",
            outputName: "out.wav",
            format: "wav",
            bitrate: 320,
        })
        expect(args).not.toContain("-b:a")
        expect(args).toContain("pcm_s16le")
    })
})
