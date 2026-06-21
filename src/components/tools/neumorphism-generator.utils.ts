// Pure helpers for the neumorphism (soft UI) CSS generator.

export type NeumorphismShape = "flat" | "concave" | "convex" | "pressed"

/** Light source corner: which corner the light comes FROM. */
export type LightDirection = "top-left" | "top-right" | "bottom-right" | "bottom-left"

export interface NeumorphismOptions {
    color: string
    size: number
    borderRadius: number
    distance: number
    intensity: number // blur softness in px
    shape: NeumorphismShape
    direction: LightDirection
}

export interface NeumorphismResult {
    css: string
    lightColor: string
    darkColor: string
    boxShadow: string
    background: string
}

const HEX_PATTERN = /^#([0-9a-fA-F]{6})$/

function clampByte(value: number): number {
    if (value < 0) return 0
    if (value > 255) return 255
    return Math.round(value)
}

/**
 * Lighten (positive amount) or darken (negative amount) a 6-digit hex color.
 * Each channel is shifted by `amount` and clamped to the 0–255 range.
 */
export function lightenDarken(hex: string, amount: number): string {
    const match = HEX_PATTERN.exec(hex.trim())
    if (!match) {
        // Fall back to a neutral grey rather than throwing on bad input.
        return "#808080"
    }

    const num = parseInt(match[1], 16)
    const r = clampByte(((num >> 16) & 0xff) + amount)
    const g = clampByte(((num >> 8) & 0xff) + amount)
    const b = clampByte((num & 0xff) + amount)

    const toHex = (channel: number) => channel.toString(16).padStart(2, "0")
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Offset signs per light direction: the dark shadow falls away from the light. */
function offsetsFor(direction: LightDirection, distance: number): { x: number; y: number } {
    switch (direction) {
        case "top-left":
            return { x: distance, y: distance }
        case "top-right":
            return { x: -distance, y: distance }
        case "bottom-right":
            return { x: -distance, y: -distance }
        case "bottom-left":
            return { x: distance, y: -distance }
    }
}

const SHADOW_SHIFT = 40

/** Build the background value, adding a gradient for concave/convex shapes. */
function backgroundFor(shape: NeumorphismShape, color: string, direction: LightDirection): string {
    if (shape === "flat" || shape === "pressed") {
        return color
    }

    const lighter = lightenDarken(color, 7)
    const darker = lightenDarken(color, -7)

    // concave: darker near the light corner; convex: lighter near the light corner.
    const start = shape === "concave" ? darker : lighter
    const end = shape === "concave" ? lighter : darker

    // Gradient flows along the diagonal opposite the light corner.
    const angle =
        direction === "top-left"
            ? "145deg"
            : direction === "top-right"
              ? "215deg"
              : direction === "bottom-right"
                ? "325deg"
                : "55deg"

    return `linear-gradient(${angle}, ${start}, ${end})`
}

/**
 * Build the full neumorphism CSS. Returns the assembled css string plus the
 * computed light/dark shadow colors, the box-shadow value and the background.
 */
export function buildNeumorphism(opts: NeumorphismOptions): NeumorphismResult {
    const { color, borderRadius, distance, intensity, shape, direction } = opts

    const lightColor = lightenDarken(color, SHADOW_SHIFT)
    const darkColor = lightenDarken(color, -SHADOW_SHIFT)

    const { x, y } = offsetsFor(direction, distance)
    const blur = intensity

    const isPressed = shape === "pressed"
    const inset = isPressed ? "inset " : ""

    // Dark shadow on the away side, light shadow on the light side.
    const darkShadow = `${inset}${x}px ${y}px ${blur}px ${darkColor}`
    const lightShadow = `${inset}${-x}px ${-y}px ${blur}px ${lightColor}`
    const boxShadow = `${darkShadow}, ${lightShadow}`

    const background = backgroundFor(shape, color, direction)

    const css = `background: ${background};
border-radius: ${borderRadius}px;
box-shadow: ${boxShadow};`

    return { css, lightColor, darkColor, boxShadow, background }
}
