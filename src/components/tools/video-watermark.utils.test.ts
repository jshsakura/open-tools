import { describe, expect, it } from "vitest"

import {
    WATERMARK_POSITIONS,
    buildWatermarkArgs,
    buildWatermarkFilter,
    overlayPosition,
    type WatermarkPosition,
} from "./video-watermark.utils"

describe("overlayPosition — each of the 9 positions maps to correct overlay expr", () => {
    const margin = 10
    const cases: Record<WatermarkPosition, { x: string; y: string }> = {
        "top-left": { x: "10", y: "10" },
        "top-center": { x: "(W-w)/2", y: "10" },
        "top-right": { x: "W-w-10", y: "10" },
        "middle-left": { x: "10", y: "(H-h)/2" },
        center: { x: "(W-w)/2", y: "(H-h)/2" },
        "middle-right": { x: "W-w-10", y: "(H-h)/2" },
        "bottom-left": { x: "10", y: "H-h-10" },
        "bottom-center": { x: "(W-w)/2", y: "H-h-10" },
        "bottom-right": { x: "W-w-10", y: "H-h-10" },
    }

    for (const position of WATERMARK_POSITIONS) {
        it(`${position} → ${cases[position].x}:${cases[position].y}`, () => {
            // Act
            const result = overlayPosition(position, margin)

            // Assert
            expect(result).toEqual(cases[position])
        })
    }

    it("exposes exactly 9 positions", () => {
        expect(WATERMARK_POSITIONS).toHaveLength(9)
    })

    it("rounds and clamps negative margins to 0", () => {
        // Act
        const result = overlayPosition("bottom-right", -5)

        // Assert
        expect(result).toEqual({ x: "W-w-0", y: "H-h-0" })
    })
})

describe("buildWatermarkFilter — opacity colorchannelmixer", () => {
    it("includes colorchannelmixer alpha with the given opacity", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "top-left",
            opacity: 0.5,
            scale: 1,
            margin: 10,
        })

        // Assert
        expect(filter).toContain("format=rgba")
        expect(filter).toContain("colorchannelmixer=aa=0.50")
    })

    it("clamps opacity above 1 down to 1.00", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "center",
            opacity: 5,
            scale: 1,
            margin: 0,
        })

        // Assert
        expect(filter).toContain("colorchannelmixer=aa=1.00")
    })
})

describe("buildWatermarkFilter — scale applied", () => {
    it("inserts a scale filter when scale < 1", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "top-left",
            opacity: 1,
            scale: 0.5,
            margin: 10,
        })

        // Assert
        expect(filter).toContain("scale=iw*0.5:-1")
    })

    it("omits the scale filter when scale is 1 (no-op)", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "top-left",
            opacity: 1,
            scale: 1,
            margin: 10,
        })

        // Assert
        expect(filter).not.toContain("scale=")
    })
})

describe("buildWatermarkFilter — filter_complex structure", () => {
    it("produces the [1:v]...[wm];[0:v][wm]overlay graph", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "bottom-right",
            opacity: 0.8,
            scale: 1,
            margin: 10,
        })

        // Assert
        expect(filter).toBe(
            "[1:v]format=rgba,colorchannelmixer=aa=0.80[wm];[0:v][wm]overlay=W-w-10:H-h-10",
        )
    })

    it("chains scale before format when both scale and opacity set", () => {
        // Act
        const filter = buildWatermarkFilter({
            position: "center",
            opacity: 0.5,
            scale: 0.25,
            margin: 0,
        })

        // Assert
        expect(filter).toBe(
            "[1:v]scale=iw*0.25:-1,format=rgba,colorchannelmixer=aa=0.50[wm];[0:v][wm]overlay=(W-w)/2:(H-h)/2",
        )
    })
})

describe("buildWatermarkArgs — two inputs + overlay", () => {
    const args = buildWatermarkArgs({
        videoName: "input.mp4",
        wmName: "wm.png",
        outputName: "output.mp4",
        position: "bottom-right",
        opacity: 0.7,
        scale: 1,
        margin: 10,
    })

    it("has exactly two -i input flags", () => {
        const inputFlags = args.filter((a) => a === "-i")
        expect(inputFlags).toHaveLength(2)
    })

    it("references both the video and watermark inputs in order", () => {
        expect(args).toEqual([
            "-i",
            "input.mp4",
            "-i",
            "wm.png",
            "-filter_complex",
            expect.stringContaining("overlay="),
            "-c:a",
            "copy",
            "output.mp4",
        ])
    })

    it("copies audio with -c:a copy and ends with the output name", () => {
        expect(args).toContain("-c:a")
        expect(args).toContain("copy")
        expect(args[args.length - 1]).toBe("output.mp4")
    })

    it("includes the filter_complex graph with an overlay node", () => {
        const filterIdx = args.indexOf("-filter_complex")
        expect(filterIdx).toBeGreaterThanOrEqual(0)
        expect(args[filterIdx + 1]).toContain("overlay=")
        expect(args[filterIdx + 1]).toContain("[wm]")
    })
})
