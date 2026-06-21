export interface OgInput {
  title: string
  description: string
  image: string
  url: string
  type: string
}

// Platform-specific character limits for title / description truncation.
export const PLATFORM_LIMITS = {
  facebook: { title: 100, description: 200 },
  twitter: { title: 70, description: 200 },
  linkedin: { title: 120, description: 200 },
  discord: { title: 100, description: 200 },
  slack: { title: 100, description: 200 },
} as const

const ELLIPSIS = "…"

/**
 * Truncate text to a maximum length, appending an ellipsis when shortened.
 * Pure: never mutates its input.
 */
export function truncate(text: string, max: number): string {
  if (max <= 0) return ""
  if (text.length <= max) return text
  if (max <= ELLIPSIS.length) return text.slice(0, max)
  return text.slice(0, max - ELLIPSIS.length).trimEnd() + ELLIPSIS
}

/**
 * Extract a bare hostname (lowercased, without `www.`) from a URL string.
 * Falls back to a best-effort parse for inputs lacking a protocol.
 */
export function extractDomain(url: string): string {
  const trimmed = url.trim()
  if (!trimmed) return ""

  const withProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)
    ? trimmed
    : `https://${trimmed}`

  try {
    const host = new URL(withProtocol).hostname.toLowerCase()
    return host.replace(/^www\./, "")
  } catch {
    // Best-effort fallback: strip protocol, path, query, and `www.`.
    const fallback = trimmed
      .replace(/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .toLowerCase()
      .replace(/^www\./, "")
    return fallback
  }
}

/** Escape characters that would be unsafe inside an HTML attribute value. */
export function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * Build the Open Graph + Twitter Card meta tag block for the given input.
 * Only non-empty fields produce tags. Output is a newline-joined string.
 */
export function buildMetaTags(input: OgInput): string {
  const { title, description, image, url, type } = input
  const lines: string[] = []

  // Open Graph
  if (title) lines.push(`<meta property="og:title" content="${escapeAttr(title)}" />`)
  if (description) lines.push(`<meta property="og:description" content="${escapeAttr(description)}" />`)
  if (image) lines.push(`<meta property="og:image" content="${escapeAttr(image)}" />`)
  if (url) lines.push(`<meta property="og:url" content="${escapeAttr(url)}" />`)
  if (type) lines.push(`<meta property="og:type" content="${escapeAttr(type)}" />`)
  const siteName = extractDomain(url)
  if (siteName) lines.push(`<meta property="og:site_name" content="${escapeAttr(siteName)}" />`)

  // Twitter Card
  lines.push(`<meta name="twitter:card" content="summary_large_image" />`)
  if (title) lines.push(`<meta name="twitter:title" content="${escapeAttr(title)}" />`)
  if (description) lines.push(`<meta name="twitter:description" content="${escapeAttr(description)}" />`)
  if (image) lines.push(`<meta name="twitter:image" content="${escapeAttr(image)}" />`)

  return lines.join("\n")
}
