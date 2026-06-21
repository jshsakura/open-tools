import { describe, expect, it } from "vitest"

import { queryJsonPath, tokenizeJsonPath } from "./json-path-finder.utils"

const sample = {
  store: {
    name: "Corner Books",
    book: [
      { title: "Dune", author: "Herbert", price: 12 },
      { title: "1984", author: "Orwell", price: 9 },
      { title: "Sapiens", author: "Harari", price: 20 },
    ],
    bicycle: { color: "red", price: 199, name: "Roadster" },
  },
  meta: { name: "root-meta" },
}

describe("json-path-finder utils", () => {
  describe("member access", () => {
    it("resolves a nested dot path $.a.b", () => {
      // Arrange
      const data = { a: { b: 42 } }

      // Act
      const matches = queryJsonPath(data, "$.a.b")

      // Assert
      expect(matches).toEqual([{ path: "$.a.b", value: 42 }])
    })

    it("resolves bracket-quoted keys ['key']", () => {
      const data = { "first name": "Ada" }
      const matches = queryJsonPath(data, "$['first name']")
      expect(matches).toEqual([{ path: "$['first name']", value: "Ada" }])
    })

    it("returns root value for bare $", () => {
      const matches = queryJsonPath({ x: 1 }, "$")
      expect(matches).toEqual([{ path: "$", value: { x: 1 } }])
    })
  })

  describe("array index", () => {
    it("resolves $.arr[0]", () => {
      const matches = queryJsonPath({ arr: [10, 20, 30] }, "$.arr[0]")
      expect(matches).toEqual([{ path: "$.arr[0]", value: 10 }])
    })

    it("resolves negative index $.arr[-1]", () => {
      const matches = queryJsonPath({ arr: [10, 20, 30] }, "$.arr[-1]")
      expect(matches).toEqual([{ path: "$.arr[2]", value: 30 }])
    })

    it("returns no match for out-of-range index", () => {
      const matches = queryJsonPath({ arr: [1] }, "$.arr[5]")
      expect(matches).toEqual([])
    })
  })

  describe("wildcard", () => {
    it("expands all array elements with $.arr[*]", () => {
      const matches = queryJsonPath({ arr: [1, 2, 3] }, "$.arr[*]")
      expect(matches).toEqual([
        { path: "$.arr[0]", value: 1 },
        { path: "$.arr[1]", value: 2 },
        { path: "$.arr[2]", value: 3 },
      ])
    })

    it("expands all object values with .*", () => {
      const matches = queryJsonPath({ a: 1, b: 2 }, "$.*")
      expect(matches).toEqual([
        { path: "$.a", value: 1 },
        { path: "$.b", value: 2 },
      ])
    })

    it("selects every book title via $.store.book[*].title", () => {
      const matches = queryJsonPath(sample, "$.store.book[*].title")
      expect(matches.map((m) => m.value)).toEqual(["Dune", "1984", "Sapiens"])
      expect(matches[0].path).toBe("$.store.book[0].title")
    })
  })

  describe("recursive descent", () => {
    it("finds every 'name' at any depth via $..name", () => {
      const matches = queryJsonPath(sample, "$..name")
      expect(matches.map((m) => m.value).sort()).toEqual(
        ["Corner Books", "Roadster", "root-meta"].sort(),
      )
    })

    it("finds every 'price' via $..price", () => {
      const matches = queryJsonPath(sample, "$..price")
      expect(matches.map((m) => m.value).sort((a, b) => (a as number) - (b as number))).toEqual([
        9, 12, 20, 199,
      ])
    })

    it("returns empty when recursive key is absent", () => {
      const matches = queryJsonPath(sample, "$..nonexistent")
      expect(matches).toEqual([])
    })
  })

  describe("array slice", () => {
    it("returns $.arr[1:3]", () => {
      const matches = queryJsonPath({ arr: [0, 1, 2, 3, 4] }, "$.arr[1:3]")
      expect(matches).toEqual([
        { path: "$.arr[1]", value: 1 },
        { path: "$.arr[2]", value: 2 },
      ])
    })

    it("supports open-ended start [:2]", () => {
      const matches = queryJsonPath({ arr: [0, 1, 2, 3] }, "$.arr[:2]")
      expect(matches.map((m) => m.value)).toEqual([0, 1])
    })

    it("supports open-ended end [2:]", () => {
      const matches = queryJsonPath({ arr: [0, 1, 2, 3] }, "$.arr[2:]")
      expect(matches.map((m) => m.value)).toEqual([2, 3])
    })

    it("supports negative slice bounds [-2:]", () => {
      const matches = queryJsonPath({ arr: [0, 1, 2, 3] }, "$.arr[-2:]")
      expect(matches.map((m) => m.value)).toEqual([2, 3])
    })
  })

  describe("nested combinations", () => {
    it("resolves author of the second book", () => {
      const matches = queryJsonPath(sample, "$.store.book[1].author")
      expect(matches).toEqual([{ path: "$.store.book[1].author", value: "Orwell" }])
    })

    it("recursive descent then index $..book[0].title", () => {
      const matches = queryJsonPath(sample, "$..book[0].title")
      expect(matches).toEqual([
        { path: "$.store.book[0].title", value: "Dune" },
      ])
    })
  })

  describe("no-match behavior", () => {
    it("returns empty array for missing key", () => {
      expect(queryJsonPath({ a: 1 }, "$.missing")).toEqual([])
    })

    it("returns empty array when indexing a non-array", () => {
      expect(queryJsonPath({ a: { b: 1 } }, "$.a[0]")).toEqual([])
    })
  })

  describe("tokenizer validation", () => {
    it("throws when path does not start with $", () => {
      expect(() => tokenizeJsonPath("a.b")).toThrow(/start with/)
    })

    it("throws on empty path", () => {
      expect(() => tokenizeJsonPath("   ")).toThrow(/empty/)
    })

    it("throws on unclosed bracket", () => {
      expect(() => tokenizeJsonPath("$.arr[0")).toThrow(/Unclosed/)
    })

    it("throws on invalid bracket content", () => {
      expect(() => tokenizeJsonPath("$.arr[abc]")).toThrow(/Invalid bracket/)
    })

    it("throws when a key is missing after a dot", () => {
      expect(() => tokenizeJsonPath("$.")).toThrow(/Expected a key/)
    })
  })
})
