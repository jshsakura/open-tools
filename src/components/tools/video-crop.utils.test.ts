import { describe, it, expect } from "vitest"
import {
    centeredCropForAspect,
    clampCrop,
    buildCropArgs,
} from "./video-crop.utils"

describe("centeredCropForAspect", () => {
    it("crops 1920x1080 to 1:1 as 1080x1080 centered (x=420, y=0)", () => {
        const crop = centeredCropForAspect(1920, 1080, 1, 1)
        expect(crop).toEqual({ w: 1080, h: 1080, x: 420, y: 0 })
    })

    it("crops a 16:9 source (1920x1080) to a 9:16 portrait region", () => {
        const crop = centeredCropForAspect(1920, 1080, 9, 16)
        // Constrained by height: w = 1080 * 9/16 = 607.5 -> floor even 606
        expect(crop.h).toBe(1080)
        expect(crop.w).toBe(606)
        expect(crop.x).toBe(656) // floorEven((1920 - 606) / 2 = 657) -> 656
        expect(crop.y).toBe(0)
        expect(crop.w).toBeLessThanOrEqual(1920)
        expect(crop.h).toBeLessThanOrEqual(1080)
    })

    it("crops 1920x1080 to 4:3 centered", () => {
        const crop = centeredCropForAspect(1920, 1080, 4, 3)
        // height-constrained: w = 1080 * 4/3 = 1440
        expect(crop).toEqual({ w: 1440, h: 1080, x: 240, y: 0 })
    })

    it("always produces even dimensions and offsets", () => {
        const crop = centeredCropForAspect(1281, 723, 3, 4)
        expect(crop.w % 2).toBe(0)
        expect(crop.h % 2).toBe(0)
        expect(crop.x % 2).toBe(0)
        expect(crop.y % 2).toBe(0)
    })

    it("never exceeds the source dimensions", () => {
        const crop = centeredCropForAspect(640, 480, 16, 9)
        expect(crop.w).toBeLessThanOrEqual(640)
        expect(crop.h).toBeLessThanOrEqual(480)
        expect(crop.x + crop.w).toBeLessThanOrEqual(640)
        expect(crop.y + crop.h).toBeLessThanOrEqual(480)
    })

    it("returns the full frame for a matching aspect ratio", () => {
        const crop = centeredCropForAspect(1920, 1080, 16, 9)
        expect(crop).toEqual({ w: 1920, h: 1080, x: 0, y: 0 })
    })

    it("throws on non-positive or non-finite inputs", () => {
        expect(() => centeredCropForAspect(0, 1080, 1, 1)).toThrow()
        expect(() => centeredCropForAspect(1920, 1080, 0, 1)).toThrow()
        expect(() => centeredCropForAspect(1920, NaN, 1, 1)).toThrow()
    })
})

describe("clampCrop", () => {
    it("clamps a crop that exceeds the source size", () => {
        const crop = clampCrop(1920, 1080, { w: 3000, h: 2000, x: 0, y: 0 })
        expect(crop.w).toBe(1920)
        expect(crop.h).toBe(1080)
        expect(crop.x).toBe(0)
        expect(crop.y).toBe(0)
    })

    it("pulls offsets back so the crop stays inside the frame", () => {
        const crop = clampCrop(1920, 1080, { w: 1000, h: 800, x: 1500, y: 900 })
        expect(crop.x + crop.w).toBeLessThanOrEqual(1920)
        expect(crop.y + crop.h).toBeLessThanOrEqual(1080)
    })

    it("forces even dimensions and offsets", () => {
        const crop = clampCrop(1920, 1080, { w: 501, h: 301, x: 101, y: 51 })
        expect(crop.w % 2).toBe(0)
        expect(crop.h % 2).toBe(0)
        expect(crop.x % 2).toBe(0)
        expect(crop.y % 2).toBe(0)
    })

    it("preserves a valid in-bounds crop", () => {
        const crop = clampCrop(1920, 1080, { w: 1080, h: 1080, x: 420, y: 0 })
        expect(crop).toEqual({ w: 1080, h: 1080, x: 420, y: 0 })
    })
})

describe("buildCropArgs", () => {
    it("emits -vf crop=w:h:x:y", () => {
        const args = buildCropArgs({
            inputName: "input.mp4",
            outputName: "cropped.mp4",
            w: 1080,
            h: 1080,
            x: 420,
            y: 0,
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThanOrEqual(0)
        expect(args[vfIndex + 1]).toBe("crop=1080:1080:420:0")
    })

    it("re-encodes with libx264 and aac", () => {
        const args = buildCropArgs({
            inputName: "input.mp4",
            outputName: "cropped.mp4",
            w: 640,
            h: 480,
            x: 0,
            y: 0,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
        expect(args).not.toContain("copy")
    })

    it("reads input first and ends with the output name", () => {
        const args = buildCropArgs({
            inputName: "input.webm",
            outputName: "cropped.mp4",
            w: 100,
            h: 100,
            x: 0,
            y: 0,
        })
        expect(args[0]).toBe("-i")
        expect(args[1]).toBe("input.webm")
        expect(args[args.length - 1]).toBe("cropped.mp4")
    })

    it("throws on non-positive dimensions", () => {
        expect(() =>
            buildCropArgs({
                inputName: "input.mp4",
                outputName: "out.mp4",
                w: 0,
                h: 480,
                x: 0,
                y: 0,
            }),
        ).toThrow()
    })

    it("throws on negative offsets", () => {
        expect(() =>
            buildCropArgs({
                inputName: "input.mp4",
                outputName: "out.mp4",
                w: 640,
                h: 480,
                x: -10,
                y: 0,
            }),
        ).toThrow()
    })

    it("throws on non-finite values", () => {
        expect(() =>
            buildCropArgs({
                inputName: "input.mp4",
                outputName: "out.mp4",
                w: 640,
                h: NaN,
                x: 0,
                y: 0,
            }),
        ).toThrow()
    })
})
