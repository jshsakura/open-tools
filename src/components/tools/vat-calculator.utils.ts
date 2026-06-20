export type VatMode = "addVat" | "extractVat"

export interface VatResult {
  net: number
  vat: number
  gross: number
}

/**
 * Compute VAT breakdown.
 * - addVat: `amount` is the net (supply) amount → vat = net * r, gross = net + vat.
 * - extractVat: `amount` is the gross (VAT-inclusive) amount → net = gross / (1 + r), vat = gross - net.
 */
export function computeVat(
  amount: number,
  ratePercent: number,
  mode: VatMode,
): VatResult {
  if (!Number.isFinite(amount) || !Number.isFinite(ratePercent)) {
    return { net: 0, vat: 0, gross: 0 }
  }

  const r = ratePercent / 100

  if (mode === "addVat") {
    const net = amount
    const vat = amount * r
    const gross = net + vat
    return { net, vat, gross }
  }

  const gross = amount
  const net = amount / (1 + r)
  const vat = gross - net
  return { net, vat, gross }
}
