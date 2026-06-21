import jsyaml from "js-yaml"

/**
 * Shared conversion options for both YAML tools.
 * - indent: number of spaces per nesting level in YAML output (2 or 4).
 * - sortKeys: alphabetically sort object keys in the output.
 * - flowLevel: nesting level beyond which js-yaml switches to flow style
 *   (-1 = always block style, the default).
 * - lineWidth: max line width before js-yaml wraps long scalars (-1 = no wrap).
 */
export interface YamlConvertOptions {
  indent?: number
  sortKeys?: boolean
  flowLevel?: number
  lineWidth?: number
}

const DEFAULT_INDENT = 2

/**
 * Convert a JSON string to a YAML string.
 * Throws when the input is not valid JSON.
 */
export function jsonToYaml(json: string, opts: YamlConvertOptions = {}): string {
  const parsed: unknown = JSON.parse(json)
  return jsyaml.dump(parsed, {
    indent: opts.indent ?? DEFAULT_INDENT,
    sortKeys: opts.sortKeys ?? false,
    flowLevel: opts.flowLevel ?? -1,
    lineWidth: opts.lineWidth ?? -1,
  })
}

/**
 * Convert a YAML string to a JSON string.
 * Throws when the input is not valid YAML.
 */
export function yamlToJson(yaml: string, opts: YamlConvertOptions = {}): string {
  const parsed: unknown = jsyaml.load(yaml)
  const replacer = opts.sortKeys ? sortReplacer : undefined
  return JSON.stringify(parsed, replacer, opts.indent ?? DEFAULT_INDENT)
}

/**
 * JSON.stringify replacer that emits object keys in alphabetical order.
 * Arrays and primitives are passed through untouched.
 */
function sortReplacer(_key: string, value: unknown): unknown {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = (value as Record<string, unknown>)[key]
        return acc
      }, {})
  }
  return value
}
