/**
 * Pure helpers for the Audio Merger tool.
 *
 * Joins several audio files (in order) into one. The concat *demuxer* needs
 * identical codecs/sample rates, which breaks for arbitrary uploads, so we use
 * the concat *filter* (re-encodes): each input's audio stream is fed into
 * `concat=n=N:v=0:a=1` and the result is encoded to the chosen output format.
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export interface BuildMergeArgsOptions {
    inputNames: string[]
    outputName: string
    format: AudioFormat
    bitrate: number
}

/**
 * Build the FFmpeg arg list to concatenate `inputNames` into `outputName`.
 *
 * Layout: [-i a, -i b, ...] -filter_complex "[0:a][1:a]...concat=n=N:v=0:a=1[a]"
 *         -map [a] <encode flags> out
 */
export function buildMergeArgs({
    inputNames,
    outputName,
    format,
    bitrate,
}: BuildMergeArgsOptions): string[] {
    if (inputNames.length === 0) {
        throw new Error("buildMergeArgs requires at least one input")
    }

    const inputFlags = inputNames.flatMap((name) => ["-i", name])

    const concatInputs = inputNames.map((_, i) => `[${i}:a]`).join("")
    const filterComplex = `${concatInputs}concat=n=${inputNames.length}:v=0:a=1[a]`

    return [
        ...inputFlags,
        "-filter_complex",
        filterComplex,
        "-map",
        "[a]",
        ...buildEncodeFlags(format, bitrate),
        outputName,
    ]
}
