import { describe, it, expect } from "vitest"
import { breakdownMs, formatCountdown, parseDurationToMs } from "./countdown-timer.utils"

describe("breakdownMs", () => {
  it("breaks a known span into days/hours/minutes/seconds", () => {
    // 1d 2h 3m 4s
    const ms = ((((1 * 24 + 2) * 60 + 3) * 60) + 4) * 1000
    expect(breakdownMs(ms)).toEqual({ days: 1, hours: 2, minutes: 3, seconds: 4 })
  })

  it("handles a sub-day span", () => {
    // 1h 1m 1s
    expect(breakdownMs(3661 * 1000)).toEqual({ days: 0, hours: 1, minutes: 1, seconds: 1 })
  })

  it("clamps zero to all-zero parts", () => {
    expect(breakdownMs(0)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })

  it("clamps negative values to zero", () => {
    expect(breakdownMs(-5000)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })

  it("clamps NaN to zero", () => {
    expect(breakdownMs(Number.NaN)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  })
})

describe("formatCountdown", () => {
  it("zero-pads hours, minutes and seconds", () => {
    expect(formatCountdown({ days: 0, hours: 1, minutes: 2, seconds: 3 })).toBe("01:02:03")
  })

  it("formats all zeros", () => {
    expect(formatCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 })).toBe("00:00:00")
  })

  it("prefixes a day segment when days are present", () => {
    expect(formatCountdown({ days: 3, hours: 9, minutes: 5, seconds: 0 })).toBe("3d 09:05:00")
  })
})

describe("parseDurationToMs", () => {
  it("sums hours, minutes and seconds into ms", () => {
    expect(parseDurationToMs(1, 1, 1)).toBe(3661 * 1000)
  })

  it("returns 0 for an empty duration", () => {
    expect(parseDurationToMs(0, 0, 0)).toBe(0)
  })

  it("clamps negative fields to zero", () => {
    expect(parseDurationToMs(-1, -2, -3)).toBe(0)
  })

  it("floors fractional fields", () => {
    expect(parseDurationToMs(0, 0, 1.9)).toBe(1000)
  })

  it("round-trips through breakdownMs", () => {
    const ms = parseDurationToMs(2, 30, 15)
    expect(breakdownMs(ms)).toEqual({ days: 0, hours: 2, minutes: 30, seconds: 15 })
  })
})
