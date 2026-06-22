/**
 * Shared pure helpers for the audio-editing tools (trimmer, merger, volume,
 * speed, fade). No React / DOM — fully unit-testable.
 *
 * Reuses the format registry from the Audio Converter so every audio tool
 * agrees on codecs / extensions / MIME types and lossy-vs-lossless handling
 * (DRY — one source of truth for audio output formats).
 */

import { FORMATS, BITRATES, type AudioFormat } from "./audio-converter.utils"

export { FORMATS, BITRATES }
export type { AudioFormat }

/** Output formats offered by the filter-based audio tools. */
export const OUTPUT_FORMATS: AudioFormat[] = ["mp3", "wav", "aac", "ogg", "flac"]

/**
 * Build the trailing encode flags for an audio-only output:
 *   -vn -c:a <codec> [-b:a <bitrate>k]
 *
 * `-vn` drops any (cover-art) video stream. The bitrate flag is added only for
 * lossy formats, where it is meaningful.
 */
export function buildEncodeFlags(format: AudioFormat, bitrate: number): string[] {
    const spec = FORMATS[format]
    if (!spec) throw new Error(`Unsupported audio format: ${format}`)

    const flags = ["-vn", "-c:a", spec.codec]
    if (spec.lossy) flags.push("-b:a", `${bitrate}k`)
    return flags
}
