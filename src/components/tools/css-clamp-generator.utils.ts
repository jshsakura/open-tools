export interface ClampInput {
  minViewport: number
  maxViewport: number
  minSize: number
  maxSize: number
  rootFontSize: number
}

const round = (value: number) => Math.round(value * 10000) / 10000

// Builds a fluid CSS clamp() expression from a min/max size that scales
// linearly between a min and max viewport width. Output uses rem for the
// clamped bounds and a vw-based preferred value, matching common practice.
export function buildClamp(input: ClampInput): string | null {
  const { minViewport, maxViewport, minSize, maxSize, rootFontSize } = input
  if (rootFontSize <= 0 || maxViewport === minViewport) return null

  const minRem = round(minSize / rootFontSize)
  const maxRem = round(maxSize / rootFontSize)

  const slope = (maxSize - minSize) / (maxViewport - minViewport)
  const slopeVw = round(slope * 100)
  const intercept = minSize - slope * minViewport
  const interceptRem = round(intercept / rootFontSize)

  const preferred =
    interceptRem === 0
      ? `${slopeVw}vw`
      : `${interceptRem}rem + ${slopeVw}vw`

  const lower = Math.min(minRem, maxRem)
  const upper = Math.max(minRem, maxRem)

  return `clamp(${lower}rem, ${preferred}, ${upper}rem)`
}
