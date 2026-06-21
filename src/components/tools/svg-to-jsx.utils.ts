// SVG → JSX converter helpers, extracted so the conversion is unit-testable
// and the React component can convert live on every keystroke.

export interface SvgToJsxOptions {
  componentName?: string
  // Emit a typed React.FC component instead of a plain JS function.
  typescript?: boolean
  // Spread `{...props}` onto the root <svg> element.
  spreadProps?: boolean
}

const DEFAULT_COMPONENT_NAME = "SvgIcon"

// SVG / HTML attribute name → React (camelCase) attribute name.
export const SVG_ATTRIBUTE_MAP: Record<string, string> = {
  "accent-height": "accentHeight",
  "alignment-baseline": "alignmentBaseline",
  "arabic-form": "arabicForm",
  "baseline-shift": "baselineShift",
  "cap-height": "capHeight",
  "clip-path": "clipPath",
  "clip-rule": "clipRule",
  "color-interpolation": "colorInterpolation",
  "color-interpolation-filters": "colorInterpolationFilters",
  "color-profile": "colorProfile",
  "color-rendering": "colorRendering",
  "dominant-baseline": "dominantBaseline",
  "enable-background": "enableBackground",
  "fill-opacity": "fillOpacity",
  "fill-rule": "fillRule",
  "flood-color": "floodColor",
  "flood-opacity": "floodOpacity",
  "font-family": "fontFamily",
  "font-size": "fontSize",
  "font-size-adjust": "fontSizeAdjust",
  "font-stretch": "fontStretch",
  "font-style": "fontStyle",
  "font-variant": "fontVariant",
  "font-weight": "fontWeight",
  "glyph-name": "glyphName",
  "glyph-orientation-horizontal": "glyphOrientationHorizontal",
  "glyph-orientation-vertical": "glyphOrientationVertical",
  "horiz-adv-x": "horizAdvX",
  "horiz-origin-x": "horizOriginX",
  "image-rendering": "imageRendering",
  "letter-spacing": "letterSpacing",
  "lighting-color": "lightingColor",
  "marker-end": "markerEnd",
  "marker-mid": "markerMid",
  "marker-start": "markerStart",
  "overline-position": "overlinePosition",
  "overline-thickness": "overlineThickness",
  "paint-order": "paintOrder",
  "panose-1": "panose1",
  "pointer-events": "pointerEvents",
  "rendering-intent": "renderingIntent",
  "shape-rendering": "shapeRendering",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "strikethrough-position": "strikethroughPosition",
  "strikethrough-thickness": "strikethroughThickness",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-miterlimit": "strokeMiterlimit",
  "stroke-opacity": "strokeOpacity",
  "stroke-width": "strokeWidth",
  "text-anchor": "textAnchor",
  "text-decoration": "textDecoration",
  "text-rendering": "textRendering",
  "underline-position": "underlinePosition",
  "underline-thickness": "underlineThickness",
  "unicode-bidi": "unicodeBidi",
  "unicode-range": "unicodeRange",
  "units-per-em": "unitsPerEm",
  "v-alphabetic": "vAlphabetic",
  "v-hanging": "vHanging",
  "v-ideographic": "vIdeographic",
  "v-mathematical": "vMathematical",
  "vector-effect": "vectorEffect",
  "vert-adv-y": "vertAdvY",
  "vert-origin-x": "vertOriginX",
  "vert-origin-y": "vertOriginY",
  "word-spacing": "wordSpacing",
  "writing-mode": "writingMode",
  "x-height": "xHeight",
  "xlink:actuate": "xlinkActuate",
  "xlink:arcrole": "xlinkArcrole",
  "xlink:href": "xlinkHref",
  "xlink:role": "xlinkRole",
  "xlink:show": "xlinkShow",
  "xlink:title": "xlinkTitle",
  "xlink:type": "xlinkType",
  "xml:base": "xmlBase",
  "xml:lang": "xmlLang",
  "xml:space": "xmlSpace",
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
}

