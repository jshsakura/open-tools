// Robust HTML → JSX converter.
//
// The previous implementation used several independent regex passes which broke
// on attributeless tags, already self-closed tags, comments and multi-root
// documents. This version tokenizes the input into tags / comments / text and
// rebuilds each piece, so the transforms compose correctly.

export interface HtmlToJsxOptions {
  // Wrap the result in `export function Component() { return (...) }`.
  wrapComponent?: boolean
  // Component name used when wrapComponent is enabled.
  componentName?: string
}

const DEFAULT_COMPONENT_NAME = "Component"

// Void elements that must be self-closed in JSX.
const VOID_ELEMENTS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
])

// HTML attribute name → JSX attribute name. Kept lowercase for case-insensitive
// lookup. data-* / aria-* are intentionally absent: they pass through verbatim.
const ATTRIBUTE_NAME_MAP: Record<string, string> = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  readonly: "readOnly",
  maxlength: "maxLength",
  minlength: "minLength",
  colspan: "colSpan",
  rowspan: "rowSpan",
  autocomplete: "autoComplete",
  autofocus: "autoFocus",
  autoplay: "autoPlay",
  contenteditable: "contentEditable",
  spellcheck: "spellCheck",
  crossorigin: "crossOrigin",
  enctype: "encType",
  formaction: "formAction",
  formenctype: "formEncType",
  formmethod: "formMethod",
  formnovalidate: "formNoValidate",
  formtarget: "formTarget",
  novalidate: "noValidate",
  srcset: "srcSet",
  srcdoc: "srcDoc",
  usemap: "useMap",
  frameborder: "frameBorder",
  allowfullscreen: "allowFullScreen",
  accesskey: "accessKey",
  datetime: "dateTime",
  marginwidth: "marginWidth",
  marginheight: "marginHeight",
  cellpadding: "cellPadding",
  cellspacing: "cellSpacing",
  // Common inline event handlers.
  onclick: "onClick",
  ondblclick: "onDoubleClick",
  onchange: "onChange",
  oninput: "onInput",
  onsubmit: "onSubmit",
  onfocus: "onFocus",
  onblur: "onBlur",
  onkeydown: "onKeyDown",
  onkeyup: "onKeyUp",
  onkeypress: "onKeyPress",
  onmousedown: "onMouseDown",
  onmouseup: "onMouseUp",
  onmouseover: "onMouseOver",
  onmouseout: "onMouseOut",
  onmousemove: "onMouseMove",
  onload: "onLoad",
  onerror: "onError",
  onscroll: "onScroll",
}

interface ParsedAttribute {
  name: string
  // null means a boolean / valueless attribute (e.g. `disabled`).
  value: string | null
  quote: '"' | "'" | ""
}

function camelCaseStyleProp(prop: string): string {
  const trimmed = prop.trim()
  // CSS custom properties keep their literal name.
  if (trimmed.startsWith("--")) return trimmed
  // -webkit-foo → WebkitFoo, otherwise -foo → Foo.
  const camel = trimmed
    .toLowerCase()
    .replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
  return camel
}

// Convert an inline `style="..."` string into a JSX style object literal.
export function styleStringToObject(styleStr: string): string {
  const entries: string[] = []
  for (const declaration of styleStr.split(";")) {
    const colonIndex = declaration.indexOf(":")
    if (colonIndex === -1) continue
    const rawProp = declaration.slice(0, colonIndex)
    const rawVal = declaration.slice(colonIndex + 1).trim()
    if (!rawProp.trim() || !rawVal) continue
    const key = camelCaseStyleProp(rawProp)
    // Quote the key only when it is not a valid identifier (e.g. custom props).
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
    const safeVal = JSON.stringify(rawVal)
    entries.push(`${safeKey}: ${safeVal}`)
  }
  return `{{ ${entries.join(", ")} }}`
}

// Parse the raw attribute section of a tag into structured attributes.
function parseAttributes(raw: string): ParsedAttribute[] {
  const attrs: ParsedAttribute[] = []
  // name, optional (= value) where value is "...", '...' or bareword.
  const re = /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g
  let match: RegExpExecArray | null
  while ((match = re.exec(raw)) !== null) {
    const [, name, dq, sq, bare] = match
    if (!name) continue
    if (dq !== undefined) {
      attrs.push({ name, value: dq, quote: '"' })
    } else if (sq !== undefined) {
      attrs.push({ name, value: sq, quote: "'" })
    } else if (bare !== undefined) {
      attrs.push({ name, value: bare, quote: "" })
    } else {
      attrs.push({ name, value: null, quote: "" })
    }
  }
  return attrs
}

function mapAttributeName(name: string): string {
  // Preserve data-* / aria-* / namespaced attrs verbatim.
  if (/^(data|aria)-/i.test(name)) return name
  const mapped = ATTRIBUTE_NAME_MAP[name.toLowerCase()]
  return mapped ?? name
}

