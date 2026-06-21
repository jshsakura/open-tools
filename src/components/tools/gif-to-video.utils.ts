/**
 * Pure helpers for the animated GIF → video tool.
 * No React, no FFmpeg instance — just output-format metadata and argument
 * building so the logic is trivially unit-testable.
 */

export type GifVideoFormat = "mp4" | "webm"

export interface FormatSpec {
    /** Output file extension (no dot). */
    ext: string
    /** MIME type for the resulting Blob / download. */
    mime: string
    /** ffmpeg video codec used to re-encode. */
    vcodec: string
}

/** Supported output formats and their encoding details. */
export const FORMATS: Record<GifVideoFormat, FormatSpec> = {
    mp4: { ext: "mp4", mime: "video/mp4", vcodec: "libx264" },
    webm: { ext: "webm", mime: "video/webm", vcodec: "libvpx-vp9" },
}

export interface BuildGifToVideoArgsInput {
    inputName: string
    outputName: string
    format: GifVideoFormat
    /**
     * Loop count. -1 = no extra looping (encode the GIF once, default),
     * 0 = loop forever, N = repeat the input N extra times.
     */
    loop?: number
}

/**
 * Even-dimension scale filter. GIFs frequently have odd width/height which
 * yuv420p / H.264 reject, so round both dimensions down to the nearest even
 * number before encoding.
 */
const EVEN_DIM_SCALE = "scale=trunc(iw/2)*2:trunc(ih/2)*2"

/**
 * Build the ffmpeg argument list to re-encode an animated GIF into a video.
 *
 * MP4 path: H.264 (libx264) + yuv420p pixel format + +faststart for broad
 * web/mobile compatibility and progressive streaming.
 * WebM path: VP9 (libvpx-vp9).
 *
 * `-stream_loop` (when looping) is an input option and is placed before `-i`.
 */
export function buildGifToVideoArgs({
    inputName,
    outputName,
    format,
    loop = -1,
}: BuildGifToVideoArgsInput): string[] {
    const spec = FORMATS[format]
    const args: string[] = []

    if (loop > 0) {
        args.push("-stream_loop", String(Math.round(loop)))
    }

    args.push("-i", inputName)
    args.push("-vf", EVEN_DIM_SCALE)
    args.push("-c:v", spec.vcodec)

    if (format === "mp4") {
        // Broad compatibility: 4:2:0 chroma + progressive (faststart) header.
        args.push("-pix_fmt", "yuv420p")
        args.push("-movflags", "+faststart")
    }

    args.push(outputName)

    return args
}