function camelCaseStyleProp(prop: string): string {
  const trimmed = prop.trim()
  if (trimmed.startsWith("--")) return trimmed
  return trimmed.toLowerCase().replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase())
}

// Convert an inline `style="..."` string into a JSX style object literal.
export function svgStyleStringToObject(styleStr: string): string {
  const entries: string[] = []
  for (const declaration of styleStr.split(";")) {
    const colonIndex = declaration.indexOf(":")
    if (colonIndex === -1) continue
    const rawProp = declaration.slice(0, colonIndex)
    const rawVal = declaration.slice(colonIndex + 1).trim()
    if (!rawProp.trim() || !rawVal) continue
    const key = camelCaseStyleProp(rawProp)
    const safeKey = /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key)
    entries.push(`${safeKey}: ${JSON.stringify(rawVal)}`)
  }
  return `{{ ${entries.join(", ")} }}`
}

// Apply attribute-name and style conversions across the whole SVG string.
export function convertSvgAttributes(svg: string): string {
  let result = svg

  // Style strings first so the `style` key itself is then left alone.
  result = result.replace(/style="([^"]*)"/g, (_m, styleStr: string) => {
    return `style=${svgStyleStringToObject(styleStr)}`
  })

  // Attribute names. Sorting by length (desc) avoids a short key (e.g. `class`)
  // partially matching inside a longer one.
  const names = Object.keys(SVG_ATTRIBUTE_MAP).sort((a, b) => b.length - a.length)
  for (const name of names) {
    // Escape regex-special characters in the source attribute name.
    const escaped = name.replace(/[.*+?^${}()|[\]\\:-]/g, "\\$&")
    const regex = new RegExp(`(\\s)${escaped}=`, "g")
    result = result.replace(regex, `$1${SVG_ATTRIBUTE_MAP[name]}=`)
  }

  return result
}

// Inject `{...props}` into the opening <svg ...> tag exactly once.
function injectPropsSpread(svg: string): string {
  return svg.replace(/<svg\b([^>]*?)(\/?>)/i, (_m, attrs: string, close: string) => {
    const trimmed = attrs.replace(/\s+$/, "")
    return `<svg${trimmed} {...props}${close}`
  })
}

/**
 * Convert raw SVG markup into a React component.
 *
 * @throws {Error} when the input is empty or contains no <svg> element.
 */
export function svgToJsx(svg: string, opts: SvgToJsxOptions = {}): string {
  if (typeof svg !== "string") {
    throw new Error("Input must be a string")
  }
  let body = svg.trim()
  if (!body) {
    throw new Error("Input is empty")
  }

  // Strip XML prolog and comments.
  body = body.replace(/<\?xml[\s\S]*?\?>/gi, "")
  body = body.replace(/<!--[\s\S]*?-->/g, "")
  body = body.trim()

  if (!/<svg[\s>]/i.test(body)) {
    throw new Error("No <svg> element found")
  }

  body = convertSvgAttributes(body)

  const spreadProps = opts.spreadProps !== false
  if (spreadProps) {
    body = injectPropsSpread(body)
  }

  const name = (opts.componentName || DEFAULT_COMPONENT_NAME).trim() || DEFAULT_COMPONENT_NAME
  const indented = body
    .split("\n")
    .map((line) => (line.length ? "    " + line : line))
    .join("\n")
    .trim()

  if (opts.typescript) {
    const propsParam = spreadProps ? "props" : "_props"
    return [
      "import * as React from \"react\"",
      "",
      `const ${name}: React.FC<React.SVGProps<SVGSVGElement>> = (${propsParam}) => (`,
      `  ${indented}`,
      ")",
      "",
      `export default ${name}`,
    ].join("\n")
  }

  const propsParam = spreadProps ? "props" : ""
  return `export default function ${name}(${propsParam}) {\n  return (\n    ${indented}\n  )\n}`
}
