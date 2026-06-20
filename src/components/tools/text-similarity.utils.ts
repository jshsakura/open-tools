// Pure metric functions for the Text Similarity tool.
// All return values are 0..100 percentages unless otherwise noted.

// Levenshtein O(n*m) can freeze the tab on huge inputs, so callers should
// guard against strings longer than this before computing.
export const MAX_SIMILARITY_INPUT_LENGTH = 5000

// Levenshtein edit distance (raw number of single-char edits).
export function levenshteinDistance(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // Single-row dynamic programming to keep memory at O(min(n, m)).
  const previousRow: number[] = []
  for (let j = 0; j <= b.length; j++) previousRow[j] = j

  for (let i = 1; i <= a.length; i++) {
    let previousDiagonal = previousRow[0]
    previousRow[0] = i
    for (let j = 1; j <= b.length; j++) {
      const insertOrDeleteOrReplace = Math.min(
        previousRow[j] + 1,
        previousRow[j - 1] + 1,
        previousDiagonal + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1),
      )
      previousDiagonal = previousRow[j]
      previousRow[j] = insertOrDeleteOrReplace
    }
  }

  return previousRow[b.length]
}

// Similarity as a percentage derived from Levenshtein distance.
export function levenshteinRatio(a: string, b: string): number {
  if (!a && !b) return 100
  if (!a || !b) return 0
  if (a === b) return 100

  const longerLength = Math.max(a.length, b.length)
  const distance = levenshteinDistance(a, b)
  return ((longerLength - distance) / longerLength) * 100
}

// Split text into a normalized set of word tokens (lowercased, punctuation-light).
export function tokenize(text: string): Set<string> {
  const tokens = text
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter(Boolean)
  return new Set(tokens)
}

// Jaccard index over token sets: |A ∩ B| / |A ∪ B|, as a percentage.
export function jaccardSimilarity(a: string, b: string): number {
  if (!a && !b) return 100
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (setA.size === 0 && setB.size === 0) return 100
  if (setA.size === 0 || setB.size === 0) return 0

  let intersectionSize = 0
  for (const token of setA) {
    if (setB.has(token)) intersectionSize++
  }
  const unionSize = setA.size + setB.size - intersectionSize
  return (intersectionSize / unionSize) * 100
}

// Sørensen–Dice coefficient over token sets: 2|A ∩ B| / (|A| + |B|), as a percentage.
export function diceCoefficient(a: string, b: string): number {
  if (!a && !b) return 100
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (setA.size === 0 && setB.size === 0) return 100
  if (setA.size === 0 || setB.size === 0) return 0

  let intersectionSize = 0
  for (const token of setA) {
    if (setB.has(token)) intersectionSize++
  }
  return ((2 * intersectionSize) / (setA.size + setB.size)) * 100
}

export interface SimilarityMetrics {
  levenshtein: number
  jaccard: number
  dice: number
}

export function computeSimilarityMetrics(a: string, b: string): SimilarityMetrics {
  return {
    levenshtein: levenshteinRatio(a, b),
    jaccard: jaccardSimilarity(a, b),
    dice: diceCoefficient(a, b),
  }
}
