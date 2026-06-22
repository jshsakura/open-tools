/**
 * Pure helpers for the Audio Equalizer tool.
 *
 * A simple two-band tone control: boost or cut the low frequencies with the
 * `bass` filter and the high frequencies with the `treble` filter. Gains are in
 * dB; a band with 0 dB gain is omitted (it would be a no-op).
 */

import { buildFilterArgs, type AudioFormat } from "./audio-shared.utils"

export const MIN_GAIN = -20
export const MAX_GAIN = 20

export interface BuildEqArgsOptions {
    inputName: string
    outputName: string
    /** Bass (low-shelf) gain in dB. */
    bass: number
    /** Treble (high-shelf) gain in dB. */
    treble: number
    format: AudioFormat
    bitrate: number
}

/**
 * Build the `bass`/`treble` filter chain. Returns an empty string when both
 * gains are 0 (the caller then performs a plain re-encode).
 */
export function buildEqFilter(bass: number, treble: number): string {
    const parts: string[] = []
    if (bass !== 0) parts.push(`bass=g=${bass}`)
    if (treble !== 0) parts.push(`treble=g=${treble}`)
    return parts.join(",")
}

export function buildEqArgs({
    inputName,
    outputName,
    bass,
    treble,
    format,
    bitrate,
}: BuildEqArgsOptions): string[] {
    return buildFilterArgs(inputName, outputName, buildEqFilter(bass, treble), format, bitrate)
}
