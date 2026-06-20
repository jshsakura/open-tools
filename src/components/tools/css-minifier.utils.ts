// CSS minify / beautify helpers.
//
// The core trick: before collapsing whitespace we swap out anything whose
// internal content must NOT be touched (string literals, url()/data-URIs) with
// opaque placeholders, run the transforms, then restore them. Comments are
// stripped entirely (they carry no placeholder).
//
// Placeholders use only letters/digits so whitespace-collapsing and the
// delimiter regex (which only touches {}:;,>~+ and surrounding spaces) leave
// them intact.

const PLACEHOLDER_PREFIX = "CSSTOKEN"
const PLACEHOLDER_SUFFIX = "ENDTOKEN"

interface Protected {
  text: string
  tokens: string[]
}

const placeholderFor = (index: number): string =>
  `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`

// Replace string literals ('...' / "...") and url(...) blocks with placeholders.
// Comments are removed in this same pass so they cannot be misinterpreted.
function protect(css: string): Protected {
  const tokens: string[] = []
  let result = ""
  let i = 0

  const pushToken = (value: string): string => {
    const index = tokens.length
    tokens.push(value)
    return placeholderFor(index)
  }

  while (i < css.length) {
    const char = css[i]
    const next = css[i + 1]

    // Block comment: drop it.
    if (char === "/" && next === "*") {
      const end = css.indexOf("*/", i + 2)
      i = end === -1 ? css.length : end + 2
      continue
    }

    // String literal.
    if (char === '"' || char === "'") {
      const quote = char
      let j = i + 1
      let literal = quote
      while (j < css.length) {
        literal += css[j]
        if (css[j] === "\\") {
          // Escaped char: take the next one verbatim.
          j++
          if (j < css.length) literal += css[j]
        } else if (css[j] === quote) {
          break
        }
        j++
      }
      result += pushToken(literal)
      i = j + 1
      continue
    }

    // url(...) — may contain an unquoted data-URI with characters we must keep.
    if ((char === "u" || char === "U") && /^url\(/i.test(css.slice(i, i + 4))) {
      const open = i + 3 // position of "("
      const end = css.indexOf(")", open + 1)
      if (end !== -1) {
        result += pushToken(css.slice(i, end + 1))
        i = end + 1
        continue
      }
    }

    result += char
    i++
  }

  return { text: result, tokens }
}

function restore(text: string, tokens: string[]): string {
  let result = text
  for (let index = 0; index < tokens.length; index++) {
    result = result.split(placeholderFor(index)).join(tokens[index])
  }
  return result
}

export function minifyCss(css: string): string {
  const { text, tokens } = protect(css)

  const minified = text
    .replace(/\s+/g, " ")
    .replace(/\s*([{}:;,>~+])\s*/g, "$1")
    .replace(/;}/g, "}")
    .trim()

  return restore(minified, tokens)
}

export function beautifyCss(css: string): string {
  const { text, tokens } = protect(css)

  // Normalize whitespace to a single line before re-indenting.
  const normalized = text
    .replace(/\s+/g, " ")
    .replace(/\s*([{};,])\s*/g, "$1")
    .trim()

  let output = ""
  let indent = 0
  const indentStr = "  "

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i]

    if (char === "{") {
      output = output.trimEnd()
      output += " {\n"
      indent++
      output += indentStr.repeat(indent)
    } else if (char === "}") {
      output = output.trimEnd()
      output += "\n"
      indent = Math.max(0, indent - 1)
      output += indentStr.repeat(indent) + "}\n"
      // Blank line between top-level rules.
      if (indent === 0) output += "\n"
      if (i + 1 < normalized.length && normalized[i + 1] !== "}") {
        output += indentStr.repeat(indent)
      }
    } else if (char === ";") {
      output += ";\n"
      if (i + 1 < normalized.length && normalized[i + 1] !== "}") {
        output += indentStr.repeat(indent)
      }
    } else {
      output += char
    }
  }

  const beautified = output.replace(/\n{3,}/g, "\n\n").trim() + "\n"
  return restore(beautified, tokens)
}
