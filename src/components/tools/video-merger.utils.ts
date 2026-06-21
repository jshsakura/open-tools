/**
 * Pure FFmpeg argument builders for the Video Merger tool.
 *
 * The concat *demuxer* requires identical codecs/timebases across inputs, which
 * breaks for arbitrary user uploads. Instead we use the concat *filter*, which
 * re-encodes: every input is normalized (scaled + SAR reset) to a common
 * resolution so clips with different codecs/resolutions still join cleanly.
 */

export interface MergeResolution {
    width: number
    height: number
}

/**
 * Build the full ffmpeg arg list to concatenate `inputNames` (in order) into
 * `outputName`. Each input is scaled to `width`x`height` (preserving aspect via
 * letterbox-free force scale + setsar=1), then video+audio streams are joined
 * with `concat=n=N:v=1:a=1`.
 *
 * Layout: [-i a, -i b, ...] -filter_complex "<graph>" -map [v] -map [a] <flags> out
 */
export function buildConcatArgs(
    inputNames: string[],
    outputName: string,
    { width, height }: MergeResolution,
): string[] {
    if (inputNames.length === 0) {
        throw new Error("buildConcatArgs requires at least one input")
    }

    // One -i flag pair per input, in order.
    const inputFlags = inputNames.flatMap((name) => ["-i", name])

    // Per-input normalization: scale to the common resolution and reset SAR so
    // the concat filter sees uniform video frames. Labels: [v0],[v1],...
    const scaleChains = inputNames
        .map(
            (_, i) =>
                `[${i}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
                `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}]`,
        )
        .join(";")

    // Concat input list: [v0][0:a][v1][1:a]... feeding concat=n=N:v=1:a=1.
    const concatInputs = inputNames
        .map((_, i) => `[v${i}][${i}:a]`)
        .join("")

    const filterComplex = `${scaleChains};${concatInputs}concat=n=${inputNames.length}:v=1:a=1[v][a]`

    return [
        ...inputFlags,
        "-filter_complex",
        filterComplex,
        "-map",
        "[v]",
        "-map",
        "[a]",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "23",
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        outputName,
    ]
}
