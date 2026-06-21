export interface DiscountInput {
  originalPrice: number
  /** Sequential percentage discounts applied in order, e.g. [20, 10]. */
  discounts: number[]
  /** Fixed coupon amount subtracted after percentage discounts (per unit). */
  coupon: number
  /** Tax rate as a percentage, applied after discounts. 0 = no tax. */
  taxPercent: number
  quantity: number
}

export interface DiscountResult {
  /** Per-unit price after all percentage discounts. */
  unitAfterDiscounts: number
  /** Per-unit price after discounts + coupon (pre-tax). */
  unitAfterCoupon: number
  /** Effective discount percentage off the original unit price. */
  effectivePercentOff: number
  /** Subtotal for the full quantity, pre-tax. */
  subtotal: number
  /** Tax amount for the full quantity. */
  taxAmount: number
  /** Final total for the full quantity, including tax. */
  finalTotal: number
  /** Money saved versus original price * quantity (pre-tax). */
  totalSaved: number
}

const clampPercent = (value: number) => Math.min(100, Math.max(0, value))

/**
 * Apply a list of percentage discounts sequentially to a price.
 * Stacked discounts compound on the remaining price (20% then 10% != 30%).
 * Order-independent for the resulting price (multiplication is commutative).
 */
export function applyStackedDiscounts(price: number, discounts: number[]): number {
  return discounts.reduce((acc, raw) => {
    const pct = clampPercent(Number.isFinite(raw) ? raw : 0)
    return acc * (1 - pct / 100)
  }, Math.max(0, price))
}

/**
 * Compute a full checkout breakdown with stacked discounts, a per-unit coupon,
 * quantity, and tax. Returns null for invalid price/quantity.
 */
export function computeDiscount(input: DiscountInput): DiscountResult | null {
  const { originalPrice, discounts, coupon, taxPercent, quantity } = input

  if (!Number.isFinite(originalPrice) || originalPrice < 0) return null
  if (!Number.isFinite(quantity) || quantity <= 0) return null

  const safeCoupon = Number.isFinite(coupon) ? Math.max(0, coupon) : 0
  const safeTax = Number.isFinite(taxPercent) ? Math.max(0, taxPercent) : 0

  const unitAfterDiscounts = applyStackedDiscounts(originalPrice, discounts)
  const unitAfterCoupon = Math.max(0, unitAfterDiscounts - safeCoupon)

  const effectivePercentOff =
    originalPrice > 0 ? ((originalPrice - unitAfterCoupon) / originalPrice) * 100 : 0

  const subtotal = unitAfterCoupon * quantity
  const taxAmount = subtotal * (safeTax / 100)
  const finalTotal = subtotal + taxAmount
  const totalSaved = Math.max(0, originalPrice * quantity - subtotal)

  return {
    unitAfterDiscounts,
    unitAfterCoupon,
    effectivePercentOff,
    subtotal,
    taxAmount,
    finalTotal,
    totalSaved,
  }
}
