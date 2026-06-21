import { describe, it, expect } from "vitest"
import { buildRotateFilter, buildRotateArgs } from "./video-rotate.utils"

describe("buildRotateFilter", () => {
    it("maps 90 CW to transpose=1", () => {
        const filter = buildRotateFilter({ rotation: 90, flipH: false, flipV: false })
        expect(filter).toBe("transpose=1")
    })

    it("maps 270 (90 CCW) to transpose=2", () => {
        const filter = buildRotateFilter({ rotation: 270, flipH: false, flipV: false })
        expect(filter).toBe("transpose=2")
    })

    it("maps 180 to two transposes", () => {
        const filter = buildRotateFilter({ rotation: 180, flipH: false, flipV: false })
        expect(filter).toBe("transpose=1,transpose=1")
        expect(filter.match(/transpose=1/g)?.length).toBe(2)
    })

    it("includes hflip in the chain when flipH is set", () => {
        const filter = buildRotateFilter({ rotation: 0, flipH: true, flipV: false })
        expect(filter.split(",")).toContain("hflip")
    })

    it("includes vflip in the chain when flipV is set", () => {
        const filter = buildRotateFilter({ rotation: 0, flipH: false, flipV: true })
        expect(filter.split(",")).toContain("vflip")
    })

    it("combines rotation and both flips in order", () => {
        const filter = buildRotateFilter({ rotation: 90, flipH: true, flipV: true })
        expect(filter).toBe("transpose=1,hflip,vflip")
    })

    it("returns an empty string when there is nothing to do", () => {
        const filter = buildRotateFilter({ rotation: 0, flipH: false, flipV: false })
        expect(filter).toBe("")
    })
})

describe("buildRotateArgs", () => {
    it("omits -vf when no rotation and no flips", () => {
        const args = buildRotateArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            rotation: 0,
            flipH: false,
            flipV: false,
        })
        expect(args).not.toContain("-vf")
    })

    it("adds -vf with the filter chain when rotation is set", () => {
        const args = buildRotateArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            rotation: 90,
            flipH: false,
            flipV: false,
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThanOrEqual(0)
        expect(args[vfIndex + 1]).toBe("transpose=1")
    })

    it("re-encodes with libx264 and aac", () => {
        const args = buildRotateArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            rotation: 180,
            flipH: true,
            flipV: false,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
    })

    it("ends with the output name", () => {
        const args = buildRotateArgs({
            inputName: "input.mp4",
            outputName: "rotated.mp4",
            rotation: 270,
            flipH: false,
            flipV: false,
        })
        expect(args[args.length - 1]).toBe("rotated.mp4")
    })

    it("starts with -i and the input name", () => {
        const args = buildRotateArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            rotation: 0,
            flipH: false,
            flipV: true,
        })
        expect(args[0]).toBe("-i")
        expect(args[1]).toBe("input.mp4")
    })
})
