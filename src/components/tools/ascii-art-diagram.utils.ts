// Box-drawing glyphs used to assemble rectangles.
const TOP_LEFT = "┌"
const TOP_RIGHT = "┐"
const BOTTOM_LEFT = "└"
const BOTTOM_RIGHT = "┘"
const HORIZONTAL = "─"
const VERTICAL = "│"

export const MIN_BOX_WIDTH = 2
export const MIN_BOX_HEIGHT = 2
export const MAX_BOX_WIDTH = 200
export const MAX_BOX_HEIGHT = 100

const clampInt = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.floor(value)))

// Draws a box-drawing rectangle of the given width/height (in characters).
// Width/height are clamped to sane bounds. Lines are separated by "\n".
export function drawBox(width: number, height: number): string {
  const w = clampInt(width, MIN_BOX_WIDTH, MAX_BOX_WIDTH)
  const h = clampInt(height, MIN_BOX_HEIGHT, MAX_BOX_HEIGHT)

  const innerWidth = w - 2
  const horizontalRun = HORIZONTAL.repeat(innerWidth)
  const top = `${TOP_LEFT}${horizontalRun}${TOP_RIGHT}`
  const bottom = `${BOTTOM_LEFT}${horizontalRun}${BOTTOM_RIGHT}`
  const middle = `${VERTICAL}${" ".repeat(innerWidth)}${VERTICAL}`

  const lines = [top]
  for (let i = 0; i < h - 2; i++) {
    lines.push(middle)
  }
  lines.push(bottom)
  return lines.join("\n")
}

// Inserts `insert` into `text` between [start, end), returning the new text and
// the caret position after the inserted content. Pure: never mutates inputs.
export function insertAt(
  text: string,
  start: number,
  end: number,
  insert: string,
): { text: string; caret: number } {
  const safeStart = clampInt(start, 0, text.length)
  const safeEnd = clampInt(end, safeStart, text.length)
  const next = text.slice(0, safeStart) + insert + text.slice(safeEnd)
  return { text: next, caret: safeStart + insert.length }
}
