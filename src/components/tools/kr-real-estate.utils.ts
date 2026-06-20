export const EOK = 100_000_000
export const MAN = 10_000

// 1 ㎡ = 0.3025 평 (Korean conversion factor).
const SQM_TO_PYEONG = 0.3025

/** Converts square meters to 평 (pyeong). */
export function sqmToPyeong(sqm: number): number {
  return sqm * SQM_TO_PYEONG
}

/** Converts 평 (pyeong) to square meters. */
export function pyeongToSqm(pyeong: number): number {
  return pyeong / SQM_TO_PYEONG
}

// 매매 중개보수 상한요율 / 한도액 (주택 기준)
// Each band: applies to prices strictly below `limit`, using `rate` capped at `cap`.
export const BROKERAGE_BANDS = [
  { limit: 5_000 * MAN, rate: 0.006, cap: 25 * MAN },
  { limit: 2 * EOK, rate: 0.005, cap: 80 * MAN },
  { limit: 9 * EOK, rate: 0.004, cap: Infinity },
  { limit: 12 * EOK, rate: 0.005, cap: Infinity },
  { limit: 15 * EOK, rate: 0.006, cap: Infinity },
  { limit: Infinity, rate: 0.007, cap: Infinity },
]

/**
 * Korean real-estate brokerage fee (매매) for a sale price.
 * Selects the band whose upper limit the price falls under, applies the band
 * rate, and caps the result at the band's 한도액. Non-positive prices yield 0.
 */
export function brokerageFee(price: number): number {
  if (price <= 0) return 0
  const band =
    BROKERAGE_BANDS.find((b) => price < b.limit) ??
    BROKERAGE_BANDS[BROKERAGE_BANDS.length - 1]
  return Math.min(Math.floor(price * band.rate), band.cap)
}

/**
 * Simplified acquisition tax (취득세) for a residence (전용 85㎡ 이하 기준,
 * 농특세 비과세 + 지방교육세 포함 간이 모델). Non-positive prices yield 0.
 *
 *   <= 6억:  1.1%  (취득세 1% + 지방교육세 0.1%)
 *   6~9억:   progressive ((price/억 * 2/3) - 3)% + 0.1%
 *   > 9억:   3.3%  (취득세 3% + 지방교육세 0.3%)
 */
export function acquisitionTax(price: number): number {
  if (price <= 0) return 0
  let rate: number
  if (price <= 6 * EOK) {
    rate = 0.011
  } else if (price <= 9 * EOK) {
    const base = (price / EOK) * (2 / 3) - 3
    rate = base / 100 + 0.001
  } else {
    rate = 0.033
  }
  return Math.floor(price * rate)
}
