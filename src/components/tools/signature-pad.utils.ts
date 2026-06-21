export interface Point {
  x: number
  y: number
}

export type Background = "transparent" | "white"

/**
 * Midpoint between two points. Used as the control/anchor for quadratic
 * smoothing so strokes render as smooth curves instead of jagged segments.
 */
export function midPoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}

/**
 * Build an SVG-style path string for a stroke using quadratic curves through
 * the midpoints of consecutive points. This is the same smoothing model used
 * when drawing to the canvas, exposed as a pure function for testing.
 *
 * - 0 points  -> ""
 * - 1 point   -> a dot ("M x y L x y")
 * - 2 points  -> a straight line
 * - 3+ points -> quadratic curves with each original point as a control point
 *   and the midpoint to the next point as the curve endpoint.
 */
export function strokeToPath(points: Point[]): string {
  if (points.length === 0) return ""

  const first = points[0]
  if (points.length === 1) {
    return `M ${first.x} ${first.y} L ${first.x} ${first.y}`
  }
  if (points.length === 2) {
    const [, second] = points
    return `M ${first.x} ${first.y} L ${second.x} ${second.y}`
  }

  let path = `M ${first.x} ${first.y}`
  for (let i = 1; i < points.length - 1; i++) {
    const current = points[i]
    const mid = midPoint(current, points[i + 1])
    path += ` Q ${current.x} ${current.y} ${mid.x} ${mid.y}`
  }
  const last = points[points.length - 1]
  path += ` L ${last.x} ${last.y}`
  return path
}

const FILENAME_DATE_LENGTH = 15 // "YYYYMMDD-HHmmss"

/**
 * Build a timestamped PNG filename, e.g. "signature-20260620-143015.png".
 * `prefix` is sanitised to lowercase alphanumerics + dashes so the result is
 * always a safe, predictable download name.
 */
export function exportFileName(prefix: string, date: Date = new Date()): string {
  const safePrefix =
    prefix
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "signature"

  const pad = (n: number) => String(n).padStart(2, "0")
  const stamp =
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`

  return `${safePrefix}-${stamp.slice(0, FILENAME_DATE_LENGTH)}.png`
}
