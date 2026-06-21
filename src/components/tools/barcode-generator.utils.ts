/**
 * Code 128 barcode encoder (Code Set B).
 *
 * Pure, deterministic helpers used by the Barcode Generator tool. No DOM, no
 * randomness — fully unit-testable.
 *
 * Code Set B covers ASCII 32–126 (space through tilde), which is the simplest
 * single code-set that handles ordinary human-readable text. Each symbol is a
 * 6-element pattern (3 bars + 3 spaces) of total width 11 modules, except the
 * Stop pattern which is 13 modules wide (7 elements).
 */

export const START_B = 104
export const STOP = 106

/** Lowest and highest ASCII code points encodable in Code Set B. */
export const CODE128B_MIN_ASCII = 32
export const CODE128B_MAX_ASCII = 126

/**
 * The 6-digit element-width strings for Code 128 values 0–106.
 * Index = Code 128 value. Each string is the bar/space run lengths in modules,
 * starting with a bar. Value 106 is the Stop pattern (7 elements / 13 modules).
 */
export const CODE128_PATTERNS: readonly string[] = [
    "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312",
    "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222",
    "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131",
    "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321",
    "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
    "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121",
    "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321",
    "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224",
    "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114",
    "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
    "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112",
    "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113",
    "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412",
    "211214", "211232", "2331112",
]

export interface EncodeResult {
    /** Code 128 symbol values: [StartB, ...data, checksum, Stop]. */
    values: number[]
    /** The computed mod-103 checksum value. */
    checksum: number
    /** Concatenated element-width string for the whole symbol. */
    bars: string
}

/**
 * Returns the Code Set B value for a single character, or null when the
 * character is outside the encodable ASCII 32–126 range.
 *
 * Code Set B value = ASCII code − 32.
 */
export function charToValueB(char: string): number | null {
    const code = char.charCodeAt(0)

    if (code < CODE128B_MIN_ASCII || code > CODE128B_MAX_ASCII) {
        return null
    }

    return code - CODE128B_MIN_ASCII
}

/** True when every character in `text` is encodable in Code Set B. */
export function isEncodableCode128B(text: string): boolean {
    for (const char of text) {
        if (charToValueB(char) === null) {
            return false
        }
    }

    return true
}

/**
 * Encodes `text` as a Code 128 (Code Set B) symbol.
 *
 * Steps:
 *  1. Prepend Start B (104).
 *  2. Map each character to its Code Set B value (ASCII − 32).
 *  3. Compute the mod-103 checksum: (StartB + Σ value·position) mod 103,
 *     where position starts at 1 for the first data symbol.
 *  4. Append checksum, then Stop (106).
 *
 * @throws Error when `text` is empty or contains a non-encodable character.
 */
export function encodeCode128B(text: string): EncodeResult {
    if (text.length === 0) {
        throw new Error("Cannot encode empty text")
    }

    const dataValues: number[] = []

    for (const char of text) {
        const value = charToValueB(char)

        if (value === null) {
            throw new Error(
                `Character "${char}" (U+${char.charCodeAt(0).toString(16).toUpperCase()}) is not encodable in Code 128 Code Set B`,
            )
        }

        dataValues.push(value)
    }

    let weightedSum = START_B

    dataValues.forEach((value, index) => {
        weightedSum += value * (index + 1)
    })

    const checksum = weightedSum % 103

    const values = [START_B, ...dataValues, checksum, STOP]
    const bars = values.map((value) => CODE128_PATTERNS[value]).join("")

    return { values, checksum, bars }
}

export interface BarcodeSvgOptions {
    /** Height of the bars in pixels. */
    barHeight: number
    /** Width of a single narrow module in pixels. */
    moduleWidth: number
    /** Bar (foreground) color. */
    foreground: string
    /** Quiet-zone / background color. */
    background: string
    /** Whether to render the human-readable text beneath the bars. */
    showText: boolean
    /** Quiet zone width in modules on each side (defaults to 10). */
    quietZoneModules?: number
}

const DEFAULT_QUIET_ZONE_MODULES = 10
const TEXT_AREA_HEIGHT = 24
const TEXT_GAP = 4

interface BarRect {
    x: number
    width: number
}

/**
 * Converts the element-width string into filled-bar rectangles.
 * Elements alternate bar/space starting with a bar; only bars are emitted.
 */
function barsToRects(bars: string, moduleWidth: number, offsetX: number): BarRect[] {
    const rects: BarRect[] = []
    let cursor = offsetX

    for (let i = 0; i < bars.length; i++) {
        const moduleCount = Number(bars[i])
        const width = moduleCount * moduleWidth
        const isBar = i % 2 === 0

        if (isBar) {
            rects.push({ x: cursor, width })
        }

        cursor += width
    }

    return rects
}

/** Escapes the five XML-significant characters for safe SVG embedding. */
function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}

/**
 * Builds a complete, standalone SVG string for the Code 128 encoding of `text`.
 *
 * The output is deterministic for identical inputs and includes a quiet zone,
 * the bar rectangles, and (optionally) the human-readable text below.
 *
 * @throws Error when `text` cannot be encoded (propagated from encodeCode128B).
 */
export function buildBarcodeSvg(text: string, opts: BarcodeSvgOptions): string {
    const { barHeight, moduleWidth, foreground, background, showText } = opts
    const quietZoneModules = opts.quietZoneModules ?? DEFAULT_QUIET_ZONE_MODULES

    const { bars } = encodeCode128B(text)

    const totalModules = bars
        .split("")
        .reduce((sum, digit) => sum + Number(digit), 0)

    const quietZone = quietZoneModules * moduleWidth
    const barsWidth = totalModules * moduleWidth
    const width = barsWidth + quietZone * 2
    const textBlockHeight = showText ? TEXT_GAP + TEXT_AREA_HEIGHT : 0
    const height = barHeight + textBlockHeight

    const rects = barsToRects(bars, moduleWidth, quietZone)

    const barElements = rects
        .map(
            (rect) =>
                `<rect x="${round(rect.x)}" y="0" width="${round(rect.width)}" height="${round(barHeight)}" fill="${foreground}" />`,
        )
        .join("")

    const textElement = showText
        ? `<text x="${round(width / 2)}" y="${round(barHeight + TEXT_GAP + TEXT_AREA_HEIGHT / 2)}" fill="${foreground}" font-family="monospace" font-size="${round(TEXT_AREA_HEIGHT * 0.7)}" text-anchor="middle" dominant-baseline="middle">${escapeXml(text)}</text>`
        : ""

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${round(width)}" height="${round(height)}" viewBox="0 0 ${round(width)} ${round(height)}">` +
        `<rect x="0" y="0" width="${round(width)}" height="${round(height)}" fill="${background}" />` +
        barElements +
        textElement +
        `</svg>`
}

/** Rounds to 3 decimal places to keep SVG output compact and stable. */
function round(value: number): number {
    return Math.round(value * 1000) / 1000
}
