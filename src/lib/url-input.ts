const URL_PATTERN = /https?:\/\/[^\s<>"']+/i
const DOMAIN_PATTERN = /(?:^|\s)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+)(?::\d+)?(?:\/|$)/i

function trimTrailingUrlPunctuation(value: string): string {
  return value.replace(/[.,!?;:]+$/u, "").replace(/\)+$/u, "")
}

export function extractFirstUrl(value: string): string | null {
  const match = value.match(URL_PATTERN)
  if (!match) {
    return null
  }

  return trimTrailingUrlPunctuation(match[0])
}

export function extractUrlishInput(value: string): string {
  const trimmed = value.trim()
  return extractFirstUrl(trimmed) ?? trimmed
}

export function extractDomainInput(value: string): string {
  const urlCandidate = extractFirstUrl(value)

  if (urlCandidate) {
    try {
      return new URL(urlCandidate).hostname
    } catch {
      return urlCandidate
    }
  }

  const trimmed = value.trim()
  const domainMatch = trimmed.match(DOMAIN_PATTERN)
  return domainMatch?.[1] ?? trimmed
}
