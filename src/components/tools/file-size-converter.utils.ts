export type ByteUnit = "B" | "KB" | "MB" | "GB" | "TB" | "PB" | "EB"
export type BitUnit = "Kb" | "Mb" | "Gb"
export type SizeUnit = ByteUnit | BitUnit
export type Base = "decimal" | "binary"

export const BYTE_UNITS: ByteUnit[] = ["B", "KB", "MB", "GB", "TB", "PB", "EB"]
export const BIT_UNITS: BitUnit[] = ["Kb", "Mb", "Gb"]
export const ALL_UNITS: SizeUnit[] = [...BYTE_UNITS, ...BIT_UNITS]

const BITS_PER_BYTE = 8

/** Decimal (1000) exponent for each byte tier. */
const BYTE_EXPONENT: Record<ByteUnit, number> = {
  B: 0,
  KB: 1,
  MB: 2,
  GB: 3,
  TB: 4,
  PB: 5,
  EB: 6,
}

/** Bit units are always decimal multiples of a bit (1 Kb = 1000 bits). */
const BIT_FACTOR: Record<BitUnit, number> = {
  Kb: 1_000,
  Mb: 1_000_000,
  Gb: 1_000_000_000,
}

export function isBitUnit(unit: SizeUnit): unit is BitUnit {
  return (BIT_UNITS as string[]).includes(unit)
}

/** Convert a value in any unit to a count of bytes. */
export function toBytes(value: number, unit: SizeUnit, base: Base): number {
  if (isBitUnit(unit)) {
    return (value * BIT_FACTOR[unit]) / BITS_PER_BYTE
  }
  const factor = base === "binary" ? 1024 : 1000
  return value * factor ** BYTE_EXPONENT[unit]
}

/** Convert a count of bytes into the requested unit. */
export function fromBytes(bytes: number, unit: SizeUnit, base: Base): number {
  if (isBitUnit(unit)) {
    return (bytes * BITS_PER_BYTE) / BIT_FACTOR[unit]
  }
  const factor = base === "binary" ? 1024 : 1000
  return bytes / factor ** BYTE_EXPONENT[unit]
}

/** Convert directly between two units under a given base. */
export function convertSize(
  value: number,
  fromUnit: SizeUnit,
  toUnit: SizeUnit,
  base: Base,
): number {
  return fromBytes(toBytes(value, fromUnit, base), toUnit, base)
}

/**
 * Transfer time in seconds for `bytes` of data over a link of
 * `bandwidthMbps` megabits per second (decimal Mb = 1e6 bits).
 * Returns null for non-positive bandwidth.
 */
export function transferSeconds(bytes: number, bandwidthMbps: number): number | null {
  if (!Number.isFinite(bandwidthMbps) || bandwidthMbps <= 0) return null
  const bits = bytes * BITS_PER_BYTE
  const bitsPerSecond = bandwidthMbps * 1_000_000
  return bits / bitsPerSecond
}

/** Format seconds as a compact h/m/s string. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "-"
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  parts.push(`${s}s`)
  return parts.join(" ")
}
