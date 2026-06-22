/**
 * Pure helpers for the Audio Channels tool.
 *
 * Converts between mono and stereo by setting the output channel count with
 * `-ac` (1 = mono downmix, 2 = stereo). FFmpeg handles the up/down-mixing.
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export type ChannelMode = "mono" | "stereo"

export const CHANNEL_COUNTS: Record<ChannelMode, number> = {
    mono: 1,
    stereo: 2,
}

export interface BuildChannelsArgsOptions {
    inputName: string
    outputName: string
    mode: ChannelMode
    format: AudioFormat
    bitrate: number
}

/**
 * Build the ffmpeg arg list:
 *   -i <input> -ac <1|2> <encode flags> <output>
 */
export function buildChannelsArgs({
    inputName,
    outputName,
    mode,
    format,
    bitrate,
}: BuildChannelsArgsOptions): string[] {
    const channels = CHANNEL_COUNTS[mode]
    if (!channels) throw new Error(`Unsupported channel mode: ${mode}`)

    return [
        "-i",
        inputName,
        "-ac",
        String(channels),
        ...buildEncodeFlags(format, bitrate),
        outputName,
    ]
}
