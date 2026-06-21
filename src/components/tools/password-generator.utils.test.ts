import { describe, it, expect } from "vitest"
import {
  generatePassword,
  effectivePool,
  type GenerateOptions,
  type RandomFn,
} from "./password-generator.utils"

// Deterministic randomness: fills with an incrementing counter so picks/shuffle
// are predictable but still exercise the modulo indexing.
function seqRandom(start = 0): RandomFn {
  let counter = start
  return (array: Uint32Array) => {
    for (let i = 0; i < array.length; i++) array[i] = counter++
    return array
  }
}

const ALL_ON: GenerateOptions = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  excludeSimilar: false,
}

describe("generatePassword - length", () => {
  it("respects the requested length", () => {
    const pw = generatePassword({ ...ALL_ON, length: 24 }, seqRandom())
    expect(pw).toHaveLength(24)
  })

  it("returns empty string when length is 0", () => {
    expect(generatePassword({ ...ALL_ON, length: 0 }, seqRandom())).toBe("")
  })

  it("returns empty string when no set enabled", () => {
    const opts: GenerateOptions = {
      ...ALL_ON,
      uppercase: false,
      lowercase: false,
      numbers: false,
      symbols: false,
    }
    expect(generatePassword(opts, seqRandom())).toBe("")
  })
})

describe("generatePassword - guaranteed coverage", () => {
  it("includes at least one char from each enabled set", () => {
    const pw = generatePassword({ ...ALL_ON, length: 8 }, seqRandom(3))
    expect(/[A-Z]/.test(pw)).toBe(true)
    expect(/[a-z]/.test(pw)).toBe(true)
    expect(/[0-9]/.test(pw)).toBe(true)
    expect(/[^A-Za-z0-9]/.test(pw)).toBe(true)
  })

  it("uses only the selected sets", () => {
    const opts: GenerateOptions = {
      ...ALL_ON,
      uppercase: false,
      symbols: false,
    }
    const pw = generatePassword({ ...opts, length: 20 }, seqRandom())
    expect(/^[a-z0-9]+$/.test(pw)).toBe(true)
  })
})

describe("generatePassword - exclude similar", () => {
  it("excludes l, 1, I, O, 0 when enabled", () => {
    const opts: GenerateOptions = { ...ALL_ON, length: 64, excludeSimilar: true }
    // run several times across the seed space to sample the pool widely
    for (let s = 0; s < 30; s++) {
      const pw = generatePassword(opts, seqRandom(s))
      expect(pw).not.toMatch(/[l1IO0]/)
    }
  })

  it("can still include similar chars when not excluded", () => {
    expect(effectivePool({ ...ALL_ON, excludeSimilar: false })).toContain("0")
    expect(effectivePool({ ...ALL_ON, excludeSimilar: true })).not.toContain("0")
  })
})

describe("effectivePool", () => {
  it("combines only enabled sets", () => {
    const pool = effectivePool({
      ...ALL_ON,
      uppercase: true,
      lowercase: false,
      numbers: false,
      symbols: false,
    })
    expect(pool).toBe("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
  })
})
