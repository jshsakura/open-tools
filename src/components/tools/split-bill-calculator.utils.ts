export type SplitMode = "even" | "weighted"

export interface SplitPersonInput {
  name: string
  /** Used in "weighted" mode. A share weight (e.g. 1, 2) relative to the others. */
  weight: number
}

export interface SplitPersonShare {
  name: string
  /** Fraction of the grand total this person owes (0..1). */
  fraction: number
  /** Rounded amount this person owes. */
  amount: number
}

export interface SplitResult {
  taxAmount: number
  tipAmount: number
  total: number
  /** Per-person amount for even splits (total / people). */
  perPerson: number
  shares: SplitPersonShare[]
}

export interface SplitInput {
  bill: number
  tax: number
  tip: number
  mode: SplitMode
  people: SplitPersonInput[]
}

function isValidNumber(value: number): boolean {
  return Number.isFinite(value)
}

/**
 * Distributes the rounded `total` across `weights`, assigning any rounding
 * remainder (in minor units) to the people with the largest fractional parts so
 * the sum of per-person amounts equals the total exactly.
 */
function distributeWithRemainder(total: number, weights: number[]): number[] {
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  if (totalWeight <= 0) {
    return weights.map(() => 0)
  }

  // Work in minor units (cents) to avoid floating-point drift in the remainder.
  const totalCents = Math.round(total * 100)
  const rawCents = weights.map((w) => (totalCents * w) / totalWeight)
  const floored = rawCents.map((c) => Math.floor(c))
  const assigned = floored.reduce((sum, c) => sum + c, 0)
  let remainder = totalCents - assigned

  const order = rawCents
    .map((c, index) => ({ index, frac: c - Math.floor(c) }))
    .sort((a, b) => b.frac - a.frac)

  const cents = [...floored]
  for (let i = 0; i < order.length && remainder > 0; i++) {
    cents[order[i].index] += 1
    remainder -= 1
  }

  return cents.map((c) => c / 100)
}

export function computeSplit(input: SplitInput): SplitResult | null {
  const { bill, tax, tip, mode, people } = input

  if (!isValidNumber(bill) || bill < 0 || people.length === 0) {
    return null
  }

  const safeTax = isValidNumber(tax) && tax >= 0 ? tax : 0
  const safeTip = isValidNumber(tip) && tip >= 0 ? tip : 0

  const taxAmount = bill * (safeTax / 100)
  const tipAmount = bill * (safeTip / 100)
  const total = bill + taxAmount + tipAmount
  const perPerson = total / people.length

  const weights =
    mode === "weighted"
      ? people.map((p) => (isValidNumber(p.weight) && p.weight > 0 ? p.weight : 0))
      : people.map(() => 1)

  const amounts = distributeWithRemainder(total, weights)
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)

  const shares: SplitPersonShare[] = people.map((p, index) => ({
    name: p.name,
    fraction: totalWeight > 0 ? weights[index] / totalWeight : 0,
    amount: amounts[index],
  }))

  return { taxAmount, tipAmount, total, perPerson, shares }
}
