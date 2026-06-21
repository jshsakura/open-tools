// ─── JSONPath finder (pure TypeScript, no external libraries) ────────────────
//
// Supports a practical JSONPath subset:
//   $              root
//   .key           member access (dot notation)
//   ['key']        member access (bracket / quoted notation)
//   [index]        array index (e.g. [0])
//   [-1]           negative array index (from the end)
//   [*]  / .*      wildcard (all children of an object or array)
//   ..key          recursive descent (find `key` at any depth)
//   ..*            recursive wildcard (every descendant value)
//   [start:end]    array slice (Python-style, end exclusive)

export type JsonValue =
  | null
  | boolean
  | number
  | string
  | JsonValue[]
  | { [key: string]: JsonValue }

export interface JsonPathMatch {
  /** Concrete normalized path, e.g. `$['store']['book'][0]['title']`. */
  path: string
  value: unknown
}

// ─── Token model ─────────────────────────────────────────────────────────────

type Token =
  | { kind: "key"; key: string }
  | { kind: "index"; index: number }
  | { kind: "wildcard" }
  | { kind: "recursiveKey"; key: string }
  | { kind: "recursiveWildcard" }
  | { kind: "slice"; start: number | null; end: number | null }

// ─── Tokenizer ───────────────────────────────────────────────────────────────

const IDENT = /[A-Za-z0-9_$\-]/

function fail(message: string): never {
  throw new Error(message)
}

/**
 * Parse a JSONPath query string into an ordered list of tokens.
 * Throws an Error with a descriptive message on invalid syntax.
 */
export function tokenizeJsonPath(rawPath: string): Token[] {
  const path = rawPath.trim()
  if (path === "") fail("Path is empty")
  if (path[0] !== "$") fail("Path must start with '$'")

  const tokens: Token[] = []
  let i = 1 // skip leading '$'

  while (i < path.length) {
    const ch = path[i]

    // Recursive descent: `..`
    if (ch === "." && path[i + 1] === ".") {
      i += 2
      if (path[i] === "*") {
        tokens.push({ kind: "recursiveWildcard" })
        i += 1
        continue
      }
      if (path[i] === "[") {
        // `..['key']` or `..[index]` — descend then apply the bracket token.
        // We model `..key` directly; for `..[...]` we emit recursiveWildcard
        // followed by the bracket token so it filters every descendant.
        tokens.push({ kind: "recursiveWildcard" })
        i = readBracket(path, i, tokens)
        continue
      }
      const start = i
      while (i < path.length && IDENT.test(path[i])) i += 1
      if (i === start) fail("Expected a key after '..'")
      tokens.push({ kind: "recursiveKey", key: path.slice(start, i) })
      continue
    }

    // Dot member access: `.key` or `.*`
    if (ch === ".") {
      i += 1
      if (path[i] === "*") {
        tokens.push({ kind: "wildcard" })
        i += 1
        continue
      }
      const start = i
      while (i < path.length && IDENT.test(path[i])) i += 1
      if (i === start) fail("Expected a key after '.'")
      tokens.push({ kind: "key", key: path.slice(start, i) })
      continue
    }

    // Bracket access: `[...]`
    if (ch === "[") {
      i = readBracket(path, i, tokens)
      continue
    }

    fail(`Unexpected character '${ch}' at position ${i}`)
  }

  if (tokens.length === 0) {
    // Bare `$` — selects the root itself.
  }

  return tokens
}

/**
 * Read a single bracket expression starting at index `open` (`path[open] === '['`).
 * Pushes the resulting token and returns the index just past the closing `]`.
 */
function readBracket(path: string, open: number, tokens: Token[]): number {
  const close = path.indexOf("]", open)
  if (close === -1) fail("Unclosed '[' in path")
  const inner = path.slice(open + 1, close).trim()

  if (inner === "*") {
    tokens.push({ kind: "wildcard" })
    return close + 1
  }

  // Quoted key: ['key'] or ["key"]
  const quote = inner[0]
  if (quote === "'" || quote === '"') {
    if (inner[inner.length - 1] !== quote) fail("Mismatched quotes in bracket key")
    const key = inner.slice(1, -1)
    tokens.push({ kind: "key", key })
    return close + 1
  }

  // Slice: [start:end]
  if (inner.includes(":")) {
    const [rawStart, rawEnd, extra] = inner.split(":")
    if (extra !== undefined) fail("Step slices (start:end:step) are not supported")
    const start = rawStart.trim() === "" ? null : parseIntStrict(rawStart, "slice start")
    const end = rawEnd.trim() === "" ? null : parseIntStrict(rawEnd, "slice end")
    tokens.push({ kind: "slice", start, end })
    return close + 1
  }

  // Numeric index (supports negative)
  if (/^-?\d+$/.test(inner)) {
    tokens.push({ kind: "index", index: Number(inner) })
    return close + 1
  }

  fail(`Invalid bracket expression '[${inner}]'`)
}

