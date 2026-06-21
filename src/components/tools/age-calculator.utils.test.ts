import { describe, expect, it } from "vitest"

import {
  koreanCountingAge,
  koreanManAge,
  koreanYearAge,
  totalDaysLived,
  totalMonthsLived,
  weekdayKey,
  westernAge,
  zodiacForYear,
} from "./age-calculator.utils"

const d = (value: string) => new Date(`${value}T00:00:00`)

describe("westernAge", () => {
  it("is one year on the exact birthday", () => {
    expect(westernAge(d("2000-06-15"), d("2001-06-15")).years).toBe(1)
  })

  it("is not yet incremented the day before the birthday", () => {
    expect(westernAge(d("2000-06-15"), d("2001-06-14")).years).toBe(0)
  })

  it("breaks down years, months, days", () => {
    expect(westernAge(d("2000-01-15"), d("2001-03-10"))).toEqual({
      years: 1,
      months: 1,
      days: 23,
    })
  })
})

describe("koreanManAge (만나이)", () => {
  it("equals western age (birthday-based)", () => {
    expect(koreanManAge(d("1995-06-15"), d("2026-06-20"))).toBe(31)
  })

  it("is one less before the birthday in that year", () => {
    expect(koreanManAge(d("1995-06-15"), d("2026-06-14"))).toBe(30)
  })
})

describe("koreanCountingAge (세는나이)", () => {
  it("is currentYear - birthYear + 1", () => {
    // born 1995, in 2026 -> 2026 - 1995 + 1 = 32
    expect(koreanCountingAge(d("1995-06-15"), d("2026-01-01"))).toBe(32)
  })

  it("ignores whether the birthday has passed", () => {
    expect(koreanCountingAge(d("1995-12-31"), d("2026-06-20"))).toBe(32)
  })
})

describe("koreanYearAge (연나이)", () => {
  it("is currentYear - birthYear", () => {
    expect(koreanYearAge(d("1995-06-15"), d("2026-06-20"))).toBe(31)
  })
})

describe("totals", () => {
  it("counts whole days lived", () => {
    expect(totalDaysLived(d("2024-01-01"), d("2024-01-31"))).toBe(30)
  })

  it("counts whole months lived", () => {
    expect(totalMonthsLived(d("2000-01-01"), d("2001-03-01"))).toBe(14)
  })
})

describe("zodiacForYear (띠)", () => {
  it("maps 2020 to the rat", () => {
    expect(zodiacForYear(2020)).toBe("rat")
  })

  it("maps 2021 to the ox", () => {
    expect(zodiacForYear(2021)).toBe("ox")
  })

  it("maps 1988 to the dragon", () => {
    expect(zodiacForYear(1988)).toBe("dragon")
  })

  it("maps 1995 to the pig", () => {
    expect(zodiacForYear(1995)).toBe("pig")
  })

  it("wraps the 12-year cycle", () => {
    expect(zodiacForYear(2032)).toBe("rat")
  })
})

describe("weekdayKey", () => {
  it("returns saturday for a known Saturday", () => {
    expect(weekdayKey(d("2024-06-15"))).toBe("saturday")
  })

  it("returns thursday for a known Thursday", () => {
    expect(weekdayKey(d("1995-06-15"))).toBe("thursday")
  })
})
