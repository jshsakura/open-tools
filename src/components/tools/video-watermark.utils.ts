/**
 * Pure helpers for building the ffmpeg `overlay`-based watermark command.
 *
 * The watermark (an image, or text pre-rendered to a transparent PNG) is fed
 * as a second input. We optionally scale it, apply opacity via
 * `colorchannelmixer`, then overlay it onto the video at a 9-grid position.
 *
 * Keeping these pure makes the ffmpeg arg construction unit-testable without a
 * browser or WASM runtime.
 */

export type WatermarkPosition =
    | "top-left"
    | "top-center"
    | "top-right"
    | "middle-left"
    | "center"
    | "middle-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right"

export interface WatermarkOptions {
    /** One of the 9 grid positions. */
    position: WatermarkPosition
    /** Watermark opacity in [0, 1]. */
    opacity: number
    /** Watermark scale relative to its native size in [0, 1]. 1 = no scale. */
    scale: number
    /** Margin in pixels from the edges (ignored for center positions). */
    margin: number
}

/** All 9 supported positions, in grid (reading) order. */
export const WATERMARK_POSITIONS: WatermarkPosition[] = [
    "top-left",
    "top-center",
    "top-right",
    "middle-left",
    "center",
    "middle-right",
    "bottom-left",
    "bottom-center",
    "bottom-right",
]

/**
 * Compute the ffmpeg overlay `x` / `y` expression strings for a grid position.
 *
 * Available variables inside `overlay`:
 *   W,H = main (video) width/height
 *   w,h = overlay (watermark) width/height
 *
 * @param position 9-grid position.
 * @param margin   Edge margin in pixels.
 * @returns Object with `x` and `y` ffmpeg expression strings.
 */
export function overlayPosition(
    position: WatermarkPosition,
    margin: number,
): { x: string; y: string } {
    const m = String(Math.max(0, Math.round(margin)))

    const left = m
    const centerX = "(W-w)/2"
    const right = `W-w-${m}`

    const top = m
    const centerY = "(H-h)/2"
    const bottom = `H-h-${m}`

    switch (position) {
        case "top-left":
            return { x: left, y: top }
        case "top-center":
            return { x: centerX, y: top }
        case "top-right":
            return { x: right, y: top }
        case "middle-left":
            return { x: left, y: centerY }
        case "center":
            return { x: centerX, y: centerY }
        case "middle-right":
            return { x: right, y: centerY }
        case "bottom-left":
            return { x: left, y: bottom }
        case "bottom-center":
            return { x: centerX, y: bottom }
        case "bottom-right":
            return { x: right, y: bottom }
        default:
            return { x: left, y: top }
    }
}

/** Clamp a number into [min, max]. */
function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) return min
    return Math.min(max, Math.max(min, value))
}

/**
 * Build the `-filter_complex` graph string for the watermark overlay.
 *
 * Shape:
 *   [1:v]<scale,>format=rgba,colorchannelmixer=aa=<opacity>[wm];[0:v][wm]overlay=<x>:<y>
 *
 * - The watermark stream (input index 1) is optionally scaled, converted to
 *   rgba, and faded via `colorchannelmixer=aa=` (alpha multiplier).
 * - The result is overlaid onto the video stream (input index 0).
 *
 * @returns The filter_complex graph string.
 */
export function buildWatermarkFilter(options: WatermarkOptions): string {
    const opacity = clamp(options.opacity, 0, 1)
    const scale = clamp(options.scale, 0.01, 1)
    const { x, y } = overlayPosition(options.position, options.margin)

    // Scale only when meaningfully below 1 to avoid a no-op resample.
    const scaleFilter = scale < 0.999 ? `scale=iw*${scale}:-1,` : ""

    const opacityStr = opacity.toFixed(2)
    const wm = `[1:v]${scaleFilter}format=rgba,colorchannelmixer=aa=${opacityStr}[wm]`
    const overlay = `[0:v][wm]overlay=${x}:${y}`

    return `${wm};${overlay}`
}

export interface WatermarkArgsOptions extends WatermarkOptions {
    /** Virtual-FS filename of the source video (input 0). */
    videoName: string
    /** Virtual-FS filename of the watermark PNG (input 1). */
    wmName: string
    /** Virtual-FS filename of the output. */
    outputName: string
}

/**
 * Build the full ffmpeg argument array for the watermark operation.
 *
 *   -i video -i wm.png -filter_complex "<graph>" -c:a copy output.mp4
 *
 * @returns Array of ffmpeg CLI arguments (no binary name).
 */
export function buildWatermarkArgs(options: WatermarkArgsOptions): string[] {
    const filter = buildWatermarkFilter(options)

    return [
        "-i",
        options.videoName,
        "-i",
        options.wmName,
        "-filter_complex",
        filter,
        "-c:a",
        "copy",
        options.outputName,
    ]
}
