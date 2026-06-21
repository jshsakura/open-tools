/**
 * Pure helpers for the video-speed tool.
 * No React, no DOM — safe to unit test in isolation.
 */

/** ffmpeg's atempo filter only accepts factors in [0.5, 2.0]. */
const ATEMPO_MAX = 2.0
const ATEMPO_MIN = 0.5

export interface BuildSpeedArgsInput {
    inputName: string
    outputName: string
    /** Playback speed multiplier. >1 = faster, <1 = slower. */
    speed: number
    /** Keep the audio track (re-tempoed) or drop it entirely. */
    keepAudio: boolean
}

/**
 * Build a comma-separated `atempo` filter chain that achieves `speed`.
 *
 * `atempo` is clamped to [0.5, 2.0], so speeds outside that range are factored
 * into a product of in-range steps. e.g. 4x => "atempo=2.0,atempo=2.0",
 * 0.25x => "atempo=0.5,atempo=0.5", 1.5x => "atempo=1.5".
 *
 * Throws on non-finite or non-positive speed so callers fail fast.
 */
export function buildAtempoChain(speed: number): string {
    if (!Number.isFinite(speed) || speed <= 0) {
        throw new Error("Speed must be a finite, positive number")
    }

    const steps: number[] = []
    let remaining = speed

    // Speeds above 2.0 — peel off full 2.0 steps until in range.
    while (remaining > ATEMPO_MAX) {
        steps.push(ATEMPO_MAX)
        remaining /= ATEMPO_MAX
    }
    // Speeds below 0.5 — peel off full 0.5 steps until in range.
    while (remaining < ATEMPO_MIN) {
        steps.push(ATEMPO_MIN)
        remaining /= ATEMPO_MIN
    }

    steps.push(remaining)

    return steps.map((step) => `atempo=${formatFactor(step)}`).join(",")
}

/**
 * Format a filter factor without trailing floating-point noise.
 * Integers keep one decimal (2 => "2.0") to match ffmpeg conventions,
 * other values are trimmed of trailing zeros (1.5 => "1.5").
 */
function formatFactor(value: number): string {
    if (Number.isInteger(value)) {
        return value.toFixed(1)
    }
    return String(Number(value.toFixed(6)))
}

/**
 * Format a speed multiplier for the `setpts` divisor, trimming float noise.
 * Integers stay bare (2 => "2") so the filter reads `setpts=PTS/2`.
 */
function formatSpeed(value: number): string {
    return String(Number(value.toFixed(6)))
}

/**
 * Build the ffmpeg argument list for changing playback speed.
 *
 * Video PTS is scaled with `setpts=PTS/<speed>` (higher speed => shorter PTS).
 * Audio is re-tempoed via an `atempo` chain when kept, or dropped with `-an`.
 * Output is always re-encoded to libx264 (+ aac when audio is kept) mp4.
 *
 * Throws on invalid speed so callers fail fast at the boundary.
 */
export function buildSpeedArgs({
    inputName,
    outputName,
    speed,
    keepAudio,
}: BuildSpeedArgsInput): string[] {
    if (!Number.isFinite(speed) || speed <= 0) {
        throw new Error("Speed must be a finite, positive number")
    }

    const videoFilter = `setpts=PTS/${formatSpeed(speed)}`

    if (!keepAudio) {
        return [
            "-i",
            inputName,
            "-filter:v",
            videoFilter,
            "-an",
            "-c:v",
            "libx264",
            outputName,
        ]
    }

    const audioFilter = buildAtempoChain(speed)

    return [
        "-i",
        inputName,
        "-filter:v",
        videoFilter,
        "-filter:a",
        audioFilter,
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        outputName,
    ]
}
