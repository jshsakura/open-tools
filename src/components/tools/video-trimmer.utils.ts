/**
 * Pure helpers for the video-trimmer tool.
 * No React, no DOM — safe to unit test in isolation.
 */

const SECONDS_PER_MINUTE = 60
const SECONDS_PER_HOUR = 3600

export interface BuildTrimArgsInput {
    inputName: string
    outputName: string
    start: number
    end: number
    /** true => accurate (re-encode), false => fast (-c copy). */
    reencode: boolean
}

/**
 * Build the ffmpeg argument list for trimming a segment.
 *
 * `-ss` is placed BEFORE `-i` for fast input seeking, and we pass `-t <duration>`
 * (end - start) rather than `-to` so the duration is relative to the seek point.
 *
 * Fast mode stream-copies (`-c copy`) for near-instant, lossless cuts.
 * Accurate mode re-encodes (`libx264` / `aac`) for frame-accurate boundaries.
 *
 * Throws when start/end are invalid so callers fail fast at the boundary.
 */
export function buildTrimArgs({
    inputName,
    outputName,
    start,
    end,
    reencode,
}: BuildTrimArgsInput): string[] {
    if (!Number.isFinite(start) || !Number.isFinite(end)) {
        throw new Error("Start and end must be finite numbers")
    }
    if (start < 0) {
        throw new Error("Start time cannot be negative")
    }
    if (end <= start) {
        throw new Error("End time must be greater than start time")
    }

    const duration = end - start

    const codecArgs = reencode
        ? ["-c:v", "libx264", "-c:a", "aac"]
        : ["-c", "copy"]

    return [
        "-ss",
        String(start),
        "-i",
        inputName,
        "-t",
        String(duration),
        ...codecArgs,
        outputName,
    ]
}

/**
 * Parse an "HH:MM:SS", "MM:SS", or plain-seconds string into total seconds.
 * Returns NaN for malformed input so callers can validate.
 */
export function parseTimeToSeconds(str: string): number {
    if (typeof str !== "string") return NaN

    const trimmed = str.trim()
    if (trimmed === "") return NaN

    const parts = trimmed.split(":")
    if (parts.length > 3) return NaN

    let total = 0
    for (const part of parts) {
        const value = Number(part)
        if (!Number.isFinite(value) || value < 0) return NaN
        total = total * SECONDS_PER_MINUTE + value
    }

    return total
}

/**
 * Format a number of seconds as a zero-padded "HH:MM:SS" string.
 * Negative or non-finite input is clamped to "00:00:00".
 */
export function formatSeconds(n: number): string {
    const safe = Number.isFinite(n) && n > 0 ? Math.floor(n) : 0

    const hours = Math.floor(safe / SECONDS_PER_HOUR)
    const minutes = Math.floor((safe % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE)
    const seconds = safe % SECONDS_PER_MINUTE

    const pad = (v: number) => String(v).padStart(2, "0")
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
