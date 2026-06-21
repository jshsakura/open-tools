export interface Cell {
  x: number
  y: number
  w: number
  h: number
}

export interface AspectRatioOption {
  value: string
  ratioW: number
  ratioH: number
  label: string
}

export const ASPECT_RATIOS: AspectRatioOption[] = [
  { value: "1:1", ratioW: 1, ratioH: 1, label: "1:1" },
  { value: "4:3", ratioW: 4, ratioH: 3, label: "4:3" },
  { value: "3:4", ratioW: 3, ratioH: 4, label: "3:4" },
  { value: "16:9", ratioW: 16, ratioH: 9, label: "16:9" },
  { value: "9:16", ratioW: 9, ratioH: 16, label: "9:16" },
]

/**
 * Given a canvas of `width` x `height`, a grid of `cols` x `rows`, and a `gap`
 * (applied both between cells and as an outer margin), return the rectangle for
 * every cell in row-major order. Works for non-square canvases.
 */
export function computeCells(
  width: number,
  height: number,
  cols: number,
  rows: number,
  gap: number,
): Cell[] {
  if (cols <= 0 || rows <= 0) return []

  const cellW = (width - gap * (cols + 1)) / cols
  const cellH = (height - gap * (rows + 1)) / rows

  const safeW = Math.max(0, cellW)
  const safeH = Math.max(0, cellH)

  const cells: Cell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({
        x: gap + col * (cellW + gap),
        y: gap + row * (cellH + gap),
        w: safeW,
        h: safeH,
      })
    }
  }
  return cells
}

/**
 * Compute the canvas pixel dimensions for a given base size and aspect ratio.
 * The longer side equals `baseSize`; the shorter side is scaled down.
 */
export function computeCanvasSize(
  baseSize: number,
  ratioW: number,
  ratioH: number,
): { width: number; height: number } {
  if (ratioW >= ratioH) {
    return { width: baseSize, height: Math.round((baseSize * ratioH) / ratioW) }
  }
  return { width: Math.round((baseSize * ratioW) / ratioH), height: baseSize }
}
