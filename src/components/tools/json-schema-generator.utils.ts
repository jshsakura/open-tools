export type JsonSchema = {
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  items?: JsonSchema
  format?: string
  enum?: unknown[]
}

export type SchemaDraft = "draft-07" | "2020-12"

export const DRAFT_META: Record<SchemaDraft, string> = {
  "draft-07": "http://json-schema.org/draft-07/schema#",
  "2020-12": "https://json-schema.org/draft/2020-12/schema",
}

// Cap enum inference to avoid turning high-cardinality fields into giant enums.
const MAX_ENUM_VALUES = 5
const MIN_ENUM_SAMPLES = 2

const DATE_TIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})?$/
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const URI_RE = /^https?:\/\/[^\s]+$/

export function inferStringFormat(value: string): string | undefined {
  if (DATE_TIME_RE.test(value)) return "date-time"
  if (DATE_RE.test(value)) return "date"
  if (EMAIL_RE.test(value)) return "email"
  if (URI_RE.test(value)) return "uri"
  return undefined
}

function inferScalar(value: unknown): JsonSchema {
  if (value === null) return { type: "null" }
  const valueType = typeof value
  if (valueType === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" }
  }
  if (valueType === "boolean") return { type: "boolean" }
  if (valueType === "string") {
    const format = inferStringFormat(value as string)
    return format ? { type: "string", format } : { type: "string" }
  }
  return { type: "string" }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

export function inferType(value: unknown): JsonSchema {
  if (Array.isArray(value)) {
    const schema: JsonSchema = { type: "array" }
    if (value.length > 0) {
      schema.items = mergeItems(value)
    }
    return schema
  }
  if (isPlainObject(value)) {
    return inferObject(value)
  }
  return inferScalar(value)
}

// Merge every element of an array into one item schema. Objects union their
// keys (keys missing from some elements drop out of `required`); scalars infer
// small enums where the cardinality is low.
export function mergeItems(items: unknown[]): JsonSchema {
  const allObjects = items.every((it) => isPlainObject(it))
  if (allObjects) {
    return mergeObjectSchemas(items as Record<string, unknown>[])
  }

  const allArrays = items.every((it) => Array.isArray(it))
  if (allArrays) {
    const inner = (items as unknown[][]).flat()
    const schema: JsonSchema = { type: "array" }
    if (inner.length > 0) schema.items = mergeItems(inner)
    return schema
  }

  return mergeScalarSchemas(items)
}

function mergeObjectSchemas(objects: Record<string, unknown>[]): JsonSchema {
  const properties: Record<string, JsonSchema> = {}
  const keyCounts: Record<string, number> = {}
  const valuesByKey: Record<string, unknown[]> = {}
  const orderedKeys: string[] = []

  objects.forEach((obj) => {
    Object.keys(obj).forEach((key) => {
      if (!(key in valuesByKey)) {
        valuesByKey[key] = []
        orderedKeys.push(key)
      }
      keyCounts[key] = (keyCounts[key] ?? 0) + 1
      valuesByKey[key].push(obj[key])
    })
  })

  orderedKeys.forEach((key) => {
    properties[key] = mergeItems(valuesByKey[key])
  })

  // A key is required only if present in every merged object.
  const required = orderedKeys.filter((key) => keyCounts[key] === objects.length)

  const schema: JsonSchema = { type: "object", properties }
  if (required.length > 0) schema.required = required
  return schema
}

function mergeScalarSchemas(values: unknown[]): JsonSchema {
  const schemas = values.map(inferScalar)
  const types = Array.from(new Set(schemas.map((s) => s.type as string)))

  const base: JsonSchema = types.length === 1 ? { type: types[0] } : { type: types }

  // Carry a string format only when every sample agrees on it.
  if (types.length === 1 && types[0] === "string") {
    const formats = new Set(schemas.map((s) => s.format))
    if (formats.size === 1) {
      const [only] = [...formats]
      if (only) base.format = only
    }
  }

  // Infer a small enum for low-cardinality string/number/boolean samples.
  const enumValues = inferEnum(values, types)
  if (enumValues) base.enum = enumValues

  return base
}

function inferEnum(values: unknown[], types: string[]): unknown[] | undefined {
  const enumerable = types.every((tp) => tp === "string" || tp === "integer" || tp === "number" || tp === "boolean")
  if (!enumerable) return undefined
  if (values.length < MIN_ENUM_SAMPLES) return undefined

  const seen: unknown[] = []
  for (const v of values) {
    if (!seen.includes(v)) seen.push(v)
    if (seen.length > MAX_ENUM_VALUES) return undefined
  }
  // Need at least one repeat to treat it as a constrained set, not free values.
  if (seen.length === values.length) return undefined
  return seen
}

export function inferObject(obj: Record<string, unknown>): JsonSchema {
  return mergeObjectSchemas([obj])
}

export type GeneratedSchema = JsonSchema & {
  $schema: string
}

export function generateSchema(value: unknown, draft: SchemaDraft = "draft-07"): GeneratedSchema {
  return {
    $schema: DRAFT_META[draft],
    ...inferType(value),
  }
}
