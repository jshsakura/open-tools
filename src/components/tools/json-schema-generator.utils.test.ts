import { describe, expect, it } from "vitest"

import { generateSchema, type GeneratedSchema } from "./json-schema-generator.utils"

// Helper: run generateSchema, serialize, then re-parse so assertions run
// against the same structure a consumer would inspect after JSON round-trip.
function buildSchema(value: unknown): GeneratedSchema {
  return JSON.parse(JSON.stringify(generateSchema(value)))
}

describe("json-schema-generator utils", () => {
  describe("generateSchema top-level metadata", () => {
    it("always includes the draft-07 $schema declaration", () => {
      // Arrange
      const value = {}

      // Act
      const schema = buildSchema(value)

      // Assert
      expect(schema.$schema).toBe("http://json-schema.org/draft-07/schema#")
    })
  })

  describe("flat objects", () => {
    it("describes each primitive property with its type and lists all keys as required", () => {
      // Arrange
      const value = { name: "Jane", age: 25, active: true }

      // Act
      const schema = buildSchema(value)

      // Assert
      expect(schema.type).toBe("object")
      expect(schema.properties).toEqual({
        name: { type: "string" },
        age: { type: "integer" },
        active: { type: "boolean" },
      })
      expect(schema.required).toEqual(["name", "age", "active"])
    })
  })

  describe("nested objects", () => {
    it("recurses into nested objects producing nested properties and required lists", () => {
      // Arrange
      const value = {
        user: { id: "u1", profile: { city: "Seoul" } },
      }

      // Act
      const schema = buildSchema(value)

      // Assert
      const user = schema.properties?.user
      expect(user?.type).toBe("object")
      expect(user?.required).toEqual(["id", "profile"])
      expect(user?.properties?.id).toEqual({ type: "string" })

      const profile = user?.properties?.profile
      expect(profile?.type).toBe("object")
      expect(profile?.properties?.city).toEqual({ type: "string" })
      expect(profile?.required).toEqual(["city"])
    })
  })

  describe("arrays of primitives", () => {
    it("describes an array with items inferred from the first element", () => {
      // Arrange
      const value = { tags: ["a", "b", "c"] }

      // Act
      const schema = buildSchema(value)

      // Assert
      const tags = schema.properties?.tags
      expect(tags?.type).toBe("array")
      expect(tags?.items).toEqual({ type: "string" })
    })

    it("infers numeric item types for number arrays", () => {
      // Arrange
      const value = { scores: [10, 20, 30] }

      // Act
      const schema = buildSchema(value)

      // Assert
      expect(schema.properties?.scores?.items).toEqual({ type: "integer" })
    })
  })

  describe("arrays of objects", () => {
    it("describes array items as a fully nested object schema", () => {
      // Arrange
      const value = {
        items: [{ sku: "x1", qty: 2 }],
      }

      // Act
      const schema = buildSchema(value)

      // Assert
      const items = schema.properties?.items
      expect(items?.type).toBe("array")
      expect(items?.items?.type).toBe("object")
      expect(items?.items?.properties).toEqual({
        sku: { type: "string" },
        qty: { type: "integer" },
      })
      expect(items?.items?.required).toEqual(["sku", "qty"])
    })
  })

  describe("mixed types in a single object", () => {
    it("infers a distinct type per property", () => {
      // Arrange
      const value = {
        title: "hello",
        count: 3,
        ratio: 1.5,
        enabled: false,
        nothing: null,
        list: [1],
        nested: { ok: true },
      }

      // Act
      const schema = buildSchema(value)

      // Assert
      expect(schema.properties?.title).toEqual({ type: "string" })
      expect(schema.properties?.count).toEqual({ type: "integer" })
      expect(schema.properties?.ratio).toEqual({ type: "number" })
      expect(schema.properties?.enabled).toEqual({ type: "boolean" })
      expect(schema.properties?.nothing).toEqual({ type: "null" })
      expect(schema.properties?.list?.type).toBe("array")
      expect(schema.properties?.nested?.type).toBe("object")
    })
  })

  describe("integer vs number distinction", () => {
    it("classifies whole numbers as integer", () => {
      // Arrange / Act
      const schema = buildSchema(42)

      // Assert
      expect(schema.type).toBe("integer")
    })

    it("classifies fractional numbers as number", () => {
      // Arrange / Act
      const schema = buildSchema(42.7)

      // Assert
      expect(schema.type).toBe("number")
    })

    it("treats a whole-valued float (3.0) as integer because it is integral", () => {
      // Arrange / Act
      const schema = buildSchema(3.0)

      // Assert
      expect(schema.type).toBe("integer")
    })
  })

  describe("null handling", () => {
    it("produces a null type for a top-level null", () => {
      // Arrange / Act
      const schema = buildSchema(null)

      // Assert
      expect(schema.type).toBe("null")
    })
  })

  describe("empty containers", () => {
    it("produces an object schema without properties or required for an empty object", () => {
      // Arrange / Act
      const schema = buildSchema({})

      // Assert
      expect(schema.type).toBe("object")
      expect(schema.properties).toEqual({})
      expect(schema.required).toBeUndefined()
    })

    it("produces an array schema without items for an empty array", () => {
      // Arrange / Act
      const schema = buildSchema([])

      // Assert
      expect(schema.type).toBe("array")
      expect(schema.items).toBeUndefined()
    })
  })

  describe("required list integrity", () => {
    it("lists exactly the present keys in insertion order", () => {
      // Arrange
      const value = { z: 1, a: 2, m: 3 }

      // Act
      const schema = buildSchema(value)

      // Assert
      expect(schema.required).toEqual(["z", "a", "m"])
      expect(Object.keys(schema.properties ?? {})).toEqual(["z", "a", "m"])
    })
  })

  describe("round-trip parseability", () => {
    it("produces a string that JSON.parse accepts and yields the same structure", () => {
      // Arrange
      const value = { name: "Jane", age: 25 }

      // Act
      const serialized = JSON.stringify(generateSchema(value), null, 4)
      const parsed = JSON.parse(serialized)

      // Assert
      expect(parsed.$schema).toBe("http://json-schema.org/draft-07/schema#")
      expect(parsed.properties.name).toEqual({ type: "string" })
      expect(parsed.properties.age).toEqual({ type: "integer" })
    })
  })
})
