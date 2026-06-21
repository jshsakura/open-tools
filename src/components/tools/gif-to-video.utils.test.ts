import { describe, it, expect } from "vitest"
import { buildGifToVideoArgs, FORMATS } from "./gif-to-video.utils"

describe("buildGifToVideoArgs", () => {
    it("encodes MP4 with libx264, yuv420p and +faststart", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
        })
        const vcodecIndex = args.indexOf("-c:v")
        expect(vcodecIndex).toBeGreaterThan(-1)
        expect(args[vcodecIndex + 1]).toBe("libx264")

        const pixIndex = args.indexOf("-pix_fmt")
        expect(pixIndex).toBeGreaterThan(-1)
        expect(args[pixIndex + 1]).toBe("yuv420p")

        const flagsIndex = args.indexOf("-movflags")
        expect(flagsIndex).toBeGreaterThan(-1)
        expect(args[flagsIndex + 1]).toBe("+faststart")
    })

    it("pads/scales to even dimensions for MP4", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThan(-1)
        expect(args[vfIndex + 1]).toBe("scale=trunc(iw/2)*2:trunc(ih/2)*2")
    })

    it("encodes WebM with libvpx-vp9 and no yuv420p/faststart", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.webm",
            format: "webm",
        })
        const vcodecIndex = args.indexOf("-c:v")
        expect(args[vcodecIndex + 1]).toBe("libvpx-vp9")
        expect(args).not.toContain("-pix_fmt")
        expect(args).not.toContain("-movflags")
    })

    it("scales to even dimensions for WebM too", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.webm",
            format: "webm",
        })
        const vfIndex = args.indexOf("-vf")
        expect(args[vfIndex + 1]).toBe("scale=trunc(iw/2)*2:trunc(ih/2)*2")
    })

    it("includes -i input and the output as the last argument", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
        })
        const iIndex = args.indexOf("-i")
        expect(iIndex).toBeGreaterThan(-1)
        expect(args[iIndex + 1]).toBe("input.gif")
        expect(args[args.length - 1]).toBe("output.mp4")
    })

    it("places -stream_loop before -i when looping", () => {
        const args = buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
            loop: 3,
        })
        const loopIndex = args.indexOf("-stream_loop")
        const iIndex = args.indexOf("-i")
        expect(loopIndex).toBeGreaterThan(-1)
        expect(loopIndex).toBeLessThan(iIndex)
        expect(args[loopIndex + 1]).toBe("3")
    })

    it("omits -stream_loop when loop is the default (-1) or zero", () => {
        expect(buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
        })).not.toContain("-stream_loop")

        expect(buildGifToVideoArgs({
            inputName: "input.gif",
            outputName: "output.mp4",
            format: "mp4",
            loop: 0,
        })).not.toContain("-stream_loop")
    })
})

describe("FORMATS", () => {
    it("maps mp4 to the right ext, mime and codec", () => {
        expect(FORMATS.mp4).toEqual({ ext: "mp4", mime: "video/mp4", vcodec: "libx264" })
    })

    it("maps webm to the right ext, mime and codec", () => {
        expect(FORMATS.webm).toEqual({ ext: "webm", mime: "video/webm", vcodec: "libvpx-vp9" })
    })
})
