import { describe, it, expect } from "vitest"
import { buildMergeArgs } from "./audio-merger.utils"

describe("buildMergeArgs", () => {
    it("emits one -i flag per input, in order", () => {
        const args = buildMergeArgs({
            inputNames: ["a.mp3", "b.wav", "c.ogg"],
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 192,
        })
        const inputs = args.flatMap((a, i) => (a === "-i" ? [args[i + 1]] : []))
        expect(inputs).toEqual(["a.mp3", "b.wav", "c.ogg"])
    })

    it("builds an audio-only concat filter (v=0:a=1) for N inputs", () => {
        const args = buildMergeArgs({
            inputNames: ["a.mp3", "b.mp3", "c.mp3"],
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 192,
        })
        const graph = args[args.indexOf("-filter_complex") + 1]
        expect(graph).toContain("[0:a][1:a][2:a]")
        expect(graph).toContain("concat=n=3:v=0:a=1[a]")
    })

    it("maps the joined [a] stream and drops video with -vn", () => {
        const args = buildMergeArgs({
            inputNames: ["a.mp3", "b.mp3"],
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 256,
        })
        const maps = args.flatMap((a, i) => (a === "-map" ? [args[i + 1]] : []))
        expect(maps).toContain("[a]")
        expect(args).toContain("-vn")
    })

    it("uses the chosen codec and bitrate for lossy output", () => {
        const args = buildMergeArgs({
            inputNames: ["a.mp3", "b.mp3"],
            outputName: "out.mp3",
            format: "mp3",
            bitrate: 320,
        })
        expect(args).toContain("libmp3lame")
        expect(args[args.indexOf("-b:a") + 1]).toBe("320k")
    })

    it("omits bitrate for lossless formats", () => {
        const args = buildMergeArgs({
            inputNames: ["a.wav", "b.wav"],
            outputName: "out.wav",
            format: "wav",
            bitrate: 320,
        })
        expect(args).not.toContain("-b:a")
        expect(args).toContain("pcm_s16le")
    })

    it("throws when given no inputs", () => {
        expect(() =>
            buildMergeArgs({ inputNames: [], outputName: "o.mp3", format: "mp3", bitrate: 192 }),
        ).toThrow()
    })
})
