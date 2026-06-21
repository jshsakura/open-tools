const MS_PER_DAY = 1000 * 60 * 60 * 24

export interface AgeBreakdown {
  years: number
  months: number
  days: number
}

/**
 * Korean zodiac animals (띠) in cycle order starting from the Rat.
 * (year - 4) mod 12 maps a Gregorian year to its animal; 2020 = Rat.
 */
export const ZODIAC_KEYS = [
  "rat",
  "ox",
  "tiger",
  "rabbit",
  "dragon",
  "snake",
  "horse",
  "goat",
  "monkey",
  "rooster",
  "dog",
  "pig",
] as const

export type ZodiacKey = (typeof ZODIAC_KEYS)[number]

export const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const

export type WeekdayKey = (typeof WEEKDAY_KEYS)[number]

/** Western (international) age: full years elapsed, birthday-based. */
export function westernAge(birth: Date, target: Date): AgeBreakdown {
  let years = target.getFullYear() - birth.getFullYear()
  let months = target.getMonth() - birth.getMonth()
  let days = target.getDate() - birth.getDate()

  if (days < 0) {
    const previousMonth = new Date(target.getFullYear(), target.getMonth(), 0)
    days += previousMonth.getDate()
    months -= 1
  }
  if (months < 0) {
    months += 12
    years -= 1
  }
  return { years, months, days }
}

/**
 * Korean 만나이 (man-nai): legally identical to western age — based on
 * whether the birthday has passed in the target year.
 */
export function koreanManAge(birth: Date, target: Date): number {
  return westernAge(birth, target).years
}

/**
 * Korean 세는나이 (counting age): currentYear - birthYear + 1.
 * You are 1 at birth and gain a year every January 1st.
 */
export function koreanCountingAge(birth: Date, target: Date): number {
  return target.getFullYear() - birth.getFullYear() + 1
}

/**
 * Korean 연나이 (year age): currentYear - birthYear, ignoring the month/day.
 */
export function koreanYearAge(birth: Date, target: Date): number {
  return target.getFullYear() - birth.getFullYear()
}

/** Whole days lived between two dates. */
export function totalDaysLived(birth: Date, target: Date): number {
  return Math.floor((target.getTime() - birth.getTime()) / MS_PER_DAY)
}

/** Approximate whole months lived (calendar-based). */
export function totalMonthsLived(birth: Date, target: Date): number {
  const { years, months } = westernAge(birth, target)
  return years * 12 + months
}

/** Whole hours lived between two dates. */
export function totalHoursLived(birth: Date, target: Date): number {
  return Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60))
}

/** Korean zodiac animal key for a given Gregorian year. */
export function zodiacForYear(year: number): ZodiacKey {
  const index = (((year - 4) % 12) + 12) % 12
  return ZODIAC_KEYS[index]
}

/** Weekday key (sunday..saturday) for a date. */
export function weekdayKey(date: Date): WeekdayKey {
  return WEEKDAY_KEYS[date.getDay()]
}
