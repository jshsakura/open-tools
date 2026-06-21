/**
 * Pure helpers for the video-mute tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export interface BuildMuteArgsInput {
    inputName: string
    outputName: string
}

/**
 * Build the ffmpeg argument list for stripping the audio track from a video.
 *
 * Uses `-c:v copy` to stream-copy the video (no re-encode, near-instant and
 * lossless) and `-an` to drop the audio entirely, producing a silent mp4.
 */
export function buildMuteArgs({
    inputName,
    outputName,
}: BuildMuteArgsInput): string[] {
    return ["-i", inputName, "-c:v", "copy", "-an", outputName]
}
