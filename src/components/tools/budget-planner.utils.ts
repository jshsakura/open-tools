export interface BudgetEntry {
  type: "income" | "expense"
  amount: number
}

export interface BudgetSummary {
  income: number
  expense: number
  balance: number
}

/**
 * Summarize budget entries into total income, total expense, and balance
 * (income - expense). Non-finite amounts (NaN, Infinity) are treated as 0 so a
 * single bad entry never corrupts the totals.
 */
export function summarize(entries: BudgetEntry[]): BudgetSummary {
  let income = 0
  let expense = 0

  for (const entry of entries) {
    const amount = Number.isFinite(entry.amount) ? entry.amount : 0
    if (entry.type === "income") {
      income += amount
    } else {
      expense += amount
    }
  }

  return { income, expense, balance: income - expense }
}
