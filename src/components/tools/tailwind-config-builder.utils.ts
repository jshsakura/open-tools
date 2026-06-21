export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const
export type Shade = (typeof SHADES)[number]
export type ColorScale = Record<Shade, string>

// The shade whose value equals the picked base color.
const BASE_SHADE: Shade = 500

interface Rgb {
  r: number
  g: number
  b: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.replace(/^#/, "")
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized
  if (!/^[0-9a-fA-F]{6}$/.test(expanded)) return null
  return {
    r: parseInt(expanded.slice(0, 2), 16),
    g: parseInt(expanded.slice(2, 4), 16),
    b: parseInt(expanded.slice(4, 6), 16),
  }
}

function toHex(value: number): string {
  return clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0")
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

// Mix a color toward white (amount > 0) or black (amount < 0) by a ratio in [0, 1].
function mix(channel: number, target: number, amount: number): number {
  return channel + (target - channel) * amount
}

function lighten(rgb: Rgb, amount: number): Rgb {
  return {
    r: mix(rgb.r, 255, amount),
    g: mix(rgb.g, 255, amount),
    b: mix(rgb.b, 255, amount),
  }
}

function darken(rgb: Rgb, amount: number): Rgb {
  return {
    r: mix(rgb.r, 0, amount),
    g: mix(rgb.g, 0, amount),
    b: mix(rgb.b, 0, amount),
  }
}

// Lighten ratios for shades 50–400 (relative to the 500 base).
const LIGHTEN_RATIOS: Record<number, number> = {
  50: 0.95,
  100: 0.84,
  200: 0.65,
  300: 0.45,
  400: 0.22,
}

// Darken ratios for shades 600–900 (relative to the 500 base).
const DARKEN_RATIOS: Record<number, number> = {
  600: 0.16,
  700: 0.32,
  800: 0.48,
  900: 0.64,
}

// Builds a full 50–900 Tailwind-style color scale from a single base hex.
// Falls back to a neutral grey scale when the input hex is invalid.
export function generateColorScale(baseHex: string): ColorScale {
  const base = hexToRgb(baseHex) ?? { r: 100, g: 116, b: 139 }
  const scale = {} as ColorScale
  for (const shade of SHADES) {
    if (shade === BASE_SHADE) {
      scale[shade] = rgbToHex(base)
    } else if (shade < BASE_SHADE) {
      scale[shade] = rgbToHex(lighten(base, LIGHTEN_RATIOS[shade]))
    } else {
      scale[shade] = rgbToHex(darken(base, DARKEN_RATIOS[shade]))
    }
  }
  return scale
}
