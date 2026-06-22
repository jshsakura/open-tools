/**
 * Pure helpers for the Audio Silence Remover tool.
 *
 * Strips silence from the start, the end, or both ends of an audio file using
 * the `silenceremove` filter. Trailing silence is removed by reversing the
 * stream, trimming the (now leading) silence, then reversing back.
 */

import { buildFilterArgs, type AudioFormat } from "./audio-shared.utils"

export type SilenceMode = "leading" | "trailing" | "both"

/** Default detection threshold in dB — quieter than this counts as silence. */
export const DEFAULT_THRESHOLD = -50

export interface BuildSilenceArgsOptions {
    inputName: string
    outputName: string
    mode: SilenceMode
    /** Silence threshold in dB (negative; e.g. -50). */
    threshold: number
    format: AudioFormat
    bitrate: number
}

/** A single leading-silence trim at the given threshold. */
function trimLeading(threshold: number): string {
    return `silenceremove=start_periods=1:start_threshold=${threshold}dB`
}

/**
 * Build the `silenceremove`-based filter chain for the chosen mode.
 * - leading:  trim from the start
 * - trailing: reverse → trim start → reverse (i.e. trim the end)
 * - both:     trim start, then trim end via the reverse trick
 */
export function buildSilenceFilter(mode: SilenceMode, threshold: number): string {
    const lead = trimLeading(threshold)
    const trail = `areverse,${lead},areverse`

    switch (mode) {
        case "leading":
            return lead
        case "trailing":
            return trail
        case "both":
            return `${lead},${trail}`
        default:
            throw new Error(`Unsupported silence mode: ${mode}`)
    }
}

export function buildSilenceArgs({
    inputName,
    outputName,
    mode,
    threshold,
    format,
    bitrate,
}: BuildSilenceArgsOptions): string[] {
    return buildFilterArgs(
        inputName,
        outputName,
        buildSilenceFilter(mode, threshold),
        format,
        bitrate,
    )
}
