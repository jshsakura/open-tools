// Text <-> numeric-encoding (binary / hex / decimal / octal) helpers.
//
// Each character of the input text is encoded via its UTF-8 byte sequence
// (TextEncoder), and every byte is rendered in the chosen base. Decoding
// reverses this: tokens are parsed back into bytes and decoded with
// TextDecoder. This keeps multibyte characters (e.g. "한", emoji) lossless.

export type NumberBase = "binary" | "hex" | "decimal" | "octal"
export type Separator = "space" | "none" | "comma"

interface BaseConfig {
  radix: number
  // Fixed width (in characters) of a single byte when separator is "none",
  // so the stream can be split back into bytes unambiguously.
  width: number
}

const BASE_CONFIG: Record<NumberBase, BaseConfig> = {
  binary: { radix: 2, width: 8 },
  octal: { radix: 8, width: 3 },
  decimal: { radix: 10, width: 3 },
  hex: { radix: 16, width: 2 },
}

const SEPARATOR_CHAR: Record<Separator, string> = {
  space: " ",
  none: "",
  comma: ",",
}

const encoder = new TextEncoder()
const decoder = new TextDecoder("utf-8", { fatal: true })

const isValidBase = (base: string): base is NumberBase => base in BASE_CONFIG

const isValidSeparator = (sep: string): sep is Separator => sep in SEPARATOR_CHAR

// Encode plain text into the chosen base, joined by the chosen separator.
// When the separator is "none", each byte is zero-padded to a fixed width so
// the result remains decodable.
export function textToCode(text: string, base: string, sep: string): string {
  if (!isValidBase(base)) {
    throw new Error(`Unsupported base: ${base}`)
  }
  if (!isValidSeparator(sep)) {
    throw new Error(`Unsupported separator: ${sep}`)
  }
  if (text === "") return ""

  const { radix, width } = BASE_CONFIG[base]
  // Binary is conventionally always zero-padded to a full 8-bit byte. Other
  // bases are only padded when there is no separator (so the fixed-width
  // stream stays decodable).
  const padded = base === "binary" || sep === "none"
  const bytes = encoder.encode(text)

  const tokens = Array.from(bytes, (byte) => {
    const token = byte.toString(radix)
    return padded ? token.padStart(width, "0") : token
  })

  return tokens.join(SEPARATOR_CHAR[sep])
}

// Split an encoded string into per-byte tokens. With an explicit separator we
// split on it (collapsing extra whitespace); with "none" we slice into
// fixed-width chunks based on the base.
function tokenize(code: string, base: NumberBase, sep: Separator): string[] {
  const trimmed = code.trim()
  if (trimmed === "") return []

  if (sep === "none") {
    const { width } = BASE_CONFIG[base]
    const compact = trimmed.replace(/\s+/g, "")
    if (compact.length % width !== 0) {
      throw new Error(
        `Input length (${compact.length}) is not a multiple of ${width}`,
      )
    }
    const tokens: string[] = []
    for (let i = 0; i < compact.length; i += width) {
      tokens.push(compact.slice(i, i + width))
    }
    return tokens
  }

  const splitter = sep === "comma" ? /[\s,]+/ : /\s+/
  return trimmed.split(splitter).filter(Boolean)
}

// Decode an encoded string back into text. Each token must be a valid byte
// (0-255) in the chosen base; otherwise an error is thrown.
export function codeToText(code: string, base: string, sep: string): string {
  if (!isValidBase(base)) {
    throw new Error(`Unsupported base: ${base}`)
  }
  if (!isValidSeparator(sep)) {
    throw new Error(`Unsupported separator: ${sep}`)
  }

  const tokens = tokenize(code, base, sep)
  if (tokens.length === 0) return ""

  const { radix } = BASE_CONFIG[base]
  const validToken = new RegExp(`^[0-9a-fA-F]+$`)

  const bytes = tokens.map((token) => {
    if (!validToken.test(token)) {
      throw new Error(`Invalid token: "${token}"`)
    }
    const value = parseInt(token, radix)
    if (Number.isNaN(value) || value < 0 || value > 255) {
      throw new Error(`Token out of byte range: "${token}"`)
    }
    // Reject digits that are invalid for this radix (e.g. "9" in octal),
    // which parseInt would otherwise silently truncate.
    if (value.toString(radix) !== token.replace(/^0+(?=.)/, "").toLowerCase()) {
      throw new Error(`Invalid digit for base ${base}: "${token}"`)
    }
    return value
  })

  try {
    return decoder.decode(Uint8Array.from(bytes))
  } catch {
    throw new Error("Decoded bytes are not valid UTF-8")
  }
}
