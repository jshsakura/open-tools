export interface ClampInput {
  minViewport: number
  maxViewport: number
  minSize: number
  maxSize: number
  rootFontSize: number
}

export type ClampGeometry = Omit<ClampInput, "rootFontSize">

const round = (value: number) => Math.round(value * 10000) / 10000

// Linear slope (px of size per px of viewport) between the two breakpoints.
export function clampSlope(input: ClampGeometry): number {
  const { minViewport, maxViewport, minSize, maxSize } = input
  if (maxViewport === minViewport) return 0
  return (maxSize - minSize) / (maxViewport - minViewport)
}

// Intersection (intercept) of the linear preferred value, in px.
// preferred(viewportPx) = slope * viewportPx + intersection
export function clampIntersection(input: ClampGeometry): number {
  const slope = clampSlope(input)
  return input.minSize - slope * input.minViewport
}

// Computed preferred size in px at a given viewport width, BEFORE clamping.
export function preferredSizeAt(
  input: ClampGeometry,
  viewportPx: number,
): number {
  const slope = clampSlope(input)
  const intersection = clampIntersection(input)
  return slope * viewportPx + intersection
}

// Final rendered size in px at a given viewport width, AFTER applying the
// clamp() bounds. Below minViewport it stays at the lower bound, above
// maxViewport at the upper bound, and in between it follows the linear
// preferred value.
export function clampedSizeAt(
  input: ClampGeometry,
  viewportPx: number,
): number {
  const lower = Math.min(input.minSize, input.maxSize)
  const upper = Math.max(input.minSize, input.maxSize)
  const preferred = preferredSizeAt(input, viewportPx)
  return Math.min(upper, Math.max(lower, preferred))
}

// Builds a fluid CSS clamp() expression from a min/max size that scales
// linearly between a min and max viewport width. Output uses rem for the
// clamped bounds and a vw-based preferred value, matching common practice.
export function buildClamp(input: ClampInput): string | null {
  const { minViewport, maxViewport, minSize, maxSize, rootFontSize } = input
  if (rootFontSize <= 0 || maxViewport === minViewport) return null

  const minRem = round(minSize / rootFontSize)
  const maxRem = round(maxSize / rootFontSize)

  const slope = clampSlope(input)
  const slopeVw = round(slope * 100)
  const intersection = clampIntersection(input)
  const interceptRem = round(intersection / rootFontSize)

  const preferred =
    interceptRem === 0
      ? `${slopeVw}vw`
      : `${interceptRem}rem + ${slopeVw}vw`

  const lower = Math.min(minRem, maxRem)
  const upper = Math.max(minRem, maxRem)

  return `clamp(${lower}rem, ${preferred}, ${upper}rem)`
}
