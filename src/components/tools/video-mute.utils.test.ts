import { describe, it, expect } from "vitest"
import { buildMuteArgs } from "./video-mute.utils"

describe("buildMuteArgs", () => {
    it("drops audio with -an", () => {
        const args = buildMuteArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
        })
        expect(args).toContain("-an")
    })

    it("stream-copies the video with -c:v copy (no re-encode)", () => {
        const args = buildMuteArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
        })
        const cvIndex = args.indexOf("-c:v")
        expect(cvIndex).toBeGreaterThanOrEqual(0)
        expect(args[cvIndex + 1]).toBe("copy")
    })

    it("does not set any audio codec", () => {
        const args = buildMuteArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
        })
        expect(args).not.toContain("-c:a")
        expect(args).not.toContain("aac")
        expect(args).not.toContain("libx264")
    })

    it("passes the input name after -i", () => {
        const args = buildMuteArgs({
            inputName: "clip.webm",
            outputName: "output.mp4",
        })
        const iIndex = args.indexOf("-i")
        expect(iIndex).toBeGreaterThanOrEqual(0)
        expect(args[iIndex + 1]).toBe("clip.webm")
    })

    it("ends with the output name", () => {
        const args = buildMuteArgs({
            inputName: "input.mp4",
            outputName: "muted.mp4",
        })
        expect(args[args.length - 1]).toBe("muted.mp4")
    })

    it("produces the exact expected argument list", () => {
        const args = buildMuteArgs({
            inputName: "input.mp4",
            outputName: "muted.mp4",
        })
        expect(args).toEqual(["-i", "input.mp4", "-c:v", "copy", "-an", "muted.mp4"])
    })
})
