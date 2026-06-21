/**
 * Pure helpers for the video-crop tool.
 * No React, no DOM — safe to unit test in isolation.
 */

export interface CropRegion {
    w: number
    h: number
    x: number
    y: number
}

export interface BuildCropArgsInput {
    inputName: string
    outputName: string
    w: number
    h: number
    x: number
    y: number
}

/**
 * Round a value down to the nearest even integer.
 *
 * H.264 (libx264) with yuv420p chroma subsampling requires width and height to
 * be divisible by 2, so all crop dimensions are forced even before encoding.
 */
function floorEven(value: number): number {
    const floored = Math.floor(value)
    return floored - (floored % 2)
}

/**
 * Compute the largest crop matching aspect ratio `arW:arH` that fits entirely
 * inside a `srcW`×`srcH` source, centered both horizontally and vertically.
 *
 * Dimensions are forced to even numbers (libx264-friendly) and the offsets are
 * clamped so the crop never extends past the source edges.
 *
 * Throws on non-positive / non-finite inputs so callers fail fast.
 */
export function centeredCropForAspect(
    srcW: number,
    srcH: number,
    arW: number,
    arH: number,
): CropRegion {
    const values = [srcW, srcH, arW, arH]
    if (values.some((v) => !Number.isFinite(v) || v <= 0)) {
        throw new Error("Source and aspect-ratio values must be positive finite numbers")
    }

    const targetRatio = arW / arH
    const sourceRatio = srcW / srcH

    let cropW: number
    let cropH: number

    if (sourceRatio > targetRatio) {
        // Source is wider than target → constrained by height.
        cropH = srcH
        cropW = cropH * targetRatio
    } else {
        // Source is taller (or equal) than target → constrained by width.
        cropW = srcW
        cropH = cropW / targetRatio
    }

    let w = floorEven(Math.min(cropW, srcW))
    let h = floorEven(Math.min(cropH, srcH))
    w = Math.max(2, w)
    h = Math.max(2, h)

    const x = floorEven(Math.max(0, (srcW - w) / 2))
    const y = floorEven(Math.max(0, (srcH - h) / 2))

    return { w, h, x, y }
}

/**
 * Clamp an arbitrary crop region so it stays within a `srcW`×`srcH` source.
 *
 * Width/height are bounded to the source size, offsets are bounded so the crop
 * does not spill past the right/bottom edges, and all four values are forced
 * even for libx264 compatibility.
 */
export function clampCrop(
    srcW: number,
    srcH: number,
    region: CropRegion,
): CropRegion {
    const safeSrcW = Math.max(2, floorEven(srcW))
    const safeSrcH = Math.max(2, floorEven(srcH))

    let w = floorEven(Math.min(Math.max(2, region.w), safeSrcW))
    let h = floorEven(Math.min(Math.max(2, region.h), safeSrcH))

    let x = floorEven(Math.max(0, Math.min(region.x, safeSrcW - w)))
    let y = floorEven(Math.max(0, Math.min(region.y, safeSrcH - h)))

    return { w, h, x, y }
}

/**
 * Build the ffmpeg argument list for cropping to `w:h:x:y` and re-encoding to
 * an MP4 (libx264 video, aac audio).
 *
 * A crop always changes frame geometry, so stream-copy is impossible — we
 * always re-encode. `-vf crop=w:h:x:y` selects the region.
 *
 * Throws on invalid dimensions/offsets so callers fail fast at the boundary.
 */
export function buildCropArgs({
    inputName,
    outputName,
    w,
    h,
    x,
    y,
}: BuildCropArgsInput): string[] {
    const values = { w, h, x, y }
    for (const [key, value] of Object.entries(values)) {
        if (!Number.isFinite(value)) {
            throw new Error(`Crop ${key} must be a finite number`)
        }
    }
    if (w <= 0 || h <= 0) {
        throw new Error("Crop width and height must be positive")
    }
    if (x < 0 || y < 0) {
        throw new Error("Crop x and y offsets cannot be negative")
    }

    const cropFilter = `crop=${w}:${h}:${x}:${y}`

    return [
        "-i",
        inputName,
        "-vf",
        cropFilter,
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-c:a",
        "aac",
        outputName,
    ]
}
