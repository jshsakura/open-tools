import { describe, it, expect } from "vitest"
import {
    buildScaleFilter,
    buildResizeArgs,
    PRESET_HEIGHTS,
} from "./video-resizer.utils"

describe("buildScaleFilter", () => {
    it("uses -2 for the unspecified dimension when aspect is locked", () => {
        expect(buildScaleFilter({ width: 1280, height: 720, lockAspect: true })).toBe(
            "scale=1280:-2",
        )
    })

    it("ignores the explicit height when locked", () => {
        // height is irrelevant when locked — only width pins the scale.
        expect(buildScaleFilter({ width: 640, height: 9999, lockAspect: true })).toBe(
            "scale=640:-2",
        )
    })

    it("uses both dimensions when aspect is unlocked", () => {
        expect(buildScaleFilter({ width: 1280, height: 720, lockAspect: false })).toBe(
            "scale=1280:720",
        )
    })

    it("rounds odd dimensions to even", () => {
        expect(buildScaleFilter({ width: 1281, height: 721, lockAspect: false })).toBe(
            "scale=1280:720",
        )
    })

    it("never produces a dimension below 2", () => {
        expect(buildScaleFilter({ width: 1, height: 1, lockAspect: false })).toBe(
            "scale=2:2",
        )
    })
})

describe("buildResizeArgs", () => {
    it("includes the libx264 video encoder", () => {
        const args = buildResizeArgs({
            inputName: "input.mp4",
            outputName: "resized.mp4",
            width: 1280,
            height: 720,
            lockAspect: false,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
    })

    it("includes the aac audio encoder", () => {
        const args = buildResizeArgs({
            inputName: "input.mp4",
            outputName: "resized.mp4",
            width: 1280,
            height: 720,
            lockAspect: false,
        })
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
    })

    it("passes the locked scale filter via -vf", () => {
        const args = buildResizeArgs({
            inputName: "input.mp4",
            outputName: "resized.mp4",
            width: 1280,
            height: 720,
            lockAspect: true,
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThanOrEqual(0)
        expect(args[vfIndex + 1]).toBe("scale=1280:-2")
    })

    it("passes the unlocked scale filter via -vf", () => {
        const args = buildResizeArgs({
            inputName: "input.mp4",
            outputName: "resized.mp4",
            width: 854,
            height: 480,
            lockAspect: false,
        })
        const vfIndex = args.indexOf("-vf")
        expect(args[vfIndex + 1]).toBe("scale=854:480")
    })

    it("reads the input first and ends with the output name", () => {
        const args = buildResizeArgs({
            inputName: "input.mp4",
            outputName: "resized.mp4",
            width: 1920,
            height: 1080,
            lockAspect: false,
        })
        expect(args[0]).toBe("-i")
        expect(args[1]).toBe("input.mp4")
        expect(args[args.length - 1]).toBe("resized.mp4")
    })

    it("throws on non-positive width", () => {
        expect(() =>
            buildResizeArgs({
                inputName: "input.mp4",
                outputName: "resized.mp4",
                width: 0,
                height: 720,
                lockAspect: true,
            }),
        ).toThrow()
    })

    it("throws on non-positive height when aspect is unlocked", () => {
        expect(() =>
            buildResizeArgs({
                inputName: "input.mp4",
                outputName: "resized.mp4",
                width: 1280,
                height: 0,
                lockAspect: false,
            }),
        ).toThrow()
    })

    it("does NOT require a valid height when aspect is locked", () => {
        expect(() =>
            buildResizeArgs({
                inputName: "input.mp4",
                outputName: "resized.mp4",
                width: 1280,
                height: 0,
                lockAspect: true,
            }),
        ).not.toThrow()
    })
})

describe("PRESET_HEIGHTS", () => {
    it("maps preset labels to the correct vertical resolution", () => {
        expect(PRESET_HEIGHTS["2160p"]).toBe(2160)
        expect(PRESET_HEIGHTS["1440p"]).toBe(1440)
        expect(PRESET_HEIGHTS["1080p"]).toBe(1080)
        expect(PRESET_HEIGHTS["720p"]).toBe(720)
        expect(PRESET_HEIGHTS["480p"]).toBe(480)
        expect(PRESET_HEIGHTS["360p"]).toBe(360)
    })

    it("exposes exactly the six standard presets", () => {
        expect(Object.keys(PRESET_HEIGHTS)).toEqual([
            "2160p",
            "1440p",
            "1080p",
            "720p",
            "480p",
            "360p",
        ])
    })
})
