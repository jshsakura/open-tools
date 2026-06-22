import { describe, expect, it } from "vitest"

import { buildConcatList, buildSlideshowArgs } from "./images-to-video.utils"

describe("buildConcatList", () => {
    it("emits a file line and a duration line for each image", () => {
        const list = buildConcatList(["img000.png", "img001.png"], 2)
        expect(list).toContain("file 'img000.png'")
        expect(list).toContain("file 'img001.png'")
        expect(list).toContain("duration 2")
    })

    it("repeats the last file so its frame is held (N images -> N+1 file lines)", () => {
        const names = ["a.png", "b.png", "c.png"]
        const list = buildConcatList(names, 1.5)
        const fileLines = list.split("\n").filter((l) => l.startsWith("file "))
        expect(fileLines).toHaveLength(names.length + 1)
        // The repeated final line matches the last image.
        expect(fileLines[fileLines.length - 1]).toBe("file 'c.png'")
    })

    it("has exactly N duration lines for N images", () => {
        const names = ["a.png", "b.png", "c.png", "d.png"]
        const list = buildConcatList(names, 3)
        const durationLines = list.split("\n").filter((l) => l.startsWith("duration "))
        expect(durationLines).toHaveLength(names.length)
    })

    it("trims trailing zeros from the duration value", () => {
        const list = buildConcatList(["a.png"], 2.5)
        expect(list).toContain("duration 2.5")
    })

    it("falls back to 1 second for non-positive durations", () => {
        const list = buildConcatList(["a.png"], 0)
        expect(list).toContain("duration 1")
    })

    it("returns an empty string for no images", () => {
        expect(buildConcatList([], 2)).toBe("")
    })
})

describe("buildSlideshowArgs", () => {
    const base = { listName: "list.txt", outputName: "out.mp4", width: 1280, height: 720, fps: 30 }

    it("uses the concat demuxer with -f concat -safe 0", () => {
        const args = buildSlideshowArgs(base)
        expect(args).toContain("-f")
        expect(args).toContain("concat")
        expect(args).toContain("-safe")
        expect(args[args.indexOf("-safe") + 1]).toBe("0")
    })

    it("reads the concat list as input", () => {
        const args = buildSlideshowArgs(base)
        expect(args).toContain("-i")
        expect(args[args.indexOf("-i") + 1]).toBe("list.txt")
    })

    it("includes a scale/pad/fps video filter", () => {
        const args = buildSlideshowArgs(base)
        const filter = args[args.indexOf("-vf") + 1]
        expect(filter).toContain("scale=1280:720:force_original_aspect_ratio=decrease")
        expect(filter).toContain("pad=1280:720:(ow-iw)/2:(oh-ih)/2")
        expect(filter).toContain("fps=30")
        expect(filter).toContain("format=yuv420p")
    })

    it("encodes with libx264 and outputs the requested name last", () => {
        const args = buildSlideshowArgs(base)
        expect(args).toContain("-c:v")
        expect(args).toContain("libx264")
        expect(args[args.length - 1]).toBe("out.mp4")
    })
})
