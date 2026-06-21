export interface Heading {
  level: number
  text: string
}

export interface TocOptions {
  minDepth: number
  maxDepth: number
  ordered: boolean
  wrapInMarkers: boolean
}

export const DEFAULT_TOC_OPTIONS: TocOptions = {
  minDepth: 1,
  maxDepth: 6,
  ordered: false,
  wrapInMarkers: false,
}

export const HEADING_DEPTH_MIN = 1
export const HEADING_DEPTH_MAX = 6
export const TOC_MARKER_START = "<!-- TOC -->"
export const TOC_MARKER_END = "<!-- /TOC -->"

const ATX_HEADING = /^(#{1,6})\s+(.+?)\s*#*\s*$/
const FENCE = /^\s*(`{3,}|~{3,})/

/**
 * Extracts ATX headings (# .. ######) from Markdown, skipping any heading
 * that appears inside a fenced code block (``` or ~~~).
 */
export function extractHeadings(markdown: string): Heading[] {
  const lines = markdown.split(/\r?\n/)
  const headings: Heading[] = []
  let fenceMarker: string | null = null

  for (const line of lines) {
    const fence = line.match(FENCE)
    if (fence) {
      const marker = fence[1][0]
      if (fenceMarker === null) {
        fenceMarker = marker
      } else if (fenceMarker === marker) {
        fenceMarker = null
      }
      continue
    }
    if (fenceMarker !== null) continue

    const match = line.match(ATX_HEADING)
    if (!match) continue

    const text = match[2].trim()
    if (!text) continue
    headings.push({ level: match[1].length, text })
  }

  return headings
}

/**
 * Converts heading text into a GitHub-style anchor slug:
 * lowercase, strip markdown/punctuation, spaces -> hyphens.
 */
export function slugifyAnchor(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[^\p{L}\p{N} \-]/gu, "")
    .replace(/ /g, "-")
}

function disambiguate(slug: string, seen: Map<string, number>): string {
  const count = seen.get(slug) ?? 0
  seen.set(slug, count + 1)
  return count === 0 ? slug : `${slug}-${count}`
}

function clampDepth(value: number): number {
  if (value < HEADING_DEPTH_MIN) return HEADING_DEPTH_MIN
  if (value > HEADING_DEPTH_MAX) return HEADING_DEPTH_MAX
  return value
}

/**
 * Builds a nested Markdown table of contents from the supplied Markdown source.
 */
export function generateToc(markdown: string, options: TocOptions): string {
  const minDepth = clampDepth(options.minDepth)
  const maxDepth = clampDepth(options.maxDepth)
  const lo = Math.min(minDepth, maxDepth)
  const hi = Math.max(minDepth, maxDepth)

  const headings = extractHeadings(markdown).filter(
    (heading) => heading.level >= lo && heading.level <= hi,
  )

  if (headings.length === 0) return ""

  const baseLevel = Math.min(...headings.map((heading) => heading.level))
  const seen = new Map<string, number>()
  const counters = new Map<number, number>()

  const lines = headings.map((heading) => {
    const depth = heading.level - baseLevel
    const indent = "  ".repeat(depth)
    const anchor = disambiguate(slugifyAnchor(heading.text), seen)
    let marker: string
    if (options.ordered) {
      const next = (counters.get(depth) ?? 0) + 1
      counters.set(depth, next)
      for (const key of Array.from(counters.keys())) {
        if (key > depth) counters.delete(key)
      }
      marker = `${next}.`
    } else {
      marker = "-"
    }
    return `${indent}${marker} [${heading.text}](#${anchor})`
  })

  const toc = lines.join("\n")
  if (!options.wrapInMarkers) return toc
  return `${TOC_MARKER_START}\n${toc}\n${TOC_MARKER_END}`
}
