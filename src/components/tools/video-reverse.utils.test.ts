import { describe, it, expect } from "vitest"
import { buildReverseArgs } from "./video-reverse.utils"

describe("buildReverseArgs", () => {
    it("always reverses the video with -vf reverse", () => {
        const args = buildReverseArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            reverseAudio: true,
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThanOrEqual(0)
        expect(args[vfIndex + 1]).toBe("reverse")
    })

    it("re-encodes video with libx264", () => {
        const args = buildReverseArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            reverseAudio: false,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
    })

    it("reverses audio with -af areverse and aac when reverseAudio is true", () => {
        const args = buildReverseArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            reverseAudio: true,
        })
        const afIndex = args.indexOf("-af")
        expect(afIndex).toBeGreaterThanOrEqual(0)
        expect(args[afIndex + 1]).toBe("areverse")
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
        expect(args).not.toContain("-an")
    })

    it("drops audio with -an when reverseAudio is false", () => {
        const args = buildReverseArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            reverseAudio: false,
        })
        expect(args).toContain("-an")
        expect(args).not.toContain("-af")
        expect(args).not.toContain("areverse")
    })

    it("ends with the output name", () => {
        const args = buildReverseArgs({
            inputName: "input.mp4",
            outputName: "reversed.mp4",
            reverseAudio: true,
        })
        expect(args[args.length - 1]).toBe("reversed.mp4")
    })

    it("places -i with the input name", () => {
        const args = buildReverseArgs({
            inputName: "clip.webm",
            outputName: "output.mp4",
            reverseAudio: false,
        })
        const iIndex = args.indexOf("-i")
        expect(iIndex).toBeGreaterThanOrEqual(0)
        expect(args[iIndex + 1]).toBe("clip.webm")
    })
})
