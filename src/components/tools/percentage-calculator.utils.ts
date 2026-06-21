/** Mode 1: what is P% of B? -> (P/100) * B */
export function percentOf(percent: number, base: number): number | null {
  if (!Number.isFinite(percent) || !Number.isFinite(base)) return null
  return (percent / 100) * base
}

/** Mode 2: A is what percent of B? -> (A/B) * 100 */
export function whatPercent(part: number, whole: number): number | null {
  if (!Number.isFinite(part) || !Number.isFinite(whole) || whole === 0) return null
  return (part / whole) * 100
}

export interface ChangeResult {
  difference: number
  percentChange: number
  isIncrease: boolean
}

/** Mode 3: percentage change between an old value and a new value. */
export function percentageChange(oldValue: number, newValue: number): ChangeResult | null {
  if (!Number.isFinite(oldValue) || !Number.isFinite(newValue) || oldValue === 0) {
    return null
  }
  const difference = newValue - oldValue
  return {
    difference,
    percentChange: (difference / oldValue) * 100,
    isIncrease: difference >= 0,
  }
}

export interface AdjustResult {
  /** Resulting value after applying the increase/decrease. */
  result: number
  /** The signed amount added (positive) or removed (negative). */
  delta: number
}

/**
 * Mode 4: increase or decrease N by X%.
 * Positive percent increases, negative percent decreases.
 */
export function adjustByPercent(value: number, percent: number): AdjustResult | null {
  if (!Number.isFinite(value) || !Number.isFinite(percent)) return null
  const delta = value * (percent / 100)
  return {
    result: value + delta,
    delta,
  }
}
