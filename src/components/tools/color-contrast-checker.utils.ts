export interface ContrastResult {
  ratio: number
  aaNormal: boolean
  aaLarge: boolean
  aaaNormal: boolean
  aaaLarge: boolean
}

const HEX_SHORT = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
const HEX_LONG = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i

export function parseHex(input: string): [number, number, number] | null {
  const value = input.trim()
  const short = value.match(HEX_SHORT)
  if (short) {
    return [
      parseInt(short[1] + short[1], 16),
      parseInt(short[2] + short[2], 16),
      parseInt(short[3] + short[3], 16),
    ]
  }
  const long = value.match(HEX_LONG)
  if (long) {
    return [
      parseInt(long[1], 16),
      parseInt(long[2], 16),
      parseInt(long[3], 16),
    ]
  }
  return null
}

function channelLuminance(channel: number): number {
  const c = channel / 255
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  )
}

// WCAG 2.1 thresholds
const AA_NORMAL = 4.5
const AA_LARGE = 3
const AAA_NORMAL = 7
const AAA_LARGE = 4.5

export function getContrast(foreground: string, background: string): ContrastResult | null {
  const fg = parseHex(foreground)
  const bg = parseHex(background)
  if (!fg || !bg) return null

  const lum1 = relativeLuminance(fg)
  const lum2 = relativeLuminance(bg)
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  const ratio = Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100

  return {
    ratio,
    aaNormal: ratio >= AA_NORMAL,
    aaLarge: ratio >= AA_LARGE,
    aaaNormal: ratio >= AAA_NORMAL,
    aaaLarge: ratio >= AAA_LARGE,
  }
}
