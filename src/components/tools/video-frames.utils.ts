/**
 * Pure FFmpeg argument builders for the Video Frames extractor.
 * Kept side-effect free so they can be unit-tested without FFmpeg.wasm.
 */

export type FrameFormat = "png" | "jpg"

/** Sequential filename pattern FFmpeg expands for extracted frames. */
export const FRAME_PATTERN = "frame_%04d.png"

/** Map an image format to its MIME type for Blob construction. */
export function frameMime(format: FrameFormat): string {
    return format === "jpg" ? "image/jpeg" : "image/png"
}

/**
 * Build args to extract frames at a given rate.
 * `fps` is a frames-per-second rate (e.g. 1 = one frame/sec, 0.5 = one per 2s).
 * The pattern must contain a printf token (e.g. frame_%04d.png) so FFmpeg
 * writes sequential files. Output codec is derived from `format`.
 */
export function buildFramesArgs({
    inputName,
    fps,
    format,
    pattern,
}: {
    inputName: string
    fps: number
    format: FrameFormat
    pattern: string
}): string[] {
    // Replace the extension of the pattern with the chosen format so the
    // written files match the requested image format.
    const outputName = pattern.replace(/\.[^.]+$/, `.${format}`)

    return [
        "-i",
        inputName,
        "-vf",
        `fps=${fps}`,
        ...(format === "jpg" ? ["-q:v", "2"] : []),
        outputName,
    ]
}

/**
 * Build args for a single thumbnail grabbed at `time` seconds.
 * Uses fast input seeking (`-ss` before output) and `-frames:v 1`.
 */
export function buildThumbnailArgs({
    inputName,
    time,
    outputName,
}: {
    inputName: string
    time: number
    outputName: string
}): string[] {
    const isJpg = /\.jpe?g$/i.test(outputName)

    return [
        "-ss",
        String(time),
        "-i",
        inputName,
        "-frames:v",
        "1",
        ...(isJpg ? ["-q:v", "2"] : []),
        outputName,
    ]
}
