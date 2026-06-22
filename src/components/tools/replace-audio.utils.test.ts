import { describe, expect, it } from "vitest"

import { buildReplaceArgs } from "./replace-audio.utils"

const BASE = {
    videoName: "video.mp4",
    audioName: "audio.mp3",
    outputName: "output.mp4",
}

describe("buildReplaceArgs — replace mode", () => {
    it("includes two -i flags for the video and audio inputs", () => {
        const args = buildReplaceArgs(BASE)
        const inputs = args.filter((a) => a === "-i")
        expect(inputs).toHaveLength(2)
        expect(args.indexOf("video.mp4")).toBe(args.indexOf("-i") + 1)
        expect(args).toContain("audio.mp3")
    })

    it("maps video from input 0 and audio from input 1", () => {
        const args = buildReplaceArgs(BASE)
        expect(args).toContain("-map")
        expect(args).toContain("0:v:0")
        expect(args).toContain("1:a:0")
    })

    it("copies the video stream with -c:v copy", () => {
        const args = buildReplaceArgs(BASE)
        const idx = args.indexOf("-c:v")
        expect(idx).toBeGreaterThan(-1)
        expect(args[idx + 1]).toBe("copy")
    })

    it("encodes audio to aac", () => {
        const args = buildReplaceArgs(BASE)
        const idx = args.indexOf("-c:a")
        expect(idx).toBeGreaterThan(-1)
        expect(args[idx + 1]).toBe("aac")
    })

    it("always includes -shortest", () => {
        const args = buildReplaceArgs(BASE)
        expect(args).toContain("-shortest")
    })

    it("does NOT use a filter_complex in replace mode", () => {
        const args = buildReplaceArgs(BASE)
        expect(args).not.toContain("-filter_complex")
    })

    it("places the output name last", () => {
        const args = buildReplaceArgs(BASE)
        expect(args[args.length - 1]).toBe("output.mp4")
    })

    it("treats mix:false the same as omitting mix", () => {
        const args = buildReplaceArgs({ ...BASE, mix: false })
        expect(args).toContain("1:a:0")
        expect(args).not.toContain("-filter_complex")
    })
})

describe("buildReplaceArgs — mix mode", () => {
    const mixArgs = buildReplaceArgs({ ...BASE, mix: true, bgmVolume: 0.5 })

    it("includes two -i flags", () => {
        const inputs = mixArgs.filter((a) => a === "-i")
        expect(inputs).toHaveLength(2)
    })

    it("uses a filter_complex with amix=inputs=2", () => {
        expect(mixArgs).toContain("-filter_complex")
        const idx = mixArgs.indexOf("-filter_complex")
        expect(mixArgs[idx + 1]).toContain("amix=inputs=2")
    })

    it("applies a volume filter to the uploaded BGM with the given value", () => {
        const idx = mixArgs.indexOf("-filter_complex")
        expect(mixArgs[idx + 1]).toContain("volume=0.5")
        expect(mixArgs[idx + 1]).toContain("[1:a]")
    })

    it("uses duration=shortest in the amix graph", () => {
        const idx = mixArgs.indexOf("-filter_complex")
        expect(mixArgs[idx + 1]).toContain("duration=shortest")
    })

    it("maps the video stream and the mixed audio output", () => {
        expect(mixArgs).toContain("0:v:0")
        expect(mixArgs).toContain("[aout]")
    })

    it("still copies the video and encodes audio to aac", () => {
        expect(mixArgs[mixArgs.indexOf("-c:v") + 1]).toBe("copy")
        expect(mixArgs[mixArgs.indexOf("-c:a") + 1]).toBe("aac")
    })

    it("always includes -shortest and puts output last", () => {
        expect(mixArgs).toContain("-shortest")
        expect(mixArgs[mixArgs.length - 1]).toBe("output.mp4")
    })

    it("defaults to volume=1 when bgmVolume is missing", () => {
        const args = buildReplaceArgs({ ...BASE, mix: true })
        const idx = args.indexOf("-filter_complex")
        expect(args[idx + 1]).toContain("volume=1")
    })

    it("falls back to volume=1 for negative or non-finite volumes", () => {
        const neg = buildReplaceArgs({ ...BASE, mix: true, bgmVolume: -2 })
        const nan = buildReplaceArgs({ ...BASE, mix: true, bgmVolume: NaN })
        expect(neg[neg.indexOf("-filter_complex") + 1]).toContain("volume=1")
        expect(nan[nan.indexOf("-filter_complex") + 1]).toContain("volume=1")
    })
})
