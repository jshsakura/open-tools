export type ModelRate = {
  id: string
  label: string
  /** USD per 1M input tokens */
  inputPerM: number
  /** USD per 1M output tokens */
  outputPerM: number
}

// Per-1M-token pricing snapshot. Labeled as an estimate in the UI; rates
// change over time, so these are a stable reference rather than live data.
export const MODEL_RATES: ModelRate[] = [
  { id: "gpt-4o", label: "GPT-4o", inputPerM: 2.5, outputPerM: 10.0 },
  { id: "gpt-4o-mini", label: "GPT-4o mini", inputPerM: 0.15, outputPerM: 0.6 },
  { id: "claude-sonnet", label: "Claude Sonnet", inputPerM: 3.0, outputPerM: 15.0 },
  { id: "claude-haiku", label: "Claude Haiku", inputPerM: 0.8, outputPerM: 4.0 },
  { id: "gemini-flash", label: "Gemini Flash", inputPerM: 0.075, outputPerM: 0.3 },
]

/**
 * Heuristic token estimate. No tokenizer dependency: blends the common
 * chars/4 rule with word and punctuation counts, since real tokenizers split
 * roughly per word and treat punctuation/symbols as separate tokens.
 */
export function estimateTokens(text: string): number {
  if (!text) return 0

  const charEstimate = text.length / 4
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const wordEstimate = words * 1.33
  const punctuation = (text.match(/[^\w\s]/g) ?? []).length

  // Blend char-based and word-based estimates, then add punctuation weight.
  const blended = (charEstimate + wordEstimate) / 2 + punctuation * 0.5
  return Math.max(0, Math.ceil(blended))
}

/** Cost in USD for a given token count at a per-1M-token rate. */
export function cost(tokens: number, ratePerMillion: number): number {
  if (tokens <= 0 || ratePerMillion <= 0) return 0
  return (tokens * ratePerMillion) / 1_000_000
}
