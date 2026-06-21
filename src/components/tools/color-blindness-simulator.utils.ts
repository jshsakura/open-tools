/**
 * Pure color-vision-deficiency (CVD) simulation helpers.
 *
 * Each matrix is a 3x3 row-major transform applied to a linear RGB triple.
 * Values are drawn from the widely used Machado/Brettel-derived approximations
 * (the same coefficients popularised by the "color-blind" web tooling).
 */

export type CvdType =
    | "protanopia"
    | "deuteranopia"
    | "tritanopia"
    | "protanomaly"
    | "deuteranomaly"
    | "tritanomaly"
    | "achromatopsia"

/** A 3x3 row-major color transform: [r', g', b'] = matrix · [r, g, b]. */
export type Matrix3x3 = readonly [
    readonly [number, number, number],
    readonly [number, number, number],
    readonly [number, number, number],
]

export const CVD_TYPES: readonly CvdType[] = [
    "protanopia",
    "deuteranopia",
    "tritanopia",
    "protanomaly",
    "deuteranomaly",
    "tritanomaly",
    "achromatopsia",
] as const

export const CVD_MATRICES: Record<CvdType, Matrix3x3> = {
    protanopia: [
        [0.567, 0.433, 0.0],
        [0.558, 0.442, 0.0],
        [0.0, 0.242, 0.758],
    ],
    deuteranopia: [
        [0.625, 0.375, 0.0],
        [0.7, 0.3, 0.0],
        [0.0, 0.3, 0.7],
    ],
    tritanopia: [
        [0.95, 0.05, 0.0],
        [0.0, 0.433, 0.567],
        [0.0, 0.475, 0.525],
    ],
    protanomaly: [
        [0.817, 0.183, 0.0],
        [0.333, 0.667, 0.0],
        [0.0, 0.125, 0.875],
    ],
    deuteranomaly: [
        [0.8, 0.2, 0.0],
        [0.258, 0.742, 0.0],
        [0.0, 0.142, 0.858],
    ],
    tritanomaly: [
        [0.967, 0.033, 0.0],
        [0.0, 0.733, 0.267],
        [0.0, 0.183, 0.817],
    ],
    // Luminance-based grayscale (Rec. 601). Each output channel equals the same
    // weighted sum, so r === g === b after applyMatrix.
    achromatopsia: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
    ],
}

const MIN_CHANNEL = 0
const MAX_CHANNEL = 255

const clampChannel = (value: number): number => {
    if (value < MIN_CHANNEL) return MIN_CHANNEL
    if (value > MAX_CHANNEL) return MAX_CHANNEL
    return Math.round(value)
}

/**
 * Applies a 3x3 color matrix to a single RGB pixel.
 * Returns a fresh, clamped (0-255), integer [r, g, b] tuple. Pure: never mutates input.
 */
export function applyMatrix(
    r: number,
    g: number,
    b: number,
    matrix: Matrix3x3,
): [number, number, number] {
    const [row0, row1, row2] = matrix
    return [
        clampChannel(row0[0] * r + row0[1] * g + row0[2] * b),
        clampChannel(row1[0] * r + row1[1] * g + row1[2] * b),
        clampChannel(row2[0] * r + row2[1] * g + row2[2] * b),
    ]
}
