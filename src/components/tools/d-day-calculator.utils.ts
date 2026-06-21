const MS_PER_DAY = 1000 * 60 * 60 * 24

/** Parse a YYYY-MM-DD string into a local midnight Date, or null if invalid. */
export function parseDateInput(value: string): Date | null {
  if (!value) return null
  const date = new Date(`${value}T00:00:00`)
  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Whole-day signed difference from `from` to `to`.
 * Positive when `to` is in the future relative to `from`.
 */
export function daysUntil(from: Date, to: Date): number {
  const fromMidnight = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  const toMidnight = new Date(to.getFullYear(), to.getMonth(), to.getDate())
  return Math.round((toMidnight.getTime() - fromMidnight.getTime()) / MS_PER_DAY)
}

/** True when the date falls on Saturday (6) or Sunday (0). */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

/**
 * Count business days (Mon-Fri) between `from` (exclusive) and `to` (inclusive),
 * signed by direction. Mirrors daysUntil's sign convention.
 */
export function businessDaysUntil(from: Date, to: Date): number {
  const total = daysUntil(from, to)
  if (total === 0) return 0

  const step = total > 0 ? 1 : -1
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate())
  let business = 0

  for (let i = 0; i < Math.abs(total); i++) {
    cursor.setDate(cursor.getDate() + step)
    if (!isWeekend(cursor)) business++
  }

  return step * business
}

/**
 * Format a signed day difference as a D-day label.
 * Today => "D-Day", future => "D-N", past => "D+N".
 */
export function formatDday(diff: number): string {
  if (diff === 0) return "D-Day"
  if (diff > 0) return `D-${diff}`
  return `D+${Math.abs(diff)}`
}
