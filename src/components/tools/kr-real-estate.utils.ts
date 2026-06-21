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

// 다주택자 취득세 중과 간이 모델 (조정대상지역 기준, 지방교육세 등 부가세 제외).
// 1주택: 기본 취득세율(acquisitionTax), 2주택: 8%, 3주택 이상: 12%.
export const MULTI_HOME_RATE_2 = 0.08
export const MULTI_HOME_RATE_3_PLUS = 0.12

/**
 * Acquisition tax with multi-home surcharge (간이). `homeCount` is the number of
 * homes owned *after* this purchase. 1 home uses the standard banded rate;
 * 2 homes → 8%; 3+ homes → 12% (조정대상지역 간이 기준). Non-positive prices yield 0.
 */
export function acquisitionTaxMultiHome(price: number, homeCount: number): number {
  if (price <= 0) return 0
  if (homeCount <= 1) return acquisitionTax(price)
  const rate = homeCount === 2 ? MULTI_HOME_RATE_2 : MULTI_HOME_RATE_3_PLUS
  return Math.floor(price * rate)
}

// 1세대 1주택 비과세 한도 (양도가액 12억).
export const ONE_HOME_EXEMPTION = 12 * EOK

// 양도소득 기본공제 (연 250만원).
export const BASIC_DEDUCTION = 250 * MAN

// 양도소득세 기본세율 누진구조 (과세표준 기준).
// Each bracket applies its rate up to `limit`, minus the progressive deduction.
export const CAPITAL_GAINS_BRACKETS = [
  { limit: 1400 * MAN, rate: 0.06, deduction: 0 },
  { limit: 5000 * MAN, rate: 0.15, deduction: 126 * MAN },
  { limit: 8800 * MAN, rate: 0.24, deduction: 576 * MAN },
  { limit: 1.5 * EOK, rate: 0.35, deduction: 1544 * MAN },
  { limit: 3 * EOK, rate: 0.38, deduction: 1994 * MAN },
  { limit: 5 * EOK, rate: 0.4, deduction: 2594 * MAN },
  { limit: 10 * EOK, rate: 0.42, deduction: 3594 * MAN },
  { limit: Infinity, rate: 0.45, deduction: 6594 * MAN },
]

/**
 * Long-term holding deduction rate (장기보유특별공제, 간이 일반 기준):
 * 2% per year held from year 3, capped at 30% (17 years). Below 3 years: 0%.
 */
export function longTermHoldingRate(years: number): number {
  if (years < 3) return 0
  return Math.min((years - 2) * 0.02, 0.3)
}

export interface CapitalGainsInput {
  /** 양도가액 (sale price). */
  salePrice: number
  /** 취득가액 (purchase price). */
  purchasePrice: number
  /** 보유기간 (years held). */
  yearsHeld: number
  /** 1세대 1주택 비과세 대상 여부. */
  isOneHomeExempt: boolean
}

export interface CapitalGainsResult {
  /** 양도차익 (raw gain, may be 0 if negative). */
  gain: number
  /** 과세 대상 양도차익 (after 12억 exemption pro-rate). */
  taxableGain: number
  /** 과세표준 (after long-term + basic deduction). */
  taxBase: number
  /** 산출 양도소득세 (basic estimate). */
  tax: number
}

/**
 * Simplified 양도소득세 (capital gains tax) estimate.
 *
 * - Gain = salePrice - purchasePrice (floored at 0).
 * - 1세대 1주택 비과세: gain above the 12억 portion is taxed pro-rata
 *   ((salePrice - 12억) / salePrice), the rest is exempt.
 * - Long-term holding deduction applies to the taxable gain.
 * - Basic 연 250만 deduction applies, then the progressive bracket rate.
 */
export function capitalGainsTax(input: CapitalGainsInput): CapitalGainsResult {
  const { salePrice, purchasePrice, yearsHeld, isOneHomeExempt } = input
  const gain = Math.max(salePrice - purchasePrice, 0)

  if (gain <= 0) {
    return { gain: 0, taxableGain: 0, taxBase: 0, tax: 0 }
  }

  let taxableGain = gain
  if (isOneHomeExempt) {
    if (salePrice <= ONE_HOME_EXEMPTION) {
      taxableGain = 0
    } else {
      const taxedRatio = (salePrice - ONE_HOME_EXEMPTION) / salePrice
      taxableGain = gain * taxedRatio
    }
  }

  if (taxableGain <= 0) {
    return { gain, taxableGain: 0, taxBase: 0, tax: 0 }
  }

  const afterLongTerm = taxableGain * (1 - longTermHoldingRate(yearsHeld))
  const taxBase = Math.max(afterLongTerm - BASIC_DEDUCTION, 0)

  if (taxBase <= 0) {
    return { gain, taxableGain, taxBase: 0, tax: 0 }
  }

  const bracket =
    CAPITAL_GAINS_BRACKETS.find((b) => taxBase <= b.limit) ??
    CAPITAL_GAINS_BRACKETS[CAPITAL_GAINS_BRACKETS.length - 1]
  const tax = Math.max(Math.floor(taxBase * bracket.rate - bracket.deduction), 0)

  return { gain, taxableGain, taxBase, tax }
}