function renderAttribute(attr: ParsedAttribute): string {
  const name = mapAttributeName(attr.name)
  if (attr.value === null) {
    // Boolean attribute → bare JSX boolean (React reads it as `true`).
    return name
  }
  if (name.toLowerCase() === "style") {
    return `style=${styleStringToObject(attr.value)}`
  }
  // Escape any double quotes inside the value so the JSX stays valid.
  const escaped = attr.value.replace(/"/g, "&quot;")
  return `${name}="${escaped}"`
}

interface OpenTag {
  kind: "open"
  name: string
  attrs: ParsedAttribute[]
  selfClosed: boolean
}

interface CloseTag {
  kind: "close"
  name: string
}

interface CommentNode {
  kind: "comment"
  text: string
}

interface TextNode {
  kind: "text"
  text: string
}

type Token = OpenTag | CloseTag | CommentNode | TextNode

// Tokenize HTML into tags / comments / text so transforms compose safely.
function tokenize(html: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < html.length) {
    const lt = html.indexOf("<", i)
    if (lt === -1) {
      if (i < html.length) tokens.push({ kind: "text", text: html.slice(i) })
      break
    }
    if (lt > i) {
      tokens.push({ kind: "text", text: html.slice(i, lt) })
    }
    // Comment.
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt + 4)
      const close = end === -1 ? html.length : end + 3
      const inner = html.slice(lt + 4, end === -1 ? html.length : end)
      tokens.push({ kind: "comment", text: inner })
      i = close
      continue
    }
    // Doctype / processing instruction → drop it.
    if (html.startsWith("<!", lt) || html.startsWith("<?", lt)) {
      const end = html.indexOf(">", lt)
      i = end === -1 ? html.length : end + 1
      continue
    }
    const gt = html.indexOf(">", lt)
    if (gt === -1) {
      // Unterminated tag → treat the remainder as text.
      tokens.push({ kind: "text", text: html.slice(lt) })
      break
    }
    const rawTag = html.slice(lt + 1, gt)
    if (rawTag.startsWith("/")) {
      tokens.push({ kind: "close", name: rawTag.slice(1).trim().toLowerCase() })
    } else {
      const selfClosed = rawTag.endsWith("/")
      const body = selfClosed ? rawTag.slice(0, -1) : rawTag
      const nameMatch = body.match(/^\s*([a-zA-Z][\w:-]*)/)
      const name = nameMatch ? nameMatch[1] : body.trim()
      const attrRaw = nameMatch ? body.slice(nameMatch[0].length) : ""
      tokens.push({
        kind: "open",
        name,
        attrs: parseAttributes(attrRaw),
        selfClosed,
      })
    }
    i = gt + 1
  }
  return tokens
}

function renderToken(token: Token): string {
  switch (token.kind) {
    case "text":
      return token.text
    case "comment": {
      const trimmed = token.text.trim()
      return trimmed ? `{/* ${trimmed} */}` : "{/* */}"
    }
    case "close":
      return `</${token.name}>`
    case "open": {
      const attrs = token.attrs.map(renderAttribute)
      const attrStr = attrs.length ? " " + attrs.join(" ") : ""
      const isVoid = VOID_ELEMENTS.has(token.name.toLowerCase())
      if (token.selfClosed || isVoid) {
        return `<${token.name}${attrStr} />`
      }
      return `<${token.name}${attrStr}>`
    }
  }
}

// Count how many element nodes sit at the document root (top level). Used to
// decide whether the output needs a fragment wrapper.
function countRootElements(tokens: Token[]): number {
  let depth = 0
  let rootElements = 0
  for (const token of tokens) {
    if (token.kind === "open") {
      const isVoid = VOID_ELEMENTS.has(token.name.toLowerCase())
      const selfContained = token.selfClosed || isVoid
      if (depth === 0) rootElements += 1
      if (!selfContained) depth += 1
    } else if (token.kind === "close") {
      if (depth > 0) depth -= 1
    }
  }
  return rootElements
}

function indentLines(code: string, indent: string): string {
  return code
    .split("\n")
    .map((line) => (line.length ? indent + line : line))
    .join("\n")
}

/**
 * Convert an HTML string into JSX.
 *
 * @throws {Error} when the input is empty.
 */
export function htmlToJsx(html: string, opts: HtmlToJsxOptions = {}): string {
  if (typeof html !== "string") {
    throw new Error("Input must be a string")
  }
  const trimmed = html.trim()
  if (!trimmed) {
    throw new Error("Input is empty")
  }

  const tokens = tokenize(trimmed)
  let body = tokens.map(renderToken).join("")

  // Collapse any run of 3+ blank lines left behind by removed nodes.
  body = body.replace(/\n{3,}/g, "\n\n").trim()

  const rootElements = countRootElements(tokens)
  if (rootElements > 1) {
    body = `<>\n${indentLines(body, "  ")}\n</>`
  }

  if (opts.wrapComponent) {
    const name = (opts.componentName || DEFAULT_COMPONENT_NAME).trim() || DEFAULT_COMPONENT_NAME
    const inner = indentLines(body, "    ")
    return `export function ${name}() {\n  return (\n${inner}\n  )\n}`
  }

  return body
}
