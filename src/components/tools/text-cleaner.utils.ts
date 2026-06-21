export type SortMode = "none" | "asc" | "desc"
export type CaseMode = "none" | "lower" | "upper" | "title"

export interface CleanOptions {
  removeDuplicates: boolean
  removeEmpty: boolean
  trimLines: boolean
  collapseSpaces: boolean
  removeExtraBlank: boolean
  removeLineNumbers: boolean
  stripHtml: boolean
  sort: SortMode
  caseMode: CaseMode
}

export const DEFAULT_CLEAN_OPTIONS: CleanOptions = {
  removeDuplicates: false,
  removeEmpty: false,
  trimLines: false,
  collapseSpaces: false,
  removeExtraBlank: false,
  removeLineNumbers: false,
  stripHtml: false,
  sort: "none",
  caseMode: "none",
}

const HTML_TAG_REGEX = /<\/?[a-z][^>]*>/gi
const LINE_NUMBER_PREFIX_REGEX = /^\s*\d+[.)\]:\t-]?\s+/
const MULTIPLE_SPACES_REGEX = /[ \t]{2,}/g

/** Splits input into lines, normalizing CRLF/CR to LF first. */
export function splitLines(input: string): string[] {
  if (input === "") return []
  return input.replace(/\r\n?/g, "\n").split("\n")
}

export function stripHtmlTags(line: string): string {
  return line.replace(HTML_TAG_REGEX, "")
}

export function removeLineNumber(line: string): string {
  return line.replace(LINE_NUMBER_PREFIX_REGEX, "")
}

export function collapseInnerSpaces(line: string): string {
  return line.replace(MULTIPLE_SPACES_REGEX, " ")
}

function toTitleCase(line: string): string {
  return line.replace(/\b\w/g, (char) => char.toUpperCase())
}

export function applyCase(line: string, mode: CaseMode): string {
  if (mode === "lower") return line.toLowerCase()
  if (mode === "upper") return line.toUpperCase()
  if (mode === "title") return toTitleCase(line.toLowerCase())
  return line
}

function sortLines(lines: readonly string[], mode: SortMode): string[] {
  if (mode === "none") return [...lines]
  const sorted = [...lines].sort((a, b) => a.localeCompare(b))
  return mode === "desc" ? sorted.reverse() : sorted
}

/** Removes runs of 2+ blank lines, collapsing them to a single blank line. */
function collapseBlankRuns(lines: readonly string[]): string[] {
  const result: string[] = []
  let previousBlank = false
  for (const line of lines) {
    const isBlank = line.trim() === ""
    if (isBlank && previousBlank) continue
    result.push(line)
    previousBlank = isBlank
  }
  return result
}

/**
 * Pure, composable text cleanup pipeline. Operations are applied in a fixed,
 * deterministic order so the output is stable regardless of UI toggle order.
 */
export function cleanText(input: string, opts: CleanOptions): string {
  if (input === "") return ""

  let lines = splitLines(input)

  // Per-line content transforms (order: strip tags -> line numbers -> spaces -> trim)
  lines = lines.map((line) => {
    let next = line
    if (opts.stripHtml) next = stripHtmlTags(next)
    if (opts.removeLineNumbers) next = removeLineNumber(next)
    if (opts.collapseSpaces) next = collapseInnerSpaces(next)
    if (opts.trimLines) next = next.trim()
    next = applyCase(next, opts.caseMode)
    return next
  })

  // Line-set transforms (order: empties -> dedup -> blank runs -> sort)
  if (opts.removeEmpty) {
    lines = lines.filter((line) => line.trim() !== "")
  }

  if (opts.removeDuplicates) {
    const seen = new Set<string>()
    lines = lines.filter((line) => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    })
  }

  if (opts.removeExtraBlank) {
    lines = collapseBlankRuns(lines)
  }

  lines = sortLines(lines, opts.sort)

  return lines.join("\n")
}

export function countLines(text: string): number {
  if (text === "") return 0
  return splitLines(text).length
}
