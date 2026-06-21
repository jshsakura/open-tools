export const ASCII_MIN = 0
export const ASCII_PRINTABLE_MIN = 32
export const ASCII_PRINTABLE_MAX = 126
export const ASCII_MAX = 127
export const ASCII_EXTENDED_MAX = 255

const HEX_WIDTH = 2
const BIN_WIDTH = 8
const OCT_WIDTH = 3

export type AsciiRow = {
  dec: number
  hex: string
  oct: string
  bin: string
  char: string
  name: string
  description: string
  isControl: boolean
  isExtended: boolean
}

// Control char names and short descriptions for codes 0–31 and 127.
const CONTROL_INFO: Record<number, [name: string, description: string]> = {
  0: ["NUL", "Null"],
  1: ["SOH", "Start of Heading"],
  2: ["STX", "Start of Text"],
  3: ["ETX", "End of Text"],
  4: ["EOT", "End of Transmission"],
  5: ["ENQ", "Enquiry"],
  6: ["ACK", "Acknowledge"],
  7: ["BEL", "Bell"],
  8: ["BS", "Backspace"],
  9: ["HT", "Horizontal Tab"],
  10: ["LF", "Line Feed"],
  11: ["VT", "Vertical Tab"],
  12: ["FF", "Form Feed"],
  13: ["CR", "Carriage Return"],
  14: ["SO", "Shift Out"],
  15: ["SI", "Shift In"],
  16: ["DLE", "Data Link Escape"],
  17: ["DC1", "Device Control 1"],
  18: ["DC2", "Device Control 2"],
  19: ["DC3", "Device Control 3"],
  20: ["DC4", "Device Control 4"],
  21: ["NAK", "Negative Acknowledge"],
  22: ["SYN", "Synchronous Idle"],
  23: ["ETB", "End of Transmission Block"],
  24: ["CAN", "Cancel"],
  25: ["EM", "End of Medium"],
  26: ["SUB", "Substitute"],
  27: ["ESC", "Escape"],
  28: ["FS", "File Separator"],
  29: ["GS", "Group Separator"],
  30: ["RS", "Record Separator"],
  31: ["US", "Unit Separator"],
  32: ["SPACE", "Space"],
  127: ["DEL", "Delete"],
}

function pad(value: string, width: number): string {
  return value.padStart(width, "0")
}

/**
 * Build a single ASCII reference row for a given code point (0–255).
 * Control characters (0–31, 127) and SPACE (32) get a symbolic name;
 * printable characters use their literal glyph as both char and name.
 */
export function asciiRow(code: number): AsciiRow {
  const hex = pad(code.toString(16).toUpperCase(), HEX_WIDTH)
  const oct = pad(code.toString(8), OCT_WIDTH)
  const bin = pad(code.toString(2), BIN_WIDTH)
  const isControl = code < ASCII_PRINTABLE_MIN || code === ASCII_MAX
  const isExtended = code > ASCII_MAX

  const info = CONTROL_INFO[code]
  if (info) {
    const [name, description] = info
    // SPACE (32) is technically printable but shown with its symbolic name.
    return {
      dec: code,
      hex,
      oct,
      bin,
      char: code === ASCII_PRINTABLE_MIN ? " " : "",
      name,
      description,
      isControl: code !== ASCII_PRINTABLE_MIN,
      isExtended,
    }
  }

  const char = String.fromCharCode(code)
  return {
    dec: code,
    hex,
    oct,
    bin,
    char,
    name: char,
    description: "",
    isControl,
    isExtended,
  }
}

/** Build the full table for the inclusive code range [from, to]. */
export function buildAsciiTable(from = ASCII_MIN, to = ASCII_MAX): AsciiRow[] {
  const rows: AsciiRow[] = []
  for (let code = from; code <= to; code += 1) {
    rows.push(asciiRow(code))
  }
  return rows
}

export const ASCII_DATA: AsciiRow[] = buildAsciiTable(ASCII_MIN, ASCII_EXTENDED_MAX)

/**
 * Filter ASCII rows by a free-text query matched against decimal, hex,
 * octal, binary, glyph, control name, and description (case-insensitive).
 * Supports a leading "0x" prefix and "U+" style hex queries.
 */
export function filterAscii(query: string, rows: AsciiRow[]): AsciiRow[] {
  const trimmed = query.trim()
  if (!trimmed) return rows

  const lower = trimmed.toLowerCase()
  const hexQuery = lower.replace(/^(0x|u\+)/, "")

  return rows.filter((row) => {
    if (String(row.dec) === trimmed) return true
    if (row.hex.toLowerCase() === hexQuery) return true
    if (row.char && row.char === trimmed) return true
    if (row.name.toLowerCase().includes(lower)) return true
    if (row.description.toLowerCase().includes(lower)) return true
    if (row.hex.toLowerCase().includes(hexQuery)) return true
    if (row.bin.includes(trimmed)) return true
    if (row.oct === trimmed) return true
    return false
  })
}
