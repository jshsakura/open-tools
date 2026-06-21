// Pure helpers for the audio converter tool — no React, no DOM, fully testable.

export type AudioFormat = "mp3" | "wav" | "aac" | "ogg" | "flac"

export interface AudioFormatSpec {
  /** ffmpeg encoder/codec for this target format. */
  codec: string
  /** File extension (no dot). */
  ext: string
  /** MIME type for the output Blob / download. */
  mime: string
  /** Whether the format is lossy (and therefore accepts a bitrate). */
  lossy: boolean
}

/**
 * Target audio formats with their correct ffmpeg codec, file extension,
 * MIME type, and whether they are lossy (bitrate-controllable).
 */
export const FORMATS: Record<AudioFormat, AudioFormatSpec> = {
  mp3: { codec: "libmp3lame", ext: "mp3", mime: "audio/mpeg", lossy: true },
  aac: { codec: "aac", ext: "m4a", mime: "audio/mp4", lossy: true },
  ogg: { codec: "libvorbis", ext: "ogg", mime: "audio/ogg", lossy: true },
  wav: { codec: "pcm_s16le", ext: "wav", mime: "audio/wav", lossy: false },
  flac: { codec: "flac", ext: "flac", mime: "audio/flac", lossy: false },
}

/** Bitrate options (kbps) offered for lossy formats. */
export const BITRATES = [128, 192, 256, 320] as const
export type Bitrate = (typeof BITRATES)[number]

export const DEFAULT_FORMAT: AudioFormat = "mp3"
export const DEFAULT_BITRATE: Bitrate = 192

export interface BuildAudioArgsInput {
  inputName: string
  outputName: string
  format: AudioFormat
  bitrate: number
}

/**
 * Build the ffmpeg argument list for an audio conversion.
 *
 * Always: -i <input> -vn -c:a <codec> ... <output>
 * For lossy formats a `-b:a <bitrate>k` flag is added; lossless formats
 * omit it (a bitrate flag is meaningless for PCM/FLAC).
 */
export function buildAudioArgs({
  inputName,
  outputName,
  format,
  bitrate,
}: BuildAudioArgsInput): string[] {
  const spec = FORMATS[format]
  if (!spec) {
    throw new Error(`Unsupported audio format: ${format}`)
  }

  const args = ["-i", inputName, "-vn", "-c:a", spec.codec]

  if (spec.lossy) {
    args.push("-b:a", `${bitrate}k`)
  }

  args.push(outputName)
  return args
}
