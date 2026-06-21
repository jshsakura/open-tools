// Pure dimension math for the image resizer.
// All functions return new values and never mutate their inputs.

export interface Dimensions {
  width: number
  height: number
}

// Given a new width and the original aspect ratio (width / height),
// return the width plus the aspect-locked height.
// A non-positive width or ratio yields a height of 0.
export function scaleToWidth(width: number, aspectRatio: number): Dimensions {
  const w = Math.max(0, Math.round(width))
  const height = w > 0 && aspectRatio > 0 ? Math.round(w / aspectRatio) : 0
  return { width: w, height }
}

// Given a new height and the original aspect ratio (width / height),
// return the height plus the aspect-locked width.
// A non-positive height or ratio yields a width of 0.
export function scaleToHeight(height: number, aspectRatio: number): Dimensions {
  const h = Math.max(0, Math.round(height))
  const width = h > 0 && aspectRatio > 0 ? Math.round(h * aspectRatio) : 0
  return { width, height: h }
}

// Scale the original dimensions by a percentage (e.g. 50 => half size).
// Result is clamped to a minimum of 1px per axis when the source is positive.
export function scaleByPercent(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): Dimensions {
  const ratio = percent / 100
  const scale = (value: number) => {
    if (value <= 0 || ratio <= 0) return 0
    return Math.max(1, Math.round(value * ratio))
  }
  return { width: scale(originalWidth), height: scale(originalHeight) }
}
