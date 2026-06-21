/**
 * Pure helpers for the video-rotate tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export type Rotation = 0 | 90 | 180 | 270

export interface BuildRotateFilterInput {
    /** Clockwise rotation in degrees: 0, 90, 180, or 270 (= 90 CCW). */
    rotation: Rotation
    flipH: boolean
    flipV: boolean
}

export interface BuildRotateArgsInput extends BuildRotateFilterInput {
    inputName: string
    outputName: string
}

/**
 * Build the ffmpeg `-vf` filter chain string for a rotate/flip operation.
 *
 * Rotation maps to ffmpeg `transpose`:
 *   - 90 (CW)  => transpose=1
 *   - 270 (90 CCW) => transpose=2
 *   - 180 => transpose=1,transpose=1 (two CW quarter-turns)
 *   - 0 => no transpose
 * Flips append `hflip` / `vflip`.
 *
 * Returns an empty string when there is nothing to do (no rotation, no flips),
 * so callers can omit `-vf` entirely.
 */
export function buildRotateFilter({
    rotation,
    flipH,
    flipV,
}: BuildRotateFilterInput): string {
    const parts: string[] = []

    if (rotation === 90) {
        parts.push("transpose=1")
    } else if (rotation === 270) {
        parts.push("transpose=2")
    } else if (rotation === 180) {
        parts.push("transpose=1", "transpose=1")
    }

    if (flipH) parts.push("hflip")
    if (flipV) parts.push("vflip")

    return parts.join(",")
}

/**
 * Build the full ffmpeg argument list for rotating/flipping a video.
 *
 * Re-encodes with `libx264` / `aac` to an mp4 since transposing changes the
 * pixel layout (stream-copy is not possible). The `-vf` flag is only added
 * when the filter chain is non-empty.
 */
export function buildRotateArgs({
    inputName,
    outputName,
    rotation,
    flipH,
    flipV,
}: BuildRotateArgsInput): string[] {
    const filter = buildRotateFilter({ rotation, flipH, flipV })

    const filterArgs = filter ? ["-vf", filter] : []

    return [
        "-i",
        inputName,
        ...filterArgs,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        outputName,
    ]
}
