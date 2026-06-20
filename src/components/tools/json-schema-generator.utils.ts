export type JsonSchema = {
  type?: string | string[]
  properties?: Record<string, JsonSchema>
  required?: string[]
  items?: JsonSchema
}

export function inferType(value: unknown): JsonSchema {
  if (value === null) {
    return { type: "null" }
  }
  if (Array.isArray(value)) {
    const schema: JsonSchema = { type: "array" }
    if (value.length > 0) {
      schema.items = inferType(value[0])
    }
    return schema
  }
  const valueType = typeof value
  if (valueType === "object") {
    return inferObject(value as Record<string, unknown>)
  }
  if (valueType === "number") {
    return { type: Number.isInteger(value) ? "integer" : "number" }
  }
  if (valueType === "boolean") {
    return { type: "boolean" }
  }
  return { type: "string" }
}

export function inferObject(obj: Record<string, unknown>): JsonSchema {
  const properties: Record<string, JsonSchema> = {}
  const required: string[] = []
  Object.keys(obj).forEach((key) => {
    properties[key] = inferType(obj[key])
    required.push(key)
  })
  const schema: JsonSchema = { type: "object", properties }
  if (required.length > 0) {
    schema.required = required
  }
  return schema
}

export type GeneratedSchema = JsonSchema & {
  $schema: string
}

export function generateSchema(value: unknown): GeneratedSchema {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...inferType(value),
  }
}