function parseIntStrict(raw: string, label: string): number {
  const trimmed = raw.trim()
  if (!/^-?\d+$/.test(trimmed)) fail(`Invalid ${label}: '${trimmed}'`)
  return Number(trimmed)
}

// ─── Path formatting ─────────────────────────────────────────────────────────

const SAFE_KEY = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function appendKey(base: string, key: string): string {
  if (SAFE_KEY.test(key)) return `${base}.${key}`
  return `${base}['${key.replace(/'/g, "\\'")}']`
}

function appendIndex(base: string, index: number): string {
  return `${base}[${index}]`
}

// ─── Evaluator ───────────────────────────────────────────────────────────────

interface Frame {
  path: string
  value: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function childrenOf(frame: Frame): Frame[] {
  const { value, path } = frame
  if (Array.isArray(value)) {
    return value.map((item, idx) => ({ path: appendIndex(path, idx), value: item }))
  }
  if (isPlainObject(value)) {
    return Object.keys(value).map((key) => ({
      path: appendKey(path, key),
      value: value[key],
    }))
  }
  return []
}

/** Collect a frame and every descendant frame (recursive descent base set). */
function descend(frame: Frame, acc: Frame[]): void {
  acc.push(frame)
  for (const child of childrenOf(frame)) descend(child, acc)
}

function applyToken(frames: Frame[], token: Token): Frame[] {
  switch (token.kind) {
    case "key":
      return frames.flatMap((frame) =>
        isPlainObject(frame.value) && token.key in frame.value
          ? [{ path: appendKey(frame.path, token.key), value: frame.value[token.key] }]
          : [],
      )

    case "index":
      return frames.flatMap((frame) => {
        if (!Array.isArray(frame.value)) return []
        const len = frame.value.length
        const idx = token.index < 0 ? len + token.index : token.index
        if (idx < 0 || idx >= len) return []
        return [{ path: appendIndex(frame.path, idx), value: frame.value[idx] }]
      })

    case "wildcard":
      return frames.flatMap((frame) => childrenOf(frame))

    case "slice":
      return frames.flatMap((frame) => {
        if (!Array.isArray(frame.value)) return []
        const len = frame.value.length
        const start = normalizeSliceBound(token.start, 0, len)
        const end = normalizeSliceBound(token.end, len, len)
        const out: Frame[] = []
        for (let idx = start; idx < end; idx += 1) {
          out.push({ path: appendIndex(frame.path, idx), value: frame.value[idx] })
        }
        return out
      })

    case "recursiveKey":
      return frames.flatMap((frame) => {
        const all: Frame[] = []
        descend(frame, all)
        return all.flatMap((f) =>
          isPlainObject(f.value) && token.key in f.value
            ? [{ path: appendKey(f.path, token.key), value: f.value[token.key] }]
            : [],
        )
      })

    case "recursiveWildcard":
      return frames.flatMap((frame) => {
        const all: Frame[] = []
        descend(frame, all)
        // Exclude the source frame itself; recursive wildcard yields descendants.
        return all.slice(1)
      })
  }
}

function normalizeSliceBound(bound: number | null, fallback: number, len: number): number {
  if (bound === null) return fallback
  const resolved = bound < 0 ? len + bound : bound
  if (resolved < 0) return 0
  if (resolved > len) return len
  return resolved
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Evaluate a JSONPath query against parsed JSON `data`.
 * Returns every match as `{ path, value }` in document order.
 * Throws an Error (descriptive message) when the path syntax is invalid.
 */
export function queryJsonPath(data: unknown, path: string): JsonPathMatch[] {
  const tokens = tokenizeJsonPath(path)
  let frames: Frame[] = [{ path: "$", value: data }]
  for (const token of tokens) {
    frames = applyToken(frames, token)
  }
  return frames.map((frame) => ({ path: frame.path, value: frame.value }))
}
