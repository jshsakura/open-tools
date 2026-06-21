/**
 * Pure helpers for the video-reverse tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export interface BuildReverseArgsInput {
    inputName: string
    outputName: string
    /** true => reverse the audio track too; false => drop audio (-an). */
    reverseAudio: boolean
}

/**
 * Build the ffmpeg argument list for playing a clip backwards.
 *
 * Video is always reversed with `-vf reverse`. The `reverse` / `areverse`
 * filters buffer the entire clip in memory, so this is best for short clips.
 *
 * When `reverseAudio` is true the audio is reversed with `-af areverse` and
 * re-encoded to AAC; otherwise audio is dropped entirely with `-an`.
 * Video is re-encoded with libx264 to an mp4 container.
 */
export function buildReverseArgs({
    inputName,
    outputName,
    reverseAudio,
}: BuildReverseArgsInput): string[] {
    const audioArgs = reverseAudio
        ? ["-af", "areverse", "-c:a", "aac"]
        : ["-an"]

    return [
        "-i",
        inputName,
        "-vf",
        "reverse",
        "-c:v",
        "libx264",
        ...audioArgs,
        outputName,
    ]
}
