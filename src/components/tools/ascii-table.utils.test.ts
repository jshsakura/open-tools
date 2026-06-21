import { describe, expect, it } from "vitest"

import {
  ASCII_DATA,
  ASCII_EXTENDED_MAX,
  ASCII_MAX,
  asciiRow,
  buildAsciiTable,
  filterAscii,
} from "./ascii-table.utils"

describe("asciiRow", () => {
  it("encodes a printable letter (65 → 'A')", () => {
    const row = asciiRow(65)
    expect(row.char).toBe("A")
    expect(row.name).toBe("A")
    expect(row.dec).toBe(65)
    expect(row.hex).toBe("41")
    expect(row.oct).toBe("101")
    expect(row.bin).toBe("01000001")
    expect(row.isControl).toBe(false)
  })

  it("names control characters (27 → ESC, 0 → NUL)", () => {
    const esc = asciiRow(27)
    expect(esc.name).toBe("ESC")
    expect(esc.description).toBe("Escape")
    expect(esc.isControl).toBe(true)
    expect(esc.char).toBe("")

    const nul = asciiRow(0)
    expect(nul.name).toBe("NUL")
    expect(nul.hex).toBe("00")
    expect(nul.bin).toBe("00000000")
    expect(nul.isControl).toBe(true)
  })

  it("names SPACE (32) but keeps it non-control with a real glyph", () => {
    const space = asciiRow(32)
    expect(space.name).toBe("SPACE")
    expect(space.char).toBe(" ")
    expect(space.isControl).toBe(false)
    expect(space.hex).toBe("20")
  })

  it("names DEL (127) as a control character", () => {
    const del = asciiRow(127)
    expect(del.name).toBe("DEL")
    expect(del.isControl).toBe(true)
  })

  it("pads hex (width 2), octal (width 3) and binary (width 8)", () => {
    const row = asciiRow(7)
    expect(row.hex).toBe("07")
    expect(row.oct).toBe("007")
    expect(row.bin).toBe("00000111")
    expect(row.hex).toHaveLength(2)
    expect(row.oct).toHaveLength(3)
    expect(row.bin).toHaveLength(8)
  })

  it("flags extended characters (128–255)", () => {
    const row = asciiRow(200)
    expect(row.isExtended).toBe(true)
    expect(row.hex).toBe("C8")
    expect(asciiRow(127).isExtended).toBe(false)
  })
})

describe("buildAsciiTable", () => {
  it("builds the inclusive standard range by default", () => {
    const rows = buildAsciiTable()
    expect(rows).toHaveLength(ASCII_MAX + 1)
    expect(rows[0].dec).toBe(0)
    expect(rows[rows.length - 1].dec).toBe(ASCII_MAX)
  })

  it("ASCII_DATA covers the full extended range", () => {
    expect(ASCII_DATA).toHaveLength(ASCII_EXTENDED_MAX + 1)
  })
})

describe("filterAscii", () => {
  const rows = buildAsciiTable()

  it("returns all rows for an empty query", () => {
    expect(filterAscii("", rows)).toHaveLength(rows.length)
    expect(filterAscii("   ", rows)).toHaveLength(rows.length)
  })

  it("matches by control name", () => {
    const result = filterAscii("ESC", rows)
    expect(result.some((r) => r.dec === 27)).toBe(true)
  })

  it("matches by description", () => {
    const result = filterAscii("escape", rows)
    expect(result.some((r) => r.dec === 27)).toBe(true)
  })

  it("matches by exact decimal", () => {
    const result = filterAscii("65", rows)
    expect(result.some((r) => r.dec === 65)).toBe(true)
  })

  it("matches by hex with and without 0x prefix", () => {
    expect(filterAscii("41", rows).some((r) => r.dec === 65)).toBe(true)
    expect(filterAscii("0x41", rows).some((r) => r.dec === 65)).toBe(true)
  })

  it("matches by literal character", () => {
    const result = filterAscii("A", rows)
    expect(result.some((r) => r.dec === 65)).toBe(true)
  })
})
