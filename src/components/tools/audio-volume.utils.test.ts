import { describe, it, expect } from "vitest"
import { buildVolumeArgs, buildVolumeFilter } from "./audio-volume.utils"

describe("buildVolumeFilter", () => {
    it("builds a dB gain filter in gain mode", () => {
        expect(buildVolumeFilter("gain", 6)).toBe("volume=6dB")
        expect(buildVolumeFilter("gain", -3)).toBe("volume=-3dB")
    })

    it("uses loudnorm in normalize mode", () => {
        expect(buildVolumeFilter("normalize", 0)).toBe("loudnorm")
    })
})

describe("buildVolumeArgs", () => {
    it("applies the gain filter via -af and encodes to the target format", () => {
        const args = buildVolumeArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            mode: "gain",
            gainDb: 6,
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toBe("volume=6dB")
        expect(args).toContain("libmp3lame")
        expect(args[args.indexOf("-b:a") + 1]).toBe("192k")
        expect(args[args.length - 1]).toBe("out.mp3")
    })

    it("uses loudnorm in normalize mode", () => {
        const args = buildVolumeArgs({
            inputName: "in.wav",
            outputName: "out.wav",
            mode: "normalize",
            format: "wav",
            bitrate: 192,
        })
        expect(args[args.indexOf("-af") + 1]).toBe("loudnorm")
        // lossless target → no bitrate flag
        expect(args).not.toContain("-b:a")
    })
})
