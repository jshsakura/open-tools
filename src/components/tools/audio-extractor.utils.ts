/**
 * Pure helpers for the Audio Extractor tool.
 *
 * Extracts an audio track from a video file using FFmpeg.wasm. The command
 * builder produces the ffmpeg argument list (no I/O side effects), so it can be
 * unit-tested in isolation and reused by the React component.
 */

export type AudioFormat = "mp3" | "wav" | "aac" | "ogg"

export interface AudioFormatInfo {
    /** FFmpeg audio codec used to encode this format. */
    codec: string
    /** File extension (without the leading dot). */
    ext: string
    /** MIME type for the resulting Blob / audio player. */
    mime: string
    /** Whether the format is lossy (and therefore accepts a bitrate). */
    lossy: boolean
}

/**
 * Supported output formats and their codec / container metadata.
 * - mp3  → libmp3lame (lossy)
 * - aac  → aac in an .m4a container (lossy)
 * - ogg  → libvorbis (lossy)
 * - wav  → pcm_s16le, uncompressed (lossless, no bitrate)
 */
export const AUDIO_FORMATS: Record<AudioFormat, AudioFormatInfo> = {
    mp3: { codec: "libmp3lame", ext: "mp3", mime: "audio/mpeg", lossy: true },
    aac: { codec: "aac", ext: "m4a", mime: "audio/mp4", lossy: true },
    ogg: { codec: "libvorbis", ext: "ogg", mime: "audio/ogg", lossy: true },
    wav: { codec: "pcm_s16le", ext: "wav", mime: "audio/wav", lossy: false },
}

export interface BuildExtractArgsOptions {
    inputName: string
    outputName: string
    format: AudioFormat
    /** Audio bitrate (e.g. "192k"); only applied to lossy formats. */
    bitrate?: string
    /** Trim start, in seconds. Applied when > 0. */
    start?: number
    /** Trim duration, in seconds. Applied when > 0. */
    duration?: number
}

/**
 * Build the FFmpeg argument list to extract audio from a video.
 *
 * Always includes `-vn` (drop the video stream) and the correct codec for the
 * target format. Bitrate (`-b:a`) is added only for lossy formats. Trim flags
 * (`-ss` / `-t`) are added only when the corresponding value is a positive
 * number, with `-ss` placed before `-i` for fast input seeking.
 */
export function buildExtractArgs(options: BuildExtractArgsOptions): string[] {
    const { inputName, outputName, format, bitrate, start, duration } = options
    const info = AUDIO_FORMATS[format]
    if (!info) throw new Error(`Unsupported audio format: ${format}`)

    const args: string[] = []

    // Seek before input for fast, keyframe-accurate trimming.
    if (typeof start === "number" && start > 0) {
        args.push("-ss", String(start))
    }

    args.push("-i", inputName)

    if (typeof duration === "number" && duration > 0) {
        args.push("-t", String(duration))
    }

    // No video stream.
    args.push("-vn")

    // Audio codec for the chosen format.
    args.push("-c:a", info.codec)

    // Bitrate only makes sense for lossy formats.
    if (info.lossy && bitrate) {
        args.push("-b:a", bitrate)
    }

    args.push(outputName)
    return args
}
