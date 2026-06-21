// Greatest common divisor (Euclidean). Always operates on positive integers.
export function gcd(a: number, b: number): number {
  const x = Math.abs(Math.round(a))
  const y = Math.abs(Math.round(b))
  return y === 0 ? x : gcd(y, x % y)
}

export interface Ratio {
  w: number
  h: number
}

// Reduce a width x height pair to its simplest integer ratio.
// Returns null when either dimension is non-positive (no meaningful ratio).
export function reduceRatio(width: number, height: number): Ratio | null {
  const w = Math.round(width)
  const h = Math.round(height)
  if (w <= 0 || h <= 0) return null
  const divisor = gcd(w, h)
  return { w: w / divisor, h: h / divisor }
}

// Solve the missing height from a known width and a ratio.
export function solveHeight(width: number, ratio: Ratio): number | null {
  if (ratio.w <= 0 || width <= 0) return null
  return Math.round((width * ratio.h) / ratio.w)
}

// Solve the missing width from a known height and a ratio.
export function solveWidth(height: number, ratio: Ratio): number | null {
  if (ratio.h <= 0 || height <= 0) return null
  return Math.round((height * ratio.w) / ratio.h)
}

// Maps common reduced ratios to their Tailwind aspect-ratio utility class.
// Anything else falls back to an arbitrary-value class.
const TAILWIND_ASPECT_MAP: Record<string, string> = {
  "16:9": "aspect-video",
  "1:1": "aspect-square",
}

export function toTailwindAspect(ratio: Ratio | null): string {
  if (!ratio) return ""
  const key = `${ratio.w}:${ratio.h}`
  return TAILWIND_ASPECT_MAP[key] ?? `aspect-[${ratio.w}/${ratio.h}]`
}

export function toCssAspect(ratio: Ratio | null): string {
  if (!ratio) return ""
  return `aspect-ratio: ${ratio.w} / ${ratio.h};`
}
