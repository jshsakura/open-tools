import { describe, expect, it } from "vitest"

import {
  businessDayCount,
  dayDifference,
  isWeekend,
  parseDate,
  ymdBreakdown,
} from "./date-calculator.utils"

const d = (value: string) => parseDate(value) as Date

describe("parseDate", () => {
  it("parses a valid date", () => {
    expect(parseDate("2024-01-15")?.getFullYear()).toBe(2024)
  })

  it("returns null for empty or invalid input", () => {
    expect(parseDate("")).toBeNull()
    expect(parseDate("not-a-date")).toBeNull()
  })
})

describe("dayDifference", () => {
  it("counts plain calendar days", () => {
    expect(dayDifference(d("2024-01-01"), d("2024-01-31"))).toBe(30)
  })

  it("is order independent", () => {
    expect(dayDifference(d("2024-01-31"), d("2024-01-01"))).toBe(30)
  })

  it("adds one when inclusive of the end date", () => {
    expect(dayDifference(d("2024-01-01"), d("2024-01-31"), true)).toBe(31)
  })

  it("spans across a leap-year February", () => {
    expect(dayDifference(d("2024-02-01"), d("2024-03-01"))).toBe(29)
  })
})

describe("ymdBreakdown", () => {
  it("breaks an exact year", () => {
    expect(ymdBreakdown(d("2000-01-01"), d("2001-01-01"))).toEqual({
      years: 1,
      months: 0,
      days: 0,
    })
  })

  it("handles month and day borrows", () => {
    expect(ymdBreakdown(d("2000-01-15"), d("2001-03-10"))).toEqual({
      years: 1,
      months: 1,
      days: 23,
    })
  })

  it("is order independent", () => {
    expect(ymdBreakdown(d("2001-01-01"), d("2000-01-01"))).toEqual({
      years: 1,
      months: 0,
      days: 0,
    })
  })
})

describe("isWeekend", () => {
  it("flags Saturday and Sunday", () => {
    expect(isWeekend(d("2024-06-15"))).toBe(true) // Saturday
    expect(isWeekend(d("2024-06-16"))).toBe(true) // Sunday
  })

  it("does not flag weekdays", () => {
    expect(isWeekend(d("2024-06-17"))).toBe(false) // Monday
  })
})

describe("businessDayCount", () => {
  it("counts weekdays across a full week", () => {
    // Mon 2024-06-17 -> Mon 2024-06-24, exclusive of start.
    expect(businessDayCount(d("2024-06-17"), d("2024-06-24"))).toBe(5)
  })

  it("excludes weekends within the range", () => {
    // Fri 2024-06-14 -> Mon 2024-06-17: only Monday counts.
    expect(businessDayCount(d("2024-06-14"), d("2024-06-17"))).toBe(1)
  })

  it("returns zero for the same day exclusive", () => {
    expect(businessDayCount(d("2024-06-17"), d("2024-06-17"))).toBe(0)
  })

  it("counts the start weekday when inclusive", () => {
    expect(businessDayCount(d("2024-06-17"), d("2024-06-17"), true)).toBe(1)
  })

  it("does not double-count a weekend start when inclusive", () => {
    // Sat 2024-06-15 -> Mon 2024-06-17 inclusive: only Monday.
    expect(businessDayCount(d("2024-06-15"), d("2024-06-17"), true)).toBe(1)
  })
})
