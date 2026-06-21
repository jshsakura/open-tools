import { describe, expect, it } from "vitest"

import {
  convertSize,
  formatDuration,
  fromBytes,
  toBytes,
  transferSeconds,
} from "./file-size-converter.utils"

describe("toBytes / fromBytes (decimal)", () => {
  it("KB to bytes uses 1000", () => {
    expect(toBytes(1, "KB", "decimal")).toBe(1000)
  })

  it("round-trips across tiers", () => {
    expect(fromBytes(toBytes(2, "GB", "decimal"), "MB", "decimal")).toBe(2000)
    expect(fromBytes(toBytes(1, "TB", "decimal"), "GB", "decimal")).toBe(1000)
    expect(fromBytes(toBytes(1, "PB", "decimal"), "TB", "decimal")).toBe(1000)
  })
})

describe("toBytes (binary)", () => {
  it("KB to bytes uses 1024", () => {
    expect(toBytes(1, "KB", "binary")).toBe(1024)
  })

  it("MB and GB use powers of 1024", () => {
    expect(toBytes(1, "MB", "binary")).toBe(1024 ** 2)
    expect(toBytes(1, "GB", "binary")).toBe(1024 ** 3)
  })
})

describe("convertSize", () => {
  it("converts MB to GB decimally", () => {
    expect(convertSize(2000, "MB", "GB", "decimal")).toBe(2)
  })

  it("decimal vs binary give different results", () => {
    expect(convertSize(1024, "MB", "GB", "decimal")).toBeCloseTo(1.024, 5)
    expect(convertSize(1024, "MB", "GB", "binary")).toBe(1)
  })

  it("returns the same value for identical units", () => {
    expect(convertSize(42, "GB", "GB", "decimal")).toBe(42)
  })
})

describe("bit units", () => {
  it("one byte equals eight bits", () => {
    // 1 byte -> bits: 8 bits = 0.008 Kb
    expect(fromBytes(1, "Kb", "decimal")).toBeCloseTo(0.008, 6)
  })

  it("8 Mb equals 1 MB (decimal)", () => {
    expect(convertSize(8, "Mb", "MB", "decimal")).toBe(1)
  })

  it("1 Gb equals 125 MB (decimal)", () => {
    expect(convertSize(1, "Gb", "MB", "decimal")).toBe(125)
  })
})

describe("transferSeconds", () => {
  it("computes time = size / bandwidth", () => {
    // 100 MB over 100 Mbps -> 8 seconds (800 Mbit / 100 Mbps)
    const bytes = toBytes(100, "MB", "decimal")
    expect(transferSeconds(bytes, 100)).toBe(8)
  })

  it("1000 MB over 8 Mbps", () => {
    const bytes = toBytes(1000, "MB", "decimal")
    // 8000 Mbit / 8 Mbps = 1000 s
    expect(transferSeconds(bytes, 8)).toBe(1000)
  })

  it("returns null for non-positive bandwidth", () => {
    expect(transferSeconds(1000, 0)).toBeNull()
    expect(transferSeconds(1000, -5)).toBeNull()
  })
})

describe("formatDuration", () => {
  it("formats seconds only", () => {
    expect(formatDuration(8)).toBe("8s")
  })

  it("formats hours, minutes, seconds", () => {
    expect(formatDuration(3661)).toBe("1h 1m 1s")
  })

  it("handles invalid input", () => {
    expect(formatDuration(-1)).toBe("-")
  })
})
