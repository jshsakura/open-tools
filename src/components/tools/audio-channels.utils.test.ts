import { describe, it, expect } from "vitest"
import { buildChannelsArgs } from "./audio-channels.utils"

describe("buildChannelsArgs", () => {
    it("sets -ac 1 for mono", () => {
        const args = buildChannelsArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            mode: "mono",
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-ac") + 1]).toBe("1")
    })

    it("sets -ac 2 for stereo", () => {
        const args = buildChannelsArgs({
            inputName: "in.mp3",
            outputName: "out.mp3",
            mode: "stereo",
            format: "mp3",
            bitrate: 192,
        })
        expect(args[args.indexOf("-ac") + 1]).toBe("2")
    })

    it("encodes to the chosen format and ends with the output", () => {
        const args = buildChannelsArgs({
            inputName: "in.wav",
            outputName: "out.ogg",
            mode: "mono",
            format: "ogg",
            bitrate: 128,
        })
        expect(args).toContain("libvorbis")
        expect(args[args.length - 1]).toBe("out.ogg")
    })
})
