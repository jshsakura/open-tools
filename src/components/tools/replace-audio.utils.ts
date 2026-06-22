/**
 * Pure helpers for the Replace Audio tool.
 *
 * Builds the FFmpeg argument list to either replace a video's audio track with
 * an uploaded audio file, or mix the uploaded audio (as BGM) on top of the
 * original audio. The builder has no I/O side effects, so it can be unit-tested
 * in isolation and reused by the React component.
 *
 * Inputs are always two files:
 *   - input 0: the video
 *   - input 1: the audio
 */

export interface BuildReplaceArgsOptions {
    /** Virtual FS name of the video input (input 0). */
    videoName: string
    /** Virtual FS name of the audio input (input 1). */
    audioName: string
    /** Virtual FS name of the muxed output. */
    outputName: string
    /**
     * When true, keep the original video audio and mix the uploaded audio in as
     * background music. When false (default), the original audio is discarded
     * and fully replaced by the uploaded audio.
     */
    mix?: boolean
    /**
     * BGM volume multiplier applied to the uploaded audio in mix mode.
     * 1 = original level, 0.5 = half, 2 = double. Ignored in replace mode.
     */
    bgmVolume?: number
}

/** Clamp the BGM volume to a sane, non-negative range. */
function normalizeVolume(value: number | undefined): number {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) return 1
    return value
}

/**
 * Build the FFmpeg argument list for replacing or mixing a video's audio.
 *
 * Replace mode (default):
 *   -i video -i audio -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -shortest out
 *   The video stream is copied (no re-encode); the audio is taken solely from
 *   the uploaded file and encoded to AAC.
 *
 * Mix mode:
 *   -i video -i audio -filter_complex
 *     "[1:a]volume=<v>[bgm];[0:a][bgm]amix=inputs=2:duration=shortest[aout]"
 *   -map 0:v:0 -map [aout] -c:v copy -c:a aac -shortest out
 *   The video stream is copied; the original audio and the (volume-adjusted)
 *   uploaded audio are mixed together.
 *
 * `-shortest` is always present so the output matches the shorter stream.
 */
export function buildReplaceArgs(options: BuildReplaceArgsOptions): string[] {
    const { videoName, audioName, outputName, mix, bgmVolume } = options

    const args: string[] = ["-i", videoName, "-i", audioName]

    if (mix) {
        const volume = normalizeVolume(bgmVolume)
        // Apply volume to the uploaded BGM, then mix it with the video's audio.
        const filter =
            `[1:a]volume=${volume}[bgm];` +
            `[0:a][bgm]amix=inputs=2:duration=shortest[aout]`
        args.push("-filter_complex", filter)
        args.push("-map", "0:v:0", "-map", "[aout]")
    } else {
        // Replace: video from input 0, audio solely from input 1.
        args.push("-map", "0:v:0", "-map", "1:a:0")
    }

    args.push("-c:v", "copy", "-c:a", "aac", "-shortest", outputName)
    return args
}
