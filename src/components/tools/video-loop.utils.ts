/**
 * Pure helpers for the video-loop tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export interface BuildLoopArgsInput {
    inputName: string
    outputName: string
    /** Total number of times the clip should play (>= 1). */
    totalPlays: number
}

/**
 * Build the ffmpeg argument list for looping a video `totalPlays` times.
 *
 * `-stream_loop <n>` must be placed BEFORE `-i`, where `n` is the number of
 * EXTRA loops — so total plays = n + 1. To play a clip 3 times we pass
 * `-stream_loop 2`.
 *
 * Re-encodes with `libx264` / `aac` so the concatenated stream is always a
 * valid, seekable single MP4 regardless of the source container.
 *
 * Throws when `totalPlays` is invalid so callers fail fast at the boundary.
 */
export function buildLoopArgs({
    inputName,
    outputName,
    totalPlays,
}: BuildLoopArgsInput): string[] {
    if (!Number.isInteger(totalPlays)) {
        throw new Error("totalPlays must be an integer")
    }
    if (totalPlays < 1) {
        throw new Error("totalPlays must be at least 1")
    }

    const extraLoops = totalPlays - 1

    return [
        "-stream_loop",
        String(extraLoops),
        "-i",
        inputName,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        outputName,
    ]
}

/**
 * Estimate the resulting duration (in seconds) after looping.
 * Returns 0 for non-finite / non-positive source durations or play counts.
 */
export function estimatedDuration(srcSeconds: number, totalPlays: number): number {
    if (!Number.isFinite(srcSeconds) || srcSeconds <= 0) return 0
    if (!Number.isFinite(totalPlays) || totalPlays <= 0) return 0
    return srcSeconds * totalPlays
}
