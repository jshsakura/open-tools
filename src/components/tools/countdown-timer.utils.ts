export interface CountdownParts {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const MS_PER_SECOND = 1000
const MS_PER_MINUTE = MS_PER_SECOND * 60
const MS_PER_HOUR = MS_PER_MINUTE * 60
const MS_PER_DAY = MS_PER_HOUR * 24

/**
 * Break a millisecond span into whole days/hours/minutes/seconds.
 * Negative or zero input clamps to all-zero parts.
 */
export function breakdownMs(ms: number): CountdownParts {
  const safe = Number.isFinite(ms) && ms > 0 ? Math.floor(ms) : 0

  return {
    days: Math.floor(safe / MS_PER_DAY),
    hours: Math.floor((safe % MS_PER_DAY) / MS_PER_HOUR),
    minutes: Math.floor((safe % MS_PER_HOUR) / MS_PER_MINUTE),
    seconds: Math.floor((safe % MS_PER_MINUTE) / MS_PER_SECOND),
  }
}

function pad(value: number): string {
  return String(Math.max(0, value)).padStart(2, "0")
}

/**
 * Format parts as a zero-padded clock string.
 * Includes a leading "Dd " segment only when days > 0.
 */
export function formatCountdown(parts: CountdownParts): string {
  const clock = `${pad(parts.hours)}:${pad(parts.minutes)}:${pad(parts.seconds)}`
  return parts.days > 0 ? `${parts.days}d ${clock}` : clock
}

/**
 * Convert an hours/minutes/seconds duration into milliseconds.
 * Each field is clamped to a non-negative integer; invalid input becomes 0.
 */
export function parseDurationToMs(hours: number, minutes: number, seconds: number): number {
  const safe = (value: number) =>
    Number.isFinite(value) && value > 0 ? Math.floor(value) : 0

  return safe(hours) * MS_PER_HOUR + safe(minutes) * MS_PER_MINUTE + safe(seconds) * MS_PER_SECOND
}
