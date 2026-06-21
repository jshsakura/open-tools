const MS_PER_DAY = 1000 * 60 * 60 * 24

export interface YmdBreakdown {
  years: number
  months: number
  days: number
}

/** Parse a YYYY-MM-DD string to a local midnight Date, or null if invalid. */
export function parseDate(value: string): Date | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Calendar-day difference between two dates.
 * When `inclusive` is true the end date itself counts (gap + 1).
 */
export function dayDifference(start: Date, end: Date, inclusive = false): number {
  const a = Math.floor(start.getTime() / MS_PER_DAY)
  const b = Math.floor(end.getTime() / MS_PER_DAY)
  const diff = Math.abs(b - a)
  return inclusive ? diff + 1 : diff
}

/** Break the gap between two dates into whole years, months, and days. */
export function ymdBreakdown(start: Date, end: Date): YmdBreakdown {
  let from = start
  let to = end
  if (to < from) {
    from = end
    to = start
  }

  let years = to.getFullYear() - from.getFullYear()
  let months = to.getMonth() - from.getMonth()
  let days = to.getDate() - from.getDate()

  if (days < 0) {
    const previousMonth = new Date(to.getFullYear(), to.getMonth(), 0)
    days += previousMonth.getDate()
    months -= 1
  }
  if (months < 0) {
    months += 12
    years -= 1
  }

  return { years, months, days }
}

/** True for Saturday (6) and Sunday (0). */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Count business days (Mon–Fri) between two dates.
 * Excludes the start day; includes the end day only when `inclusive` is true.
 */
export function businessDayCount(start: Date, end: Date, inclusive = false): number {
  let from = new Date(start)
  let to = new Date(end)
  if (to < from) {
    const tmp = from
    from = to
    to = tmp
  }
  from.setHours(0, 0, 0, 0)
  to.setHours(0, 0, 0, 0)

  let count = 0
  const cursor = new Date(from)
  // Step from the day after `from` up to and including `to`.
  cursor.setDate(cursor.getDate() + 1)
  while (cursor <= to) {
    if (!isWeekend(cursor)) count += 1
    cursor.setDate(cursor.getDate() + 1)
  }

  if (inclusive && !isWeekend(from)) count += 1
  return count
}
