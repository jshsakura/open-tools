/**
 * Pure helpers for the images-to-video (slideshow) tool.
 *
 * The slideshow is built with FFmpeg's concat demuxer, which reads a plain-text
 * list of input files. Each image gets a `file` line and a `duration` line. The
 * concat demuxer requires the LAST file to be repeated once more (without a
 * duration) so its final frame is held for the requested time — otherwise the
 * last image flashes for a single frame.
 */

/** Format a number of seconds for the concat list, trimming trailing zeros. */
function formatDuration(durationSec: number): string {
    // Keep up to 3 decimals, then strip trailing zeros / dot.
    return Number(durationSec.toFixed(3)).toString()
}

/**
 * Build the `list.txt` content for the concat demuxer.
 *
 * For N image names, the output has N+1 `file` lines: one per image plus the
 * last image repeated once. Each non-repeated file line is followed by a
 * `duration` line.
 *
 * @param imageNames ordered virtual-FS file names, e.g. ["img000.png", ...]
 * @param durationSec seconds each image is shown
 */
export function buildConcatList(imageNames: string[], durationSec: number): string {
    if (imageNames.length === 0) return ""

    const safeDuration = durationSec > 0 ? durationSec : 1
    const dur = formatDuration(safeDuration)

    const lines: string[] = []
    for (const name of imageNames) {
        lines.push(`file '${name}'`)
        lines.push(`duration ${dur}`)
    }
    // Repeat the final file so its frame is held for the full duration.
    lines.push(`file '${imageNames[imageNames.length - 1]}'`)

    return lines.join("\n") + "\n"
}

export interface SlideshowArgsOptions {
    listName: string
    outputName: string
    width: number
    height: number
    fps: number
}

/**
 * Build the FFmpeg argument array that turns a concat list into an MP4.
 *
 * Scales each image to fit within WxH preserving aspect ratio, pads the
 * remainder (letterbox) and centers it, fixes the frame rate, and forces
 * yuv420p so the result plays everywhere. Encodes with libx264.
 */
export function buildSlideshowArgs({
    listName,
    outputName,
    width,
    height,
    fps,
}: SlideshowArgsOptions): string[] {
    const filter =
        `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
        `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,` +
        `fps=${fps},format=yuv420p`

    return [
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        listName,
        "-vf",
        filter,
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        outputName,
    ]
}
