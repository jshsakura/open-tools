/**
 * Pure helpers for the Video → animated GIF tool.
 * No React, no FFmpeg instance — just argument building and time formatting so
 * the logic is trivially unit-testable.
 */

export interface BuildGifArgsInput {
    inputName: string
    outputName: string
    fps: number
    width: number
    /** Start offset in seconds (>= 0). Omitted from args when 0. */
    start: number
    /** Segment duration in seconds (> 0). Omitted when <= 0 (encode to end). */
    duration: number
}

/**
 * Build the ffmpeg argument list for a high-quality palette-based GIF.
 *
 * Uses the two-pass palette filter in a single graph so colors don't band:
 *   fps -> scale (lanczos) -> split -> palettegen -> paletteuse
 *
 * `-ss` (seek) is placed before `-i` for fast input seeking, and `-t`
 * (duration) after `-i` to bound the encoded segment.
 */
export function buildGifArgs({
    inputName,
    outputName,
    fps,
    width,
    start,
    duration,
}: BuildGifArgsInput): string[] {
    const safeFps = clampNumber(fps, 1, 60)
    const safeWidth = Math.max(1, Math.round(width))

    const args: string[] = []

    if (start > 0) {
        args.push("-ss", formatSeconds(start))
    }

    args.push("-i", inputName)

    if (duration > 0) {
        args.push("-t", String(roundTo(duration, 3)))
    }

    const filter =
        `fps=${safeFps},` +
        `scale=${safeWidth}:-1:flags=lanczos,` +
        `split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`

    args.push("-vf", filter, outputName)

    return args
}

/**
 * Parse a time string into seconds.
 * Accepts: "SS", "MM:SS", "HH:MM:SS" (with optional fractional seconds),
 * or a plain numeric seconds value. Returns 0 for empty/invalid input.
 */
export function parseTimeToSeconds(str: string): number {
    if (typeof str !== "string") return 0
    const trimmed = str.trim()
    if (trimmed === "") return 0

    const parts = trimmed.split(":")
    if (parts.length > 3) return 0

    let seconds = 0
    for (const part of parts) {
        if (part === "" || !isFinite(Number(part))) return 0
        const value = Number(part)
        if (value < 0) return 0
        seconds = seconds * 60 + value
    }

    return seconds
}

/**
 * Format a number of seconds as "HH:MM:SS" (or "MM:SS" when under an hour).
 * Fractional seconds are dropped to whole seconds for display.
 */
export function formatSeconds(n: number): string {
    const total = Math.max(0, Math.floor(Number(n) || 0))
    const hours = Math.floor(total / 3600)
    const minutes = Math.floor((total % 3600) / 60)
    const secs = total % 60

    const pad = (value: number) => String(value).padStart(2, "0")

    if (hours > 0) {
        return `${hours}:${pad(minutes)}:${pad(secs)}`
    }
    return `${minutes}:${pad(secs)}`
}

function clampNumber(value: number, min: number, max: number): number {
    if (!isFinite(value)) return min
    return Math.min(max, Math.max(min, Math.round(value)))
}

function roundTo(value: number, decimals: number): number {
    const factor = 10 ** decimals
    return Math.round(value * factor) / factor
}
