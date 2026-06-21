export type UrlParts = {
  protocol: string
  username: string
  password: string
  host: string
  hostname: string
  port: string
  pathname: string
  hash: string
  origin: string
}

export type QueryParam = {
  key: string
  value: string
}

export type ParseUrlResult = {
  valid: boolean
  parts: UrlParts | null
  params: QueryParam[]
}

const EMPTY_RESULT: ParseUrlResult = {
  valid: false,
  parts: null,
  params: [],
}

/**
 * Parse a URL string into labeled components plus its decoded query params.
 * Returns { valid: false } for anything the URL constructor rejects, so the
 * caller can show an inline error rather than throwing.
 */
export function parseUrl(str: string): ParseUrlResult {
  if (!str || !str.trim()) return EMPTY_RESULT

  let url: URL
  try {
    url = new URL(str)
  } catch {
    return EMPTY_RESULT
  }

  const parts: UrlParts = {
    // Drop the trailing colon the URL API keeps on protocol (e.g. "https:").
    protocol: url.protocol.replace(/:$/, ""),
    username: url.username,
    password: url.password,
    host: url.host,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    // Drop the leading "#" for a cleaner display.
    hash: url.hash.replace(/^#/, ""),
    origin: url.origin,
  }

  const params: QueryParam[] = []
  // searchParams already returns decoded values.
  url.searchParams.forEach((value, key) => {
    params.push({ key, value })
  })

  return { valid: true, parts, params }
}
