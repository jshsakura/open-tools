// Pure parser for SVG path "d" attribute data.
// Splits a path string into discrete command segments with their numeric args.

export interface PathSegment {
  // The raw command letter, e.g. "M", "l", "C", "Z".
  command: string
  // Uppercase form for convenience.
  type: string
  // True when the command letter was lowercase (relative coordinates).
  relative: boolean
  // The numeric arguments that follow the command.
  args: number[]
}

// Expected argument count per command type (uppercase). Used for validation.
const ARG_COUNT: Record<string, number> = {
  M: 2,
  L: 2,
  H: 1,
  V: 1,
  C: 6,
  S: 4,
  Q: 4,
  T: 2,
  A: 7,
  Z: 0,
}

const COMMAND_LETTERS = "MLHVCSQTAZ"

export function isCommandLetter(ch: string): boolean {
  return COMMAND_LETTERS.includes(ch.toUpperCase())
}

// Tokenise the path into command letters and numbers.
// Handles missing whitespace ("M10,20L30") and signed/scientific numbers.
function tokenize(d: string): string[] {
  const tokens: string[] = []
  const numberRe = /-?(?:\d*\.\d+|\d+\.?)(?:[eE][-+]?\d+)?/g
  let i = 0
  while (i < d.length) {
    const ch = d[i]
    if (isCommandLetter(ch)) {
      tokens.push(ch)
      i++
      continue
    }
    if (ch === " " || ch === "," || ch === "\t" || ch === "\n" || ch === "\r") {
      i++
      continue
    }
    if (ch === "-" || ch === "." || (ch >= "0" && ch <= "9")) {
      numberRe.lastIndex = i
      const match = numberRe.exec(d)
      if (match && match.index === i && match[0].length > 0) {
        tokens.push(match[0])
        i += match[0].length
        continue
      }
    }
    // Unknown character — skip it (malformed input is tolerated).
    i++
  }
  return tokens
}

export interface ParseResult {
  segments: PathSegment[]
  // Human-readable warnings for malformed / unexpected input.
  errors: string[]
}

export function parsePath(d: string): ParseResult {
  const segments: PathSegment[] = []
  const errors: string[] = []
  if (!d || !d.trim()) {
    return { segments, errors }
  }

  const tokens = tokenize(d)
  let i = 0
  let current: { command: string; type: string } | null = null

  while (i < tokens.length) {
    const token = tokens[i]
    if (isCommandLetter(token)) {
      current = { command: token, type: token.toUpperCase() }
      i++
      const expected = ARG_COUNT[current.type]
      if (expected === 0) {
        segments.push({
          command: current.command,
          type: current.type,
          relative: current.command !== current.command.toUpperCase(),
          args: [],
        })
        continue
      }
      // Gather expected args (a command may repeat its args, e.g. "L 1 2 3 4").
      let consumedForCommand = 0
      while (i < tokens.length && !isCommandLetter(tokens[i])) {
        const args: number[] = []
        for (let k = 0; k < expected; k++) {
          if (i < tokens.length && !isCommandLetter(tokens[i])) {
            args.push(Number(tokens[i]))
            i++
          }
        }
        if (args.length < expected) {
          errors.push(
            `Command "${current.command}" expects ${expected} argument(s) but got ${args.length}.`,
          )
        }
        segments.push({
          command: current.command,
          type: current.type,
          relative: current.command !== current.command.toUpperCase(),
          args,
        })
        consumedForCommand++
      }
      if (consumedForCommand === 0) {
        errors.push(`Command "${current.command}" is missing its arguments.`)
      }
    } else {
      errors.push(`Unexpected value "${token}" before any command.`)
      i++
    }
  }

  return { segments, errors }
}

// Short label per command type for UI display.
export const COMMAND_LABELS: Record<string, string> = {
  M: "Move To",
  L: "Line To",
  H: "Horizontal Line",
  V: "Vertical Line",
  C: "Cubic Bézier",
  S: "Smooth Cubic",
  Q: "Quadratic Bézier",
  T: "Smooth Quadratic",
  A: "Arc",
  Z: "Close Path",
}

export function describeSegment(seg: PathSegment): string {
  const label = COMMAND_LABELS[seg.type] ?? "Unknown"
  return seg.relative ? `${label} (relative)` : label
}
