import { describe, it, expect } from "vitest"
import { buildGifArgs, parseTimeToSeconds, formatSeconds } from "./video-to-gif.utils"

describe("buildGifArgs", () => {
    it("builds the palette filter graph with fps and lanczos scale", () => {
        const args = buildGifArgs({
            inputName: "input.mp4",
            outputName: "output.gif",
            fps: 15,
            width: 480,
            start: 0,
            duration: 0,
        })
        const vfIndex = args.indexOf("-vf")
        expect(vfIndex).toBeGreaterThan(-1)
        const filter = args[vfIndex + 1]
        expect(filter).toContain("fps=15")
        expect(filter).toContain("scale=480:-1:flags=lanczos")
        expect(filter).toContain("palettegen")
        expect(filter).toContain("paletteuse")
        expect(filter).toContain("split[s0][s1]")
    })

    it("places -i, filter and output in the correct order", () => {
        const args = buildGifArgs({
            inputName: "in.webm",
            outputName: "out.gif",
            fps: 10,
            width: 320,
            start: 0,
            duration: 0,
        })
        expect(args[0]).toBe("-i")
        expect(args[1]).toBe("in.webm")
        expect(args[args.length - 1]).toBe("out.gif")
    })

    it("omits -ss and -t when start and duration are zero", () => {
        const args = buildGifArgs({
            inputName: "input.mp4",
            outputName: "output.gif",
            fps: 12,
            width: 320,
            start: 0,
            duration: 0,
        })
        expect(args).not.toContain("-ss")
        expect(args).not.toContain("-t")
    })

    it("places -ss before -i for fast seeking", () => {
        const args = buildGifArgs({
            inputName: "input.mp4",
            outputName: "output.gif",
            fps: 12,
            width: 320,
            start: 5,
            duration: 0,
        })
        const ssIndex = args.indexOf("-ss")
        const iIndex = args.indexOf("-i")
        expect(ssIndex).toBeGreaterThan(-1)
        expect(ssIndex).toBeLessThan(iIndex)
        expect(args[ssIndex + 1]).toBe("0:05")
    })

    it("places -t (duration) after -i", () => {
        const args = buildGifArgs({
            inputName: "input.mp4",
            outputName: "output.gif",
            fps: 12,
            width: 320,
            start: 2,
            duration: 3.5,
        })
        const iIndex = args.indexOf("-i")
        const tIndex = args.indexOf("-t")
        expect(tIndex).toBeGreaterThan(iIndex)
        expect(args[tIndex + 1]).toBe("3.5")
    })

    it("clamps fps and rounds width to safe values", () => {
        const args = buildGifArgs({
            inputName: "input.mp4",
            outputName: "output.gif",
            fps: 999,
            width: 320.7,
            start: 0,
            duration: 0,
        })
        const filter = args[args.indexOf("-vf") + 1]
        expect(filter).toContain("fps=60")
        expect(filter).toContain("scale=321:-1")
    })
})

describe("parseTimeToSeconds", () => {
    it("parses HH:MM:SS", () => {
        expect(parseTimeToSeconds("01:02:03")).toBe(3723)
    })
    it("parses MM:SS", () => {
        expect(parseTimeToSeconds("02:30")).toBe(150)
    })
    it("parses plain seconds", () => {
        expect(parseTimeToSeconds("45")).toBe(45)
    })
    it("parses fractional seconds", () => {
        expect(parseTimeToSeconds("00:00:01.5")).toBe(1.5)
    })
    it("returns 0 for empty or invalid input", () => {
        expect(parseTimeToSeconds("")).toBe(0)
        expect(parseTimeToSeconds("  ")).toBe(0)
        expect(parseTimeToSeconds("abc")).toBe(0)
        expect(parseTimeToSeconds("1:2:3:4")).toBe(0)
        expect(parseTimeToSeconds("-5")).toBe(0)
    })
})

describe("formatSeconds", () => {
    it("formats under an hour as MM:SS", () => {
        expect(formatSeconds(0)).toBe("0:00")
        expect(formatSeconds(5)).toBe("0:05")
        expect(formatSeconds(150)).toBe("2:30")
    })
    it("formats an hour or more as HH:MM:SS", () => {
        expect(formatSeconds(3723)).toBe("1:02:03")
    })
    it("floors fractional seconds", () => {
        expect(formatSeconds(1.9)).toBe("0:01")
    })
    it("clamps negatives to zero", () => {
        expect(formatSeconds(-10)).toBe("0:00")
    })
})
