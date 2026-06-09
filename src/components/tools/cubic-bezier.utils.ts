export type BezierValue = [number, number, number, number]

export interface BezierPreset {
  id: string
  label: string
  value: BezierValue
}

export const BEZIER_PRESETS: BezierPreset[] = [
  { id: "ease", label: "ease", value: [0.25, 0.1, 0.25, 1] },
  { id: "linear", label: "linear", value: [0, 0, 1, 1] },
  { id: "ease-in", label: "ease-in", value: [0.42, 0, 1, 1] },
  { id: "ease-out", label: "ease-out", value: [0, 0, 0.58, 1] },
  { id: "ease-in-out", label: "ease-in-out", value: [0.42, 0, 0.58, 1] },
  { id: "back", label: "back", value: [0.68, -0.55, 0.27, 1.55] },
  { id: "snappy", label: "snappy", value: [0.2, 0.9, 0.3, 1] },
] as const

// x is constrained to [0,1]; y may overshoot for bounce/back curves.
const X_MIN = 0
const X_MAX = 1
const Y_MIN = -0.5
const Y_MAX = 1.5

export function clampX(value: number): number {
  return Math.min(X_MAX, Math.max(X_MIN, value))
}

export function clampY(value: number): number {
  return Math.min(Y_MAX, Math.max(Y_MIN, value))
}

function round(value: number): number {
  return Math.round(value * 100) / 100
}

export function roundBezier(value: BezierValue): BezierValue {
  return [round(value[0]), round(value[1]), round(value[2]), round(value[3])]
}

export function formatBezier(value: BezierValue): string {
  const [x1, y1, x2, y2] = roundBezier(value)
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`
}

export function bezierToCss(value: BezierValue): string {
  return `transition-timing-function: ${formatBezier(value)};`
}

export const BEZIER_Y_RANGE = { min: Y_MIN, max: Y_MAX } as const
