export interface AmortizationRow {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export interface AmortizationResult {
  schedule: AmortizationRow[]
  totalInterest: number
  /** Number of months until the balance reaches zero. */
  payoffMonths: number
  /** Scheduled monthly payment (principal + interest), excluding extra. */
  monthlyPayment: number
  totalPayment: number
}

/**
 * Equal-payment (annuity) amortization for a fixed-rate loan.
 *
 * @param principal   loan amount
 * @param annualRate  annual interest rate as a percentage (e.g. 4.5)
 * @param months      original term in months
 * @param extra       optional fixed extra payment applied to principal each month
 *
 * Handles the zero-interest case. An `extra` payment accelerates payoff, so the
 * returned schedule may be shorter than `months`. Returns null for invalid input.
 */
export function amortize(
  principal: number,
  annualRate: number,
  months: number,
  extra: number = 0,
): AmortizationResult | null {
  if (
    !Number.isFinite(principal) ||
    !Number.isFinite(annualRate) ||
    !Number.isFinite(months) ||
    !Number.isFinite(extra) ||
    principal <= 0 ||
    months <= 0 ||
    annualRate < 0 ||
    extra < 0
  ) {
    return null
  }

  const monthlyRate = annualRate / 100 / 12
  const monthlyPayment =
    monthlyRate === 0
      ? principal / months
      : (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
        (Math.pow(1 + monthlyRate, months) - 1)

  const schedule: AmortizationRow[] = []
  let balance = principal
  let totalInterest = 0
  let month = 0

  // Guard against pathological non-amortizing inputs (extra never reduces below
  // the interest accrual). Cap iterations at the original term as a safety net
  // when there is no extra payment, otherwise allow early payoff.
  const maxMonths = months + 1

  while (balance > 0 && month < maxMonths) {
    month++
    const interest = balance * monthlyRate
    let principalPaid = monthlyPayment - interest + extra

    if (principalPaid >= balance) {
      principalPaid = balance
    }

    const payment = principalPaid + interest
    balance -= principalPaid
    totalInterest += interest

    schedule.push({
      month,
      payment,
      principal: principalPaid,
      interest,
      balance: Math.max(0, balance),
    })

    if (balance <= 1e-6) {
      balance = 0
      break
    }
  }

  const totalPayment = schedule.reduce((sum, row) => sum + row.payment, 0)

  return {
    schedule,
    totalInterest,
    payoffMonths: schedule.length,
    monthlyPayment,
    totalPayment,
  }
}
