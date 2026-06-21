export interface Specificity {
  a: number
  b: number
  c: number
}

export interface SpecificityResult {
  selector: string
  specificity: Specificity
}

const EMPTY: Specificity = { a: 0, b: 0, c: 0 }

const ID_PATTERN = /^#[-\w]+/
const CLASS_PATTERN = /^\.[-\w]+/
const ATTRIBUTE_PATTERN = /^\[[^\]]*\]/
const PSEUDO_PATTERN = /^::?[-\w]+/
const ELEMENT_PATTERN = /^[-\w]+/

// Pseudo-elements always count as element-level (c), even with single-colon legacy syntax.
const LEGACY_PSEUDO_ELEMENTS = new Set([
  "before",
  "after",
  "first-line",
  "first-letter",
])

// Pseudo-classes whose specificity is taken from their most-specific argument.
const ARG_MAX_PSEUDO = new Set(["not", "is", "has"])
// Pseudo-classes that contribute zero specificity (and ignore their argument).
const ZERO_PSEUDO = new Set(["where"])

function addSpecificity(base: Specificity, extra: Specificity): Specificity {
  return {
    a: base.a + extra.a,
    b: base.b + extra.b,
    c: base.c + extra.c,
  }
}

function compareTuples(s1: Specificity, s2: Specificity): number {
  if (s1.a !== s2.a) return s1.a - s2.a
  if (s1.b !== s2.b) return s1.b - s2.b
  return s1.c - s2.c
}

function maxSpecificity(specs: Specificity[]): Specificity {
  return specs.reduce(
    (best, current) => (compareTuples(current, best) > 0 ? current : best),
    EMPTY,
  )
}

// Splits an argument list on top-level commas (respecting nested parentheses/brackets).
function splitArguments(input: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ""
  for (const char of input) {
    if (char === "(" || char === "[") depth += 1
    else if (char === ")" || char === "]") depth -= 1
    if (char === "," && depth === 0) {
      parts.push(current)
      current = ""
    } else {
      current += char
    }
  }
  if (current.trim() !== "") parts.push(current)
  return parts
}

// Reads a balanced parenthesised group starting at `start` (which must be "(").
// Returns the inner content and the index just after the closing ")".
function readGroup(
  input: string,
  start: number,
): { content: string; end: number } | null {
  if (input[start] !== "(") return null
  let depth = 0
  for (let i = start; i < input.length; i += 1) {
    if (input[i] === "(") depth += 1
    else if (input[i] === ")") {
      depth -= 1
      if (depth === 0) {
        return { content: input.slice(start + 1, i), end: i + 1 }
      }
    }
  }
  return null
}

function specificityFromPseudoArgs(name: string, args: string): Specificity {
  if (ZERO_PSEUDO.has(name)) return EMPTY
  if (ARG_MAX_PSEUDO.has(name)) {
    const argSpecs = splitArguments(args).map((arg) =>
      calculateSpecificity(arg.trim()),
    )
    return maxSpecificity(argSpecs)
  }
  // Functional pseudo-class with non-selector args (e.g. :nth-child(2n)) counts as a class.
  return { a: 0, b: 1, c: 0 }
}

/**
 * Computes CSS specificity for a single complex selector.
 * Combinators (>, +, ~, descendant whitespace) and the universal selector (*)
 * do not contribute. Returns the (a, b, c) tuple.
 */
export function calculateSpecificity(selector: string): Specificity {
  let result: Specificity = { a: 0, b: 0, c: 0 }
  let remaining = selector.trim()

  while (remaining.length > 0) {
    const char = remaining[0]

    // Combinators and whitespace: no contribution.
    if (char === " " || char === ">" || char === "+" || char === "~") {
      remaining = remaining.slice(1)
      continue
    }

    // Universal selector: no contribution.
    if (char === "*") {
      remaining = remaining.slice(1)
      continue
    }

    if (char === "#") {
      const match = remaining.match(ID_PATTERN)
      if (match) {
        result = addSpecificity(result, { a: 1, b: 0, c: 0 })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    if (char === ".") {
      const match = remaining.match(CLASS_PATTERN)
      if (match) {
        result = addSpecificity(result, { a: 0, b: 1, c: 0 })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    if (char === "[") {
      const match = remaining.match(ATTRIBUTE_PATTERN)
      if (match) {
        result = addSpecificity(result, { a: 0, b: 1, c: 0 })
        remaining = remaining.slice(match[0].length)
        continue
      }
    }

    if (char === ":") {
      const pseudoMatch = remaining.match(PSEUDO_PATTERN)
      if (pseudoMatch) {
        const token = pseudoMatch[0]
        const isPseudoElement =
          token.startsWith("::") ||
          LEGACY_PSEUDO_ELEMENTS.has(token.replace(/^:+/, ""))
        const name = token.replace(/^:+/, "").toLowerCase()

        // Check for a functional pseudo-class argument group.
        const afterToken = remaining.slice(token.length)
        if (afterToken[0] === "(") {
          const group = readGroup(remaining, token.length)
          if (group) {
            const argSpec = specificityFromPseudoArgs(name, group.content)
            result = addSpecificity(result, argSpec)
            remaining = remaining.slice(group.end)
            continue
          }
        }

        if (isPseudoElement) {
          result = addSpecificity(result, { a: 0, b: 0, c: 1 })
        } else {
          result = addSpecificity(result, { a: 0, b: 1, c: 0 })
        }
        remaining = remaining.slice(token.length)
        continue
      }
    }

    const elementMatch = remaining.match(ELEMENT_PATTERN)
    if (elementMatch) {
      result = addSpecificity(result, { a: 0, b: 0, c: 1 })
      remaining = remaining.slice(elementMatch[0].length)
      continue
    }

    // Unrecognised character: skip to avoid an infinite loop.
    remaining = remaining.slice(1)
  }

  return result
}

/**
 * Compares two selectors by specificity.
 * Returns a positive number if s1 wins, negative if s2 wins, 0 if tied.
 */
export function compareSpecificity(s1: string, s2: string): number {
  return compareTuples(calculateSpecificity(s1), calculateSpecificity(s2))
}

export function formatSpecificity(spec: Specificity): string {
  return `${spec.a},${spec.b},${spec.c}`
}

/**
 * Calculates specificity for a multi-line list of selectors and identifies
 * the winning (highest-specificity) selector(s).
 */
export function calculateAll(input: string): {
  results: SpecificityResult[]
  winners: number[]
} {
  const results = input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((selector) => ({
      selector,
      specificity: calculateSpecificity(selector),
    }))

  if (results.length === 0) {
    return { results, winners: [] }
  }

  const best = results.reduce(
    (acc, item) =>
      compareTuples(item.specificity, acc) > 0 ? item.specificity : acc,
    EMPTY,
  )

  const winners = results
    .map((item, index) => ({ index, spec: item.specificity }))
    .filter((item) => compareTuples(item.spec, best) === 0)
    .map((item) => item.index)

  return { results, winners }
}
