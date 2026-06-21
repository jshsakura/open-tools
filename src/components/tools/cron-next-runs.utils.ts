import { CronExpressionParser } from "cron-parser"
import cronstrue from "cronstrue/i18n"

export type CronTimezone = "local" | "utc"

const MAX_RUNS = 100

/**
 * Human-readable description of a cron expression.
 * Falls back to the "en" locale for anything other than "ko".
 * Throws when the expression is invalid (throwExceptionOnParseError).
 */
export function describeCron(expr: string, locale: string): string {
  const trimmed = expr.trim()
  if (!trimmed) throw new Error("Empty cron expression")

  const cronstrueLocale = locale === "ko" ? "ko" : "en"
  return cronstrue.toString(trimmed, {
    locale: cronstrueLocale,
    throwExceptionOnParseError: true,
  })
}

/**
 * Next `count` scheduled run times for a cron expression.
 * `tz` selects the timezone the schedule is evaluated in:
 *   - "utc"   → "UTC"
 *   - "local" → the host/browser local timezone (cron-parser default).
 * Returns an array of native Date objects. Throws when the expression is invalid.
 */
export function nextRuns(expr: string, count: number, tz: CronTimezone): Date[] {
  const trimmed = expr.trim()
  if (!trimmed) throw new Error("Empty cron expression")

  const safeCount = Math.max(1, Math.min(MAX_RUNS, Math.floor(count)))

  const interval = CronExpressionParser.parse(
    trimmed,
    tz === "utc" ? { tz: "UTC" } : {},
  )

  const runs: Date[] = []
  for (let i = 0; i < safeCount; i++) {
    runs.push(interval.next().toDate())
  }
  return runs
}
