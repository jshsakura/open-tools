/**
 * Pure helpers for the Audio Speed tool.
 *
 * Changes playback tempo without altering pitch using the `atempo` filter.
 * A single `atempo` only accepts factors in [0.5, 2.0], so larger changes are
 * decomposed into a chain of factors whose product equals the target speed
 * (e.g. 3.0 → atempo=2.0,atempo=1.5).
 */

import { buildEncodeFlags, type AudioFormat } from "./audio-shared.utils"

export const MIN_SPEED = 0.5
export const MAX_SPEED = 4.0

export interface BuildSpeedArgsOptions {
    inputName: string
    outputName: string
    /** Target speed multiplier (e.g. 1.5 = 50% faster). */
    speed: number
    format: AudioFormat
    bitrate: number
}

/** Round to a stable number of decimals to avoid float noise in the filter. */
function round(value: number): number {
    return Math.round(value * 1000) / 1000
}

/**
 * Decompose `speed` into a comma-joined chain of `atempo=` filters, each within
 * the valid [0.5, 2.0] range, whose factors multiply to `speed`.
 */
export function buildAtempoChain(speed: number): string {
    if (!(speed >= MIN_SPEED && speed <= MAX_SPEED)) {
        throw new Error(`speed must be between ${MIN_SPEED} and ${MAX_SPEED}`)
    }

    const factors: number[] = []
    let remaining = speed

    // Pull out 2.0x steps while speeding up...
    while (remaining > 2.0) {
        factors.push(2.0)
        remaining /= 2.0
    }
    // ...or 0.5x steps while slowing down.
    while (remaining < 0.5) {
        factors.push(0.5)
        remaining /= 0.5
    }
    factors.push(round(remaining))

    return factors.map((f) => `atempo=${f}`).join(",")
}

/**
 * Build the FFmpeg arg list:
 *   -i input -filter:a <atempo chain> <encode flags> out
 */
export function buildSpeedArgs({
    inputName,
    outputName,
    speed,
    format,
    bitrate,
}: BuildSpeedArgsOptions): string[] {
    return [
        "-i",
        inputName,
        "-filter:a",
        buildAtempoChain(speed),
        ...buildEncodeFlags(format, bitrate),
        outputName,
    ]
}
