/**
 * Pure helpers for the client-side video compressor.
 * Keeps all FFmpeg-arg construction and size math testable and side-effect free.
 */

export type Quality = "high" | "medium" | "low"
export type MaxHeight = "keep" | "1080" | "720" | "480"

/**
 * x264 CRF (lower = better quality, larger file) + encoding preset per quality
 * level. These presets target file-size reduction while staying watchable.
 */
export const QUALITY_PRESETS: Record<Quality, { crf: string; preset: string }> = {
  high: { crf: "23", preset: "medium" },
  medium: { crf: "28", preset: "medium" },
  low: { crf: "32", preset: "fast" },
}

const AUDIO_BITRATE = "128k"

interface BuildCompressArgsInput {
  inputName: string
  outputName: string
  quality: Quality
  maxHeight: MaxHeight
}

/**
 * Build the ffmpeg argument list for a single compression pass.
 * Re-encodes to H.264 + AAC; only adds a downscale filter when a max height
 * is requested. Width uses -2 so it stays even and preserves aspect ratio.
 */
export function buildCompressArgs({
  inputName,
  outputName,
  quality,
  maxHeight,
}: BuildCompressArgsInput): string[] {
  const { crf, preset } = QUALITY_PRESETS[quality] ?? QUALITY_PRESETS.medium

  const args: string[] = [
    "-i",
    inputName,
    "-c:v",
    "libx264",
    "-crf",
    crf,
    "-preset",
    preset,
  ]

  if (maxHeight !== "keep") {
    args.push("-vf", `scale=-2:${maxHeight}`)
  }

  args.push("-c:a", "aac", "-b:a", AUDIO_BITRATE, outputName)

  return args
}

/**
 * Percent of bytes saved going from `original` to `compressed`.
 * Returns 0 for invalid/empty originals; negative when the output grew.
 */
export function percentSaved(original: number, compressed: number): number {
  if (!Number.isFinite(original) || original <= 0) return 0
  return Math.round(((original - compressed) / original) * 100)
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const

/**
 * Human-readable byte size, e.g. 1536 -> "1.5 KB".
 */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0 B"
  const exponent = Math.min(
    Math.floor(Math.log(n) / Math.log(1024)),
    BYTE_UNITS.length - 1,
  )
  const value = n / Math.pow(1024, exponent)
  const rounded = exponent === 0 ? value : Math.round(value * 10) / 10
  return `${rounded} ${BYTE_UNITS[exponent]}`
}
