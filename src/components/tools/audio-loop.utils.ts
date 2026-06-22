/**
 * Pure helpers for the Audio Loop tool.
 *
 * Repeats an audio file a fixed number of times back-to-back. `-stream_loop N`
 * (an INPUT option, placed before `-i`) replays the input N extra times, so the
 * total play count is N+1; the result is re-encoded to the chosen format.
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export const MIN_LOOPS = 2
export const MAX_LOOPS = 20

export interface BuildLoopArgsOptions {
    inputName: string
    outputName: string
    /** Total number of times the audio should play (>= 2). */
    count: number
    format: AudioFormat
    bitrate: number
}

/**
 * Build the ffmpeg arg list:
 *   -stream_loop <count-1> -i <input> <encode flags> <output>
 */
export function buildLoopArgs({
    inputName,
    outputName,
    count,
    format,
    bitrate,
}: BuildLoopArgsOptions): string[] {
    if (!Number.isInteger(count) || count < MIN_LOOPS) {
        throw new Error(`count must be an integer >= ${MIN_LOOPS}`)
    }
    if (count > MAX_LOOPS) {
        throw new Error(`count must be <= ${MAX_LOOPS}`)
    }

    return [
        "-stream_loop",
        String(count - 1),
        "-i",
        inputName,
        ...buildEncodeFlags(format, bitrate),
        outputName,
    ]
}
