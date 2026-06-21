import { describe, it, expect } from "vitest"
import {
    buildFramesArgs,
    buildThumbnailArgs,
    frameMime,
    FRAME_PATTERN,
} from "./video-frames.utils"

describe("buildFramesArgs", () => {
    it("includes the input and an fps video filter", () => {
        const args = buildFramesArgs({
            inputName: "input.mp4",
            fps: 1,
            format: "png",
            pattern: FRAME_PATTERN,
        })

        expect(args).toContain("-i")
        expect(args).toContain("input.mp4")
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThanOrEqual(0)
        expect(args[vfIndex + 1]).toBe("fps=1")
    })

    it("supports fractional fps rates", () => {
        const args = buildFramesArgs({
            inputName: "input.mp4",
            fps: 0.5,
            format: "png",
            pattern: FRAME_PATTERN,
        })

        const vfIndex = args.indexOf("-vf")
        expect(args[vfIndex + 1]).toBe("fps=0.5")
    })

    it("uses the frame_%04d pattern as the output name for png", () => {
        const args = buildFramesArgs({
            inputName: "input.mp4",
            fps: 1,
            format: "png",
            pattern: FRAME_PATTERN,
        })

        expect(args[args.length - 1]).toBe("frame_%04d.png")
    })

    it("swaps the pattern extension and adds quality for jpg", () => {
        const args = buildFramesArgs({
            inputName: "input.mp4",
            fps: 2,
            format: "jpg",
            pattern: FRAME_PATTERN,
        })

        expect(args[args.length - 1]).toBe("frame_%04d.jpg")
        expect(args).toContain("-q:v")
    })
})

describe("buildThumbnailArgs", () => {
    it("seeks with -ss and grabs a single frame", () => {
        const args = buildThumbnailArgs({
            inputName: "input.mp4",
            time: 3.5,
            outputName: "thumb.png",
        })

        const ssIndex = args.indexOf("-ss")
        expect(ssIndex).toBeGreaterThanOrEqual(0)
        expect(args[ssIndex + 1]).toBe("3.5")

        const framesIndex = args.indexOf("-frames:v")
        expect(framesIndex).toBeGreaterThanOrEqual(0)
        expect(args[framesIndex + 1]).toBe("1")

        expect(args[args.length - 1]).toBe("thumb.png")
    })

    it("seeks before the input for fast seeking", () => {
        const args = buildThumbnailArgs({
            inputName: "input.mp4",
            time: 10,
            outputName: "thumb.png",
        })

        expect(args.indexOf("-ss")).toBeLessThan(args.indexOf("-i"))
    })

    it("adds jpg quality flag for jpg output", () => {
        const args = buildThumbnailArgs({
            inputName: "input.mp4",
            time: 1,
            outputName: "thumb.jpg",
        })

        expect(args).toContain("-q:v")
    })
})

describe("frameMime", () => {
    it("maps png to image/png", () => {
        expect(frameMime("png")).toBe("image/png")
    })

    it("maps jpg to image/jpeg", () => {
        expect(frameMime("jpg")).toBe("image/jpeg")
    })
})
