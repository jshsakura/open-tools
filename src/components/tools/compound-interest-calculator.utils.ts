export interface GrowthRow {
  year: number
  /** Starting principal (year 0 deposit), constant across rows. */
  principal: number
  /** Cumulative contributions made through the end of this year (excludes principal). */
  contributions: number
  /** Cumulative interest earned through the end of this year. */
  interest: number
  /** Account balance at the end of this year. */
  balance: number
}

/**
 * Year-by-year growth schedule.
 *
 * The monthly `contribution` is added at the start of each month, and interest
 * is compounded monthly on the running balance. Using monthly steps keeps the
 * schedule consistent with the annuity contributions while still reflecting the
 * supplied annual rate.
 *
 * `compoundsPerYear` selects how the annual rate is split into a per-period
 * rate before being converted to the equivalent monthly accrual, so yearly /
 * quarterly / monthly choices yield distinct results.
 *
 * Returns an empty array for invalid inputs.
 */
export function growthSchedule(
  principal: number,
  ratePercent: number,
  years: number,
  compoundsPerYear: number,
  contribution: number,
): GrowthRow[] {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(ratePercent) ||
    !Number.isFinite(years) ||
    !Number.isFinite(compoundsPerYear) ||
    !Number.isFinite(contribution) ||
    principal < 0 ||
    ratePercent < 0 ||
    years <= 0 ||
    compoundsPerYear <= 0 ||
    contribution < 0
  ) {
    return []
  }

  const totalYears = Math.floor(years)
  // Effective annual rate implied by the chosen compounding frequency, then
  // converted to an equivalent monthly growth factor for the contribution loop.
  const periodicRate = ratePercent / 100 / compoundsPerYear
  const effectiveAnnual = Math.pow(1 + periodicRate, compoundsPerYear) - 1
  const monthlyFactor = Math.pow(1 + effectiveAnnual, 1 / 12)

  const rows: GrowthRow[] = []
  let balance = principal
  let cumulativeContributions = 0

  for (let year = 1; year <= totalYears; year++) {
    for (let month = 0; month < 12; month++) {
      balance += contribution
      cumulativeContributions += contribution
      balance *= monthlyFactor
    }

    const totalDeposited = principal + cumulativeContributions
    const interest = balance - totalDeposited

    rows.push({
      year,
      principal,
      contributions: cumulativeContributions,
      interest,
      balance,
    })
  }

  return rows
}
