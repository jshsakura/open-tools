/**
 * Pure helpers for the Audio Trimmer tool.
 *
 * Cuts a [start, end] segment out of an audio file. Trimming is done with
 * `-c copy` (stream copy) so it is lossless and near-instant — the output keeps
 * the input's codec/container, so no format selection is needed.
 */

export interface BuildTrimArgsOptions {
    inputName: string
    outputName: string
    /** Trim start, in seconds (>= 0). */
    start: number
    /** Trim end, in seconds (> start). */
    end: number
}

/**
 * Build the FFmpeg argument list to cut [start, end] from an audio file.
 *
 * `-ss` is placed before `-i` for fast input seeking, and the segment length is
 * expressed as `-t (end - start)` so the cut is independent of how `-to` is
 * interpreted relative to the seek point across ffmpeg versions.
 */
export function buildTrimArgs({
    inputName,
    outputName,
    start,
    end,
}: BuildTrimArgsOptions): string[] {
    if (!(start >= 0)) throw new Error("start must be >= 0")
    if (!(end > start)) throw new Error("end must be greater than start")

    const duration = end - start

    return [
        "-ss",
        String(start),
        "-i",
        inputName,
        "-t",
        String(duration),
        "-c",
        "copy",
        outputName,
    ]
}
