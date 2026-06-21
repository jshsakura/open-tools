// Watermark placement math: given a 9-grid position, the image size, the mark
// (text or logo) size, and a margin, return the top-left x/y where the mark
// should be drawn. Pure function — no canvas, fully testable.

export type WatermarkPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "center-left"
    | "center"
    | "center-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"

export interface Point {
    x: number
    y: number
}

// Returns the top-left corner (x, y) for a markW x markH watermark placed at
// `pos` inside an imgW x imgH image, keeping `margin` away from the edges.
export function placementXY(
    pos: WatermarkPosition,
    imgW: number,
    imgH: number,
    markW: number,
    markH: number,
    margin: number
): Point {
    const left = margin
    const centerX = (imgW - markW) / 2
    const right = imgW - markW - margin

    const top = margin
    const centerY = (imgH - markH) / 2
    const bottom = imgH - markH - margin

    const xByCol: Record<string, number> = { left, center: centerX, right }
    const yByRow: Record<string, number> = { top, center: centerY, bottom }

    const [row, col] = splitPosition(pos)
    return { x: xByCol[col], y: yByRow[row] }
}

// Splits a 9-grid position into its [row, col] parts. "center" is shorthand
// for the middle-middle cell.
function splitPosition(pos: WatermarkPosition): [string, string] {
    if (pos === "center") return ["center", "center"]
    const [row, col] = pos.split("-")
    return [row, col]
}
