/**
 * Pure helpers for the Audio Volume tool.
 *
 * Two modes:
 *  - "gain": scale loudness by a fixed amount with `volume=<dB>dB`.
 *  - "normalize": EBU R128 loudness normalization with `loudnorm` (brings
 *    quiet and loud files to a consistent perceived level).
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export type VolumeMode = "gain" | "normalize"

export interface BuildVolumeArgsOptions {
    inputName: string
    outputName: string
    mode: VolumeMode
    /** Gain in decibels; used only in "gain" mode (can be negative). */
    gainDb?: number
    format: AudioFormat
    bitrate: number
}

/** Build the audio filter string for the chosen volume mode. */
export function buildVolumeFilter(mode: VolumeMode, gainDb: number): string {
    if (mode === "normalize") return "loudnorm"
    return `volume=${gainDb}dB`
}

/**
 * Build the FFmpeg arg list:
 *   -i input -af <filter> <encode flags> out
 */
export function buildVolumeArgs({
    inputName,
    outputName,
    mode,
    gainDb = 0,
    format,
    bitrate,
}: BuildVolumeArgsOptions): string[] {
    return [
        "-i",
        inputName,
        "-af",
        buildVolumeFilter(mode, gainDb),
        ...buildEncodeFlags(format, bitrate),
        outputName,
    ]
}
