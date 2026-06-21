import { describe, it, expect } from "vitest"
import {
  DICEWARE_WORDS,
  WORDLIST_SIZE,
  pickWords,
  entropyBits,
  randomInt,
  buildPassphrase,
  passphraseEntropy,
  type RandomBytes,
} from "./passphrase-generator.utils"

// Deterministic randomness: a stateful stream that hands out the given values
// in order across however many calls are made (mirrors crypto.getRandomValues
// producing a continuous stream). Runs out -> 0.
function fixedRandom(values: number[]): RandomBytes {
  let cursor = 0
  return (array: Uint32Array) => {
    for (let i = 0; i < array.length; i++) array[i] = values[cursor++] ?? 0
    return array
  }
}

describe("wordlist", () => {
  it("is sizeable (>= 2000 words)", () => {
    expect(WORDLIST_SIZE).toBeGreaterThanOrEqual(2000)
  })
  it("contains only lowercase a-z words", () => {
    for (const w of DICEWARE_WORDS.slice(0, 200)) {
      expect(w).toMatch(/^[a-z]+$/)
    }
  })
  it("has no duplicate entries", () => {
    expect(new Set(DICEWARE_WORDS).size).toBe(DICEWARE_WORDS.length)
  })
})

describe("pickWords - deterministic with injected randomness", () => {
  it("maps draws to indices via modulo", () => {
    const list = ["a", "b", "c", "d"]
    const picked = pickWords(list, 3, fixedRandom([0, 1, 6]))
    expect(picked).toEqual(["a", "b", "c"]) // 6 % 4 = 2 -> "c"
  })

  it("respects the requested count", () => {
    const picked = pickWords(DICEWARE_WORDS, 5, fixedRandom([0, 1, 2, 3, 4]))
    expect(picked).toHaveLength(5)
  })

  it("returns empty for count 0 or empty list", () => {
    expect(pickWords(DICEWARE_WORDS, 0, fixedRandom([]))).toEqual([])
    expect(pickWords([], 3, fixedRandom([]))).toEqual([])
  })

  it("does not mutate the source list", () => {
    const before = DICEWARE_WORDS.length
    pickWords(DICEWARE_WORDS, 4, fixedRandom([1, 2, 3, 4]))
    expect(DICEWARE_WORDS.length).toBe(before)
  })
})

describe("entropyBits - math", () => {
  it("computes count * log2(listSize)", () => {
    expect(entropyBits(2048, 4)).toBeCloseTo(44, 6) // log2(2048)=11 -> 44
  })
  it("returns 0 for degenerate inputs", () => {
    expect(entropyBits(1, 4)).toBe(0)
    expect(entropyBits(2048, 0)).toBe(0)
  })
})

describe("randomInt", () => {
  it("returns draw mod max", () => {
    expect(randomInt(100, fixedRandom([250]))).toBe(50)
  })
  it("returns 0 when max <= 0", () => {
    expect(randomInt(0, fixedRandom([5]))).toBe(0)
  })
})

describe("buildPassphrase", () => {
  it("is deterministic with injected randomness", () => {
    const opts = {
      wordCount: 3,
      separator: "-",
      capitalize: true,
      includeNumber: false,
    }
    const a = buildPassphrase(opts, fixedRandom([0, 1, 2]))
    const b = buildPassphrase(opts, fixedRandom([0, 1, 2]))
    expect(a).toBe(b)
    expect(a.split("-")).toHaveLength(3)
  })

  it("capitalizes words when enabled", () => {
    const out = buildPassphrase(
      { wordCount: 2, separator: "-", capitalize: true, includeNumber: false },
      fixedRandom([0, 1]),
    )
    expect(out).toMatch(/^[A-Z]/)
  })

  it("appends a number when enabled, drawn from randomness", () => {
    const out = buildPassphrase(
      { wordCount: 2, separator: "-", capitalize: false, includeNumber: true },
      // 2 word draws then the number draw (3rd value) = 250 % 100 = 50
      fixedRandom([0, 1, 250]),
    )
    expect(out).toMatch(/50$/)
  })

  it("honors the separator", () => {
    const out = buildPassphrase(
      { wordCount: 3, separator: ".", capitalize: false, includeNumber: false },
      fixedRandom([0, 1, 2]),
    )
    expect(out.split(".")).toHaveLength(3)
  })
})

describe("passphraseEntropy", () => {
  it("adds number bits when included", () => {
    const base = passphraseEntropy({
      wordCount: 4,
      separator: "-",
      capitalize: true,
      includeNumber: false,
    })
    const withNum = passphraseEntropy({
      wordCount: 4,
      separator: "-",
      capitalize: true,
      includeNumber: true,
    })
    expect(withNum).toBeGreaterThan(base)
    expect(withNum - base).toBeCloseTo(Math.log2(100), 1)
  })
})
