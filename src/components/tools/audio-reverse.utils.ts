/**
 * Pure helpers for the Audio Reverse tool.
 *
 * Plays the audio backwards using the `areverse` filter, then encodes to the
 * chosen output format.
 */

import { buildFilterArgs, type AudioFormat } from "./audio-shared.utils"

export interface BuildReverseArgsOptions {
    inputName: string
    outputName: string
    format: AudioFormat
    bitrate: number
}

export function buildReverseArgs({
    inputName,
    outputName,
    format,
    bitrate,
}: BuildReverseArgsOptions): string[] {
    return buildFilterArgs(inputName, outputName, "areverse", format, bitrate)
}
