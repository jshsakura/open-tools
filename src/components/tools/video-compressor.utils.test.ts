import { describe, it, expect } from "vitest"
import {
  buildCompressArgs,
  QUALITY_PRESETS,
  percentSaved,
  formatBytes,
} from "./video-compressor.utils"

describe("QUALITY_PRESETS", () => {
  it("maps quality levels to the expected CRF values", () => {
    expect(QUALITY_PRESETS.high.crf).toBe("23")
    expect(QUALITY_PRESETS.medium.crf).toBe("28")
    expect(QUALITY_PRESETS.low.crf).toBe("32")
  })
})

describe("buildCompressArgs", () => {
  it("uses the CRF for the selected quality", () => {
    const args = buildCompressArgs({
      inputName: "input.mp4",
      outputName: "output.mp4",
      quality: "low",
      maxHeight: "keep",
    })
    const crfIndex = args.indexOf("-crf")
    expect(args[crfIndex + 1]).toBe("32")
  })

  it("always includes the libx264 and aac codecs", () => {
    const args = buildCompressArgs({
      inputName: "input.mp4",
      outputName: "output.mp4",
      quality: "medium",
      maxHeight: "keep",
    })
    expect(args).toContain("libx264")
    expect(args).toContain("aac")
    expect(args).toContain("-b:a")
  })

  it("omits the scale filter when keeping the resolution", () => {
    const args = buildCompressArgs({
      inputName: "input.mp4",
      outputName: "output.mp4",
      quality: "high",
      maxHeight: "keep",
    })
    expect(args).not.toContain("-vf")
    expect(args.some((a) => a.startsWith("scale="))).toBe(false)
  })

  it("adds a scale filter only when a max height is set", () => {
    const args = buildCompressArgs({
      inputName: "input.mp4",
      outputName: "output.mp4",
      quality: "medium",
      maxHeight: "720",
    })
    const vfIndex = args.indexOf("-vf")
    expect(vfIndex).toBeGreaterThanOrEqual(0)
    expect(args[vfIndex + 1]).toBe("scale=-2:720")
  })

  it("keeps the input and output names in the right positions", () => {
    const args = buildCompressArgs({
      inputName: "input.mov",
      outputName: "compressed.mp4",
      quality: "medium",
      maxHeight: "1080",
    })
    expect(args[0]).toBe("-i")
    expect(args[1]).toBe("input.mov")
    expect(args[args.length - 1]).toBe("compressed.mp4")
  })
})

describe("percentSaved", () => {
  it("computes the percentage of bytes saved", () => {
    expect(percentSaved(1000, 250)).toBe(75)
    expect(percentSaved(1000, 500)).toBe(50)
  })

  it("returns 0 when the original size is invalid", () => {
    expect(percentSaved(0, 100)).toBe(0)
    expect(percentSaved(-5, 100)).toBe(0)
  })

  it("returns a negative value when the output grew", () => {
    expect(percentSaved(100, 150)).toBe(-50)
  })
})

describe("formatBytes", () => {
  it("formats bytes below 1 KB", () => {
    expect(formatBytes(512)).toBe("512 B")
  })

  it("formats kilobytes with one decimal", () => {
    expect(formatBytes(1536)).toBe("1.5 KB")
  })

  it("formats megabytes", () => {
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB")
  })

  it("returns 0 B for non-positive or invalid input", () => {
    expect(formatBytes(0)).toBe("0 B")
    expect(formatBytes(-100)).toBe("0 B")
    expect(formatBytes(NaN)).toBe("0 B")
  })
})
