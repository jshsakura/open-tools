/**
 * Pure helpers for the Audio Fade tool.
 *
 * Adds a fade-in at the start and/or a fade-out at the end using the `afade`
 * filter. The fade-out start time is computed from the clip duration, so the
 * total duration must be supplied by the caller (read from the audio element).
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export interface BuildFadeArgsOptions {
    inputName: string
    outputName: string
    /** Total duration of the source audio, in seconds. */
    duration: number
    /** Fade-in length in seconds (0 = no fade-in). */
    fadeIn: number
    /** Fade-out length in seconds (0 = no fade-out). */
    fadeOut: number
    format: AudioFormat
    bitrate: number
}

/** Round to milliseconds to keep the filter string tidy. */
function round(value: number): number {
    return Math.round(value * 1000) / 1000
}

/**
 * Build the comma-joined `afade` filter chain. Returns an empty string when no
 * fade is requested (caller should then skip the `-af` flag).
 */
export function buildFadeFilter(
    duration: number,
    fadeIn: number,
    fadeOut: number,
): string {
    const filters: string[] = []

    if (fadeIn > 0) {
        filters.push(`afade=t=in:st=0:d=${round(fadeIn)}`)
    }

    if (fadeOut > 0) {
        const start = Math.max(0, round(duration - fadeOut))
        filters.push(`afade=t=out:st=${start}:d=${round(fadeOut)}`)
    }

    return filters.join(",")
}

/**
 * Build the FFmpeg arg list. When at least one fade is requested an `-af` flag
 * is added; otherwise the audio is simply re-encoded to the target format.
 */
export function buildFadeArgs({
    inputName,
    outputName,
    duration,
    fadeIn,
    fadeOut,
    format,
    bitrate,
}: BuildFadeArgsOptions): string[] {
    if (!(duration > 0)) throw new Error("duration must be greater than 0")
    if (fadeIn < 0 || fadeOut < 0) throw new Error("fade lengths must be >= 0")
    if (fadeIn + fadeOut > duration) {
        throw new Error("combined fades cannot exceed the clip duration")
    }

    const filter = buildFadeFilter(duration, fadeIn, fadeOut)

    const args = ["-i", inputName]
    if (filter) args.push("-af", filter)
    args.push(...buildEncodeFlags(format, bitrate), outputName)
    return args
}
