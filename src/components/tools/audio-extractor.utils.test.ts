import { describe, expect, it } from "vitest"

import { AUDIO_FORMATS, buildExtractArgs } from "./audio-extractor.utils"

describe("buildExtractArgs", () => {
    it("always drops the video stream with -vn", () => {
        const args = buildExtractArgs({
            inputName: "input.mp4",
            outputName: "audio.mp3",
            format: "mp3",
        })
        expect(args).toContain("-vn")
    })

    it("includes the input flag and names", () => {
        const args = buildExtractArgs({
            inputName: "input.mov",
            outputName: "audio.mp3",
            format: "mp3",
        })
        expect(args).toContain("-i")
        expect(args).toContain("input.mov")
        expect(args[args.length - 1]).toBe("audio.mp3")
    })

    it("uses libmp3lame for mp3", () => {
        const args = buildExtractArgs({ inputName: "in.mp4", outputName: "o.mp3", format: "mp3" })
        expect(args).toContain("-c:a")
        expect(args).toContain("libmp3lame")
    })

    it("uses aac codec for m4a", () => {
        const args = buildExtractArgs({ inputName: "in.mp4", outputName: "o.m4a", format: "aac" })
        expect(args).toContain("aac")
    })

    it("uses libvorbis for ogg", () => {
        const args = buildExtractArgs({ inputName: "in.mp4", outputName: "o.ogg", format: "ogg" })
        expect(args).toContain("libvorbis")
    })

    it("uses pcm_s16le for wav", () => {
        const args = buildExtractArgs({ inputName: "in.mp4", outputName: "o.wav", format: "wav" })
        expect(args).toContain("pcm_s16le")
    })

    it("adds bitrate flag for lossy formats", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.mp3",
            format: "mp3",
            bitrate: "192k",
        })
        expect(args).toContain("-b:a")
        expect(args).toContain("192k")
    })

    it("does NOT add bitrate flag for lossless wav even when bitrate provided", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.wav",
            format: "wav",
            bitrate: "320k",
        })
        expect(args).not.toContain("-b:a")
        expect(args).not.toContain("320k")
    })

    it("omits bitrate flag when no bitrate provided", () => {
        const args = buildExtractArgs({ inputName: "in.mp4", outputName: "o.mp3", format: "mp3" })
        expect(args).not.toContain("-b:a")
    })

    it("adds -ss before -i when start is set", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.mp3",
            format: "mp3",
            start: 5,
        })
        expect(args).toContain("-ss")
        expect(args.indexOf("-ss")).toBeLessThan(args.indexOf("-i"))
        expect(args[args.indexOf("-ss") + 1]).toBe("5")
    })

    it("adds -t for duration after -i", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.mp3",
            format: "mp3",
            duration: 12,
        })
        expect(args).toContain("-t")
        expect(args.indexOf("-t")).toBeGreaterThan(args.indexOf("-i"))
        expect(args[args.indexOf("-t") + 1]).toBe("12")
    })

    it("adds both trim flags when start and duration are set", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.mp3",
            format: "mp3",
            start: 3,
            duration: 7,
        })
        expect(args).toContain("-ss")
        expect(args).toContain("-t")
    })

    it("does not add trim flags when start/duration are zero", () => {
        const args = buildExtractArgs({
            inputName: "in.mp4",
            outputName: "o.mp3",
            format: "mp3",
            start: 0,
            duration: 0,
        })
        expect(args).not.toContain("-ss")
        expect(args).not.toContain("-t")
    })

    it("throws on an unsupported format", () => {
        // @ts-expect-error testing runtime guard
        expect(() => buildExtractArgs({ inputName: "i", outputName: "o", format: "flac" })).toThrow()
    })
})

describe("AUDIO_FORMATS table", () => {
    it("maps each format to the correct extension", () => {
        expect(AUDIO_FORMATS.mp3.ext).toBe("mp3")
        expect(AUDIO_FORMATS.aac.ext).toBe("m4a")
        expect(AUDIO_FORMATS.ogg.ext).toBe("ogg")
        expect(AUDIO_FORMATS.wav.ext).toBe("wav")
    })

    it("maps each format to the correct MIME type", () => {
        expect(AUDIO_FORMATS.mp3.mime).toBe("audio/mpeg")
        expect(AUDIO_FORMATS.aac.mime).toBe("audio/mp4")
        expect(AUDIO_FORMATS.ogg.mime).toBe("audio/ogg")
        expect(AUDIO_FORMATS.wav.mime).toBe("audio/wav")
    })

    it("marks wav as lossless and the rest as lossy", () => {
        expect(AUDIO_FORMATS.wav.lossy).toBe(false)
        expect(AUDIO_FORMATS.mp3.lossy).toBe(true)
        expect(AUDIO_FORMATS.aac.lossy).toBe(true)
        expect(AUDIO_FORMATS.ogg.lossy).toBe(true)
    })
})
