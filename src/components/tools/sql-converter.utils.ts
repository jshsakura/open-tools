// Parser for SQL INSERT statements.
//
// A naive `split(/\),\s*\(/)` + comma-split breaks the moment a string value
// contains a `)`, `,` or a quote. This module instead uses a character scanner
// that understands single-quoted SQL strings (including `''` escaped quotes),
// so values such as 'Doe, John (Jr.)' survive intact.

export type SqlValue = string | number | null

export interface ParsedInsert {
  columns: string[]
  rows: SqlValue[][]
}

const INSERT_RE = /INSERT\s+INTO\s+[`"']?\w+[`"']?\s*(?:\(([^)]*)\))?\s*VALUES\s*/i

/**
 * Coerce a raw token (already stripped of surrounding whitespace) into a JS
 * value. Quoted tokens stay strings, NULL becomes null, numerics become
 * numbers, everything else stays a string.
 */
function coerceValue(raw: string, wasQuoted: boolean): SqlValue {
  if (wasQuoted) return raw
  const trimmed = raw.trim()
  if (trimmed === "") return null
  if (/^null$/i.test(trimmed)) return null
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed)
  // Unquoted, non-numeric token (e.g. TRUE, a bareword) — keep as string.
  return trimmed
}

/**
 * Scan a single `(...)` tuple body and return its values, honoring single
 * quotes and `''` escapes. `body` is the content between the outer parens.
 */
function parseTuple(body: string): SqlValue[] {
  const values: SqlValue[] = []
  let current = ""
  let inString = false
  let tokenQuoted = false

  for (let i = 0; i < body.length; i++) {
    const ch = body[i]

    if (inString) {
      if (ch === "'") {
        // Escaped quote: '' inside a string -> literal single quote.
        if (body[i + 1] === "'") {
          current += "'"
          i++
          continue
        }
        inString = false
        continue
      }
      current += ch
      continue
    }

    if (ch === "'" && current.trim() === "") {
      // Opening quote of a fresh token: drop any leading whitespace so the
      // string value is captured exactly.
      inString = true
      tokenQuoted = true
      current = ""
      continue
    }

    if (ch === ",") {
      values.push(coerceValue(current, tokenQuoted))
      current = ""
      tokenQuoted = false
      continue
    }

    current += ch
  }

  values.push(coerceValue(current, tokenQuoted))
  return values
}

/**
 * Walk the VALUES clause character by character and extract each top-level
 * `(...)` tuple. Parens inside quoted strings are ignored.
 */
function extractTuples(valuesClause: string): string[] {
  const tuples: string[] = []
  let depth = 0
  let inString = false
  let current = ""

  for (let i = 0; i < valuesClause.length; i++) {
    const ch = valuesClause[i]

    if (inString) {
      current += ch
      if (ch === "'") {
        if (valuesClause[i + 1] === "'") {
          current += "'"
          i++
          continue
        }
        inString = false
      }
      continue
    }

    if (ch === "'") {
      inString = true
      current += ch
      continue
    }

    if (ch === "(") {
      depth++
      if (depth === 1) {
        current = ""
        continue
      }
    }

    if (ch === ")") {
      depth--
      if (depth === 0) {
        tuples.push(current)
        current = ""
        continue
      }
    }

    if (depth > 0) current += ch
    // Top-level commas/semicolons between tuples are ignored.
  }

  return tuples
}

/**
 * Parse one or more `INSERT INTO ... VALUES (...), (...);` statements.
 *
 * Throws when no INSERT statement can be found. Multiple statements are
 * supported as long as they share the same column list (rows are concatenated).
 */
export function parseInsert(sql: string): ParsedInsert {
  const statements = splitStatements(sql)
  let columns: string[] = []
  const rows: SqlValue[][] = []

  for (const stmt of statements) {
    const match = stmt.match(INSERT_RE)
    if (!match) continue

    const stmtColumns = match[1]
      ? match[1]
          .split(",")
          .map((c) => c.trim().replace(/^[`"']|[`"']$/g, ""))
      : []

    if (stmtColumns.length > 0) columns = stmtColumns

    const valuesClause = stmt.slice(match.index! + match[0].length)
    for (const tuple of extractTuples(valuesClause)) {
      rows.push(parseTuple(tuple))
    }
  }

  if (rows.length === 0) {
    throw new Error("Could not parse SQL INSERT statement.")
  }

  return { columns, rows }
}

/**
 * Split a SQL blob into individual statements on top-level semicolons,
 * ignoring semicolons inside single-quoted strings.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ""
  let inString = false

  for (let i = 0; i < sql.length; i++) {
    const ch = sql[i]

    if (inString) {
      current += ch
      if (ch === "'") {
        if (sql[i + 1] === "'") {
          current += "'"
          i++
          continue
        }
        inString = false
      }
      continue
    }

    if (ch === "'") {
      inString = true
      current += ch
      continue
    }

    if (ch === ";") {
      if (current.trim()) statements.push(current)
      current = ""
      continue
    }

    current += ch
  }

  if (current.trim()) statements.push(current)
  return statements
}

/**
 * Convert a ParsedInsert into an array of records. When column names are known,
 * each row becomes an object keyed by column; otherwise rows are returned as
 * positional arrays.
 */
export function toRecords(parsed: ParsedInsert): Array<Record<string, SqlValue> | SqlValue[]> {
  const { columns, rows } = parsed
  return rows.map((values) => {
    if (columns.length > 0 && values.length === columns.length) {
      return columns.reduce<Record<string, SqlValue>>((acc, col, idx) => {
        acc[col] = values[idx]
        return acc
      }, {})
    }
    return values
  })
}
