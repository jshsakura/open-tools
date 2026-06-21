/**
 * Pure helpers for the video-resizer tool.
 * No React, no DOM — safe to unit test in isolation.
 *
 * This tool is about RESOLUTION / dimensions (scaling), distinct from the
 * video-compressor (which is about quality / CRF).
 */

/**
 * Standard preset target heights (in pixels), mapped by label.
 * Widths are derived from the source aspect ratio at runtime, so only the
 * vertical resolution is fixed here.
 */
export const PRESET_HEIGHTS = {
    "2160p": 2160,
    "1440p": 1440,
    "1080p": 1080,
    "720p": 720,
    "480p": 480,
    "360p": 360,
} as const

export type PresetKey = keyof typeof PRESET_HEIGHTS

export interface BuildScaleFilterInput {
    width: number
    height: number
    /** When true, keep the source aspect ratio (let the other dim auto-compute). */
    lockAspect: boolean
}

/**
 * Build the ffmpeg `scale=` filter string.
 *
 * When `lockAspect` is true we pin the WIDTH and pass `-2` for the height so
 * ffmpeg computes the height from the source aspect ratio while keeping it an
 * even number (required by libx264 / yuv420p). Result: `"scale=1280:-2"`.
 *
 * When `lockAspect` is false we honor BOTH explicit dimensions and force each
 * to the nearest even value. Result: `"scale=1280:720"`.
 */
export function buildScaleFilter({
    width,
    height,
    lockAspect,
}: BuildScaleFilterInput): string {
    const w = toEven(width)

    if (lockAspect) {
        return `scale=${w}:-2`
    }

    const h = toEven(height)
    return `scale=${w}:${h}`
}

export interface BuildResizeArgsInput {
    inputName: string
    outputName: string
    width: number
    height: number
    lockAspect: boolean
}

/**
 * Build the ffmpeg argument list for re-encoding a video at a new resolution.
 *
 * Always re-encodes with `libx264` (video) + `aac` (audio) into mp4, applying
 * the computed `scale=` filter via `-vf`. `-pix_fmt yuv420p` keeps the output
 * broadly compatible with players that require chroma subsampling.
 *
 * Throws on non-finite / non-positive dimensions so callers fail fast.
 */
export function buildResizeArgs({
    inputName,
    outputName,
    width,
    height,
    lockAspect,
}: BuildResizeArgsInput): string[] {
    if (!Number.isFinite(width) || width <= 0) {
        throw new Error("Width must be a positive number")
    }
    if (!lockAspect && (!Number.isFinite(height) || height <= 0)) {
        throw new Error("Height must be a positive number when aspect is unlocked")
    }

    const scaleFilter = buildScaleFilter({ width, height, lockAspect })

    return [
        "-i",
        inputName,
        "-vf",
        scaleFilter,
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        outputName,
    ]
}

/** Round a dimension to the nearest even integer (libx264 requires even dims). */
function toEven(value: number): number {
    const rounded = Math.round(value)
    const even = rounded - (rounded % 2)
    return Math.max(2, even)
}
