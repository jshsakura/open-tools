import { describe, it, expect } from "vitest"
import {
    buildTrimArgs,
    parseTimeToSeconds,
    formatSeconds,
} from "./video-trimmer.utils"

describe("buildTrimArgs", () => {
    it("uses -c copy in fast mode (no re-encode)", () => {
        const args = buildTrimArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            start: 5,
            end: 15,
            reencode: false,
        })
        expect(args).toContain("-c")
        expect(args).toContain("copy")
        expect(args).not.toContain("libx264")
        expect(args).not.toContain("aac")
    })

    it("uses libx264 / aac in accurate mode (re-encode)", () => {
        const args = buildTrimArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            start: 5,
            end: 15,
            reencode: true,
        })
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args).toContain("-c:a")
        expect(args).toContain("aac")
        expect(args).not.toContain("copy")
    })

    it("computes duration as end - start and passes it via -t", () => {
        const args = buildTrimArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            start: 10,
            end: 32.5,
            reencode: false,
        })
        const tIndex = args.indexOf("-t")
        expect(tIndex).toBeGreaterThanOrEqual(0)
        expect(args[tIndex + 1]).toBe("22.5")
    })

    it("places -ss with start before -i for fast seeking", () => {
        const args = buildTrimArgs({
            inputName: "input.mp4",
            outputName: "output.mp4",
            start: 3,
            end: 8,
            reencode: false,
        })
        const ssIndex = args.indexOf("-ss")
        const inputIndex = args.indexOf("-i")
        expect(ssIndex).toBeGreaterThanOrEqual(0)
        expect(args[ssIndex + 1]).toBe("3")
        expect(ssIndex).toBeLessThan(inputIndex)
    })

    it("ends with the output name", () => {
        const args = buildTrimArgs({
            inputName: "input.mp4",
            outputName: "trimmed.mp4",
            start: 0,
            end: 5,
            reencode: true,
        })
        expect(args[args.length - 1]).toBe("trimmed.mp4")
    })

    it("throws when start >= end", () => {
        expect(() =>
            buildTrimArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                start: 10,
                end: 10,
                reencode: false,
            }),
        ).toThrow()
        expect(() =>
            buildTrimArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                start: 20,
                end: 5,
                reencode: false,
            }),
        ).toThrow()
    })

    it("throws on negative start", () => {
        expect(() =>
            buildTrimArgs({
                inputName: "input.mp4",
                outputName: "output.mp4",
                start: -1,
                end: 5,
                reencode: false,
            }),
        ).toThrow()
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
    it("returns NaN for malformed input", () => {
        expect(parseTimeToSeconds("abc")).toBeNaN()
        expect(parseTimeToSeconds("")).toBeNaN()
        expect(parseTimeToSeconds("1:2:3:4")).toBeNaN()
        expect(parseTimeToSeconds("-5")).toBeNaN()
    })
})

describe("formatSeconds", () => {
    it("formats as zero-padded HH:MM:SS", () => {
        expect(formatSeconds(3723)).toBe("01:02:03")
        expect(formatSeconds(150)).toBe("00:02:30")
        expect(formatSeconds(0)).toBe("00:00:00")
    })
    it("floors fractional seconds", () => {
        expect(formatSeconds(90.9)).toBe("00:01:30")
    })
    it("clamps negative / non-finite to 00:00:00", () => {
        expect(formatSeconds(-10)).toBe("00:00:00")
        expect(formatSeconds(NaN)).toBe("00:00:00")
    })

    it("round-trips with parseTimeToSeconds", () => {
        expect(parseTimeToSeconds(formatSeconds(3661))).toBe(3661)
    })
})
