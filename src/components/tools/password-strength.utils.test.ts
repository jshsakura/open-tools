import { describe, it, expect } from "vitest"
import { estimateStrength, formatCrackTime } from "./password-strength.utils"

describe("estimateStrength - empty", () => {
  it("returns zeroed result for empty string", () => {
    const r = estimateStrength("")
    expect(r.entropyBits).toBe(0)
    expect(r.score).toBe(0)
    expect(r.warnings).toEqual([])
  })
})

describe("estimateStrength - entropy math", () => {
  it("computes raw entropy from pool size and length", () => {
    // "abcd" uses lowercase pool (26), but contains the sequence a-b-c-d so it
    // is penalized; verify a non-sequential lowercase string instead.
    const r = estimateStrength("xmqz")
    // 4 chars * log2(26) ~= 18.8 bits
    expect(r.entropyBits).toBeGreaterThan(18)
    expect(r.entropyBits).toBeLessThan(19)
  })

  it("larger pool yields more entropy for same length", () => {
    const lower = estimateStrength("xmqzkr")
    const mixed = estimateStrength("xM9z!r")
    expect(mixed.entropyBits).toBeGreaterThan(lower.entropyBits)
  })
})

describe("estimateStrength - common passwords score low", () => {
  it("flags a known common password and scores 0", () => {
    const r = estimateStrength("password")
    expect(r.warnings).toContain("common")
    expect(r.score).toBe(0)
  })

  it("flags Password123! style (common base + suffix) as weak", () => {
    const r = estimateStrength("Password123!")
    expect(r.warnings).toContain("common")
    expect(r.score).toBeLessThanOrEqual(2)
  })
})

describe("estimateStrength - pattern penalties", () => {
  it("penalizes sequential runs (abc / 123)", () => {
    const seq = estimateStrength("abcdmkqz")
    expect(seq.warnings).toContain("sequence")
  })

  it("penalizes repeated characters (aaa)", () => {
    const rep = estimateStrength("xaaaqmkz")
    expect(rep.warnings).toContain("repeat")
  })

  it("penalizes keyboard patterns (qwerty)", () => {
    const kb = estimateStrength("qwertymx")
    expect(kb.warnings).toContain("keyboard")
  })

  it("penalty reduces entropy below the raw value", () => {
    const clean = estimateStrength("xmqzkrtv")
    const repeated = estimateStrength("xaaaqmkz")
    // same length & pool, but the repeated one carries a penalty
    expect(repeated.entropyBits).toBeLessThan(clean.entropyBits)
  })

  it("warns when too short", () => {
    expect(estimateStrength("xM9!").warnings).toContain("short")
  })
})

describe("estimateStrength - long random scores high", () => {
  it("rates a long mixed random password as strong", () => {
    const r = estimateStrength("xT9#mvKp2qLw7$bnRZ")
    expect(r.entropyBits).toBeGreaterThan(80)
    expect(r.score).toBe(4)
  })

  it("crack times grow with entropy", () => {
    const weak = estimateStrength("xM9!ab")
    const strong = estimateStrength("xT9#mvKp2qLw7$bnRZ")
    expect(strong.crackTimes.offlineSeconds).toBeGreaterThan(
      weak.crackTimes.offlineSeconds,
    )
  })

  it("offline cracking is faster than online for same password", () => {
    const r = estimateStrength("xT9#mvKp2qLw7$bnRZ")
    expect(r.crackTimes.offlineSeconds).toBeLessThan(r.crackTimes.onlineSeconds)
    expect(r.crackTimes.supercomputerSeconds).toBeLessThan(
      r.crackTimes.offlineSeconds,
    )
  })
})

describe("formatCrackTime", () => {
  it("formats sub-second as instant", () => {
    expect(formatCrackTime(0.4)).toBe("instant")
  })
  it("formats seconds, minutes, hours", () => {
    expect(formatCrackTime(30)).toBe("30 sec")
    expect(formatCrackTime(120)).toBe("2 min")
    expect(formatCrackTime(7200)).toBe("2 hr")
  })
  it("formats days and years", () => {
    expect(formatCrackTime(86400 * 3)).toBe("3 days")
    expect(formatCrackTime(31557600 * 5)).toBe("5 years")
  })
  it("caps very large values at centuries", () => {
    expect(formatCrackTime(1e30)).toBe("centuries")
    expect(formatCrackTime(Infinity)).toBe("centuries")
  })
})
