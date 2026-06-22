/**
 * Pure helpers for the video-boomerang tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export const MIN_LOOPS = 1
export const MAX_LOOPS = 5

export interface BuildBoomerangArgsInput {
    inputName: string
    outputName: string
    /** How many forward+reverse boomerang cycles to chain (1 = single boomerang). */
    loops: number
}

/**
 * Clamp the loop count into the supported [MIN_LOOPS, MAX_LOOPS] range,
 * coercing non-finite/fractional input to a safe integer.
 */
export function clampLoops(loops: number): number {
    if (!Number.isFinite(loops)) return MIN_LOOPS
    const rounded = Math.floor(loops)
    return Math.min(MAX_LOOPS, Math.max(MIN_LOOPS, rounded))
}

/**
 * Build the ffmpeg argument list that turns a clip into a boomerang
 * (forward then reverse, looped seamlessly like Instagram).
 *
 * The forward (`[a]`) and reversed (`[r]`) copies are concatenated. One loop
 * yields `concat=n=2`; each extra loop appends another forward+reverse pair, so
 * the concat count scales as `n = 2 * loops`.
 *
 * Audio is dropped (`-an`) because reversed audio is rarely wanted, and the
 * output is re-encoded with libx264 into an MP4.
 *
 * NOTE: `reverse` buffers the whole stream in memory — best for short clips.
 */
export function buildBoomerangArgs({
    inputName,
    outputName,
    loops,
}: BuildBoomerangArgsInput): string[] {
    const safeLoops = clampLoops(loops)
    const segments = 2 * safeLoops

    // One forward + one reversed copy per loop, then concat them all.
    const labels: string[] = []
    const splitOutputs: string[] = []
    const reverseFilters: string[] = []

    for (let i = 0; i < safeLoops; i++) {
        const fwd = `a${i}`
        const rawRev = `b${i}`
        const rev = `r${i}`
        splitOutputs.push(`[${fwd}][${rawRev}]`)
        reverseFilters.push(`[${rawRev}]reverse[${rev}]`)
        labels.push(`[${fwd}]`, `[${rev}]`)
    }

    const filterComplex = [
        `[0:v]split=${segments}${splitOutputs.join("")}`,
        ...reverseFilters,
        `${labels.join("")}concat=n=${segments}:v=1[v]`,
    ].join(";")

    return [
        "-i",
        inputName,
        "-filter_complex",
        filterComplex,
        "-map",
        "[v]",
        "-an",
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        outputName,
    ]
}
