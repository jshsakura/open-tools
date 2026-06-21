import { describe, it, expect } from "vitest"
import {
  daysUntil,
  businessDaysUntil,
  formatDday,
  isWeekend,
  parseDateInput,
} from "./d-day-calculator.utils"

describe("parseDateInput", () => {
  it("parses a valid date string", () => {
    expect(parseDateInput("2026-01-15")).toBeInstanceOf(Date)
  })
  it("returns null for empty or invalid", () => {
    expect(parseDateInput("")).toBeNull()
    expect(parseDateInput("not-a-date")).toBeNull()
  })
})

describe("daysUntil", () => {
  it("counts future days as positive", () => {
    const from = new Date(2026, 0, 1)
    const to = new Date(2026, 0, 11)
    expect(daysUntil(from, to)).toBe(10)
  })
  it("counts past days as negative", () => {
    const from = new Date(2026, 0, 11)
    const to = new Date(2026, 0, 1)
    expect(daysUntil(from, to)).toBe(-10)
  })
  it("ignores time-of-day", () => {
    const from = new Date(2026, 0, 1, 23, 59)
    const to = new Date(2026, 0, 2, 0, 1)
    expect(daysUntil(from, to)).toBe(1)
  })
})

describe("isWeekend", () => {
  it("detects Saturday and Sunday", () => {
    // 2026-01-03 is a Saturday, 2026-01-04 is a Sunday
    expect(isWeekend(new Date(2026, 0, 3))).toBe(true)
    expect(isWeekend(new Date(2026, 0, 4))).toBe(true)
    // 2026-01-05 is a Monday
    expect(isWeekend(new Date(2026, 0, 5))).toBe(false)
  })
})

describe("businessDaysUntil", () => {
  it("excludes weekends across a full week (Mon -> next Mon = 5)", () => {
    // 2026-01-05 Monday -> 2026-01-12 Monday: 7 calendar days, 5 business
    const from = new Date(2026, 0, 5)
    const to = new Date(2026, 0, 12)
    expect(businessDaysUntil(from, to)).toBe(5)
  })
  it("matches calendar days when no weekend is crossed", () => {
    // Mon -> Fri: 4 business days
    const from = new Date(2026, 0, 5)
    const to = new Date(2026, 0, 9)
    expect(businessDaysUntil(from, to)).toBe(4)
  })
  it("is signed for past dates", () => {
    const from = new Date(2026, 0, 12)
    const to = new Date(2026, 0, 5)
    expect(businessDaysUntil(from, to)).toBe(-5)
  })
})

describe("formatDday", () => {
  it("formats today, future and past", () => {
    expect(formatDday(0)).toBe("D-Day")
    expect(formatDday(10)).toBe("D-10")
    expect(formatDday(-3)).toBe("D+3")
  })
})
