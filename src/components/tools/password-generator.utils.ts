// Cryptographically-strong password generation with guaranteed character-set
// coverage and an optional "exclude similar characters" mode.

export interface CharSetOptions {
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

export interface GenerateOptions extends CharSetOptions {
  length: number
  excludeSimilar: boolean
}

// Injectable randomness: fill the provided typed array with random 32-bit
// values. Defaults to crypto.getRandomValues for production use; tests inject
// a deterministic implementation.
export type RandomFn = (array: Uint32Array) => Uint32Array

const defaultRandom: RandomFn = (array) => {
  crypto.getRandomValues(array)
  return array
}

const CHAR_SETS: Record<keyof CharSetOptions, string> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

// Visually similar characters removed when excludeSimilar is enabled.
const SIMILAR_CHARS = new Set(["l", "1", "I", "O", "0"])

const ENABLED_KEYS: (keyof CharSetOptions)[] = [
  "uppercase",
  "lowercase",
  "numbers",
  "symbols",
]

function stripSimilar(charset: string): string {
  return charset
    .split("")
    .filter((c) => !SIMILAR_CHARS.has(c))
    .join("")
}

function activeSets(opts: GenerateOptions): string[] {
  const sets = ENABLED_KEYS.filter((key) => opts[key]).map((key) =>
    opts.excludeSimilar ? stripSimilar(CHAR_SETS[key]) : CHAR_SETS[key],
  )
  // Drop any set that became empty after stripping (defensive).
  return sets.filter((s) => s.length > 0)
}

// Pick one character from a charset using one random 32-bit draw.
function pickChar(charset: string, random: RandomFn): string {
  const buf = random(new Uint32Array(1))
  return charset[buf[0] % charset.length]
}

// Fisher-Yates shuffle driven by injected randomness (immutable: copies input).
function shuffle<T>(items: readonly T[], random: RandomFn): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const buf = random(new Uint32Array(1))
    const j = buf[0] % (i + 1)
    const tmp = out[i]
    out[i] = out[j]
    out[j] = tmp
  }
  return out
}

/**
 * Generate a password.
 * - Honors the requested length.
 * - Guarantees at least one character from every enabled set (when length
 *   allows), then fills the remainder from the combined pool and shuffles.
 * - Optionally excludes visually similar characters.
 * Returns "" when no set is enabled.
 */
export function generatePassword(
  opts: GenerateOptions,
  random: RandomFn = defaultRandom,
): string {
  const sets = activeSets(opts)
  if (sets.length === 0) return ""

  const length = Math.max(0, Math.floor(opts.length))
  if (length === 0) return ""

  const combined = sets.join("")

  // One guaranteed character per enabled set (capped at the requested length).
  const guaranteed = sets.slice(0, length).map((set) => pickChar(set, random))

  const remaining = length - guaranteed.length
  const filler: string[] = []
  for (let i = 0; i < remaining; i++) {
    filler.push(pickChar(combined, random))
  }

  return shuffle([...guaranteed, ...filler], random).join("")
}

/** Build the effective character pool for the given options (for entropy/UI). */
export function effectivePool(opts: GenerateOptions): string {
  return activeSets(opts).join("")
}
