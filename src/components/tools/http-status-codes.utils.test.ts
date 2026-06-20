import { describe, expect, it } from "vitest"

import { HTTP_STATUS_CODES, filterCodes } from "./http-status-codes.utils"

describe("http-status-codes utils", () => {
  describe("dataset coverage", () => {
    it("covers a representative set of common 1xx-5xx codes", () => {
      // Arrange
      const expectedCodes = [200, 301, 404, 418, 500, 503]

      // Act
      const presentCodes = HTTP_STATUS_CODES.map((c) => c.code)

      // Assert
      for (const code of expectedCodes) {
        expect(presentCodes).toContain(code)
      }
    })

    it("spans all five status-code classes (1xx through 5xx)", () => {
      // Arrange / Act
      const classes = new Set(
        HTTP_STATUS_CODES.map((c) => Math.floor(c.code / 100)),
      )

      // Assert
      expect(classes).toEqual(new Set([1, 2, 3, 4, 5]))
    })

    it("has a unique code for every entry", () => {
      // Arrange / Act
      const codes = HTTP_STATUS_CODES.map((c) => c.code)

      // Assert
      expect(new Set(codes).size).toBe(codes.length)
    })
  })

  describe("empty query", () => {
    it("returns the full dataset unchanged for an empty string", () => {
      // Arrange / Act
      const result = filterCodes("")

      // Assert
      expect(result).toHaveLength(HTTP_STATUS_CODES.length)
      expect(result).toEqual(HTTP_STATUS_CODES)
    })
  })

  describe("search by numeric code", () => {
    it("matches an exact code string", () => {
      // Arrange / Act
      const result = filterCodes("404")

      // Assert
      expect(result.some((c) => c.code === 404)).toBe(true)
      expect(result.every((c) => c.code.toString().includes("404"))).toBe(true)
    })

    it("matches a partial code prefix shared by multiple entries", () => {
      // Arrange / Act
      const result = filterCodes("20")

      // Assert — 200, 201, 202, 204, 206 all contain "20"
      const matchedCodes = result.map((c) => c.code)
      expect(matchedCodes).toEqual(
        expect.arrayContaining([200, 201, 202, 204, 206]),
      )
    })
  })

  describe("search by name", () => {
    it("finds an entry by its exact status name", () => {
      // Arrange / Act
      const result = filterCodes("Not Found")

      // Assert
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe(404)
    })

    it("finds entries by a partial name fragment", () => {
      // Arrange / Act
      const result = filterCodes("Redirect")

      // Assert — Temporary Redirect (307) and Permanent Redirect (308)
      const codes = result.map((c) => c.code)
      expect(codes).toContain(307)
      expect(codes).toContain(308)
    })
  })

  describe("search by description substring", () => {
    it("matches against the Korean description text", () => {
      // Arrange / Act
      const result = filterCodes("teapot")

      // Assert — only the teapot entry's name contains 'teapot'
      expect(result).toHaveLength(1)
      expect(result[0].code).toBe(418)
    })

    it("matches a description-only substring not present in code or name", () => {
      // Arrange / Act — "캐시" appears in 304's description only
      const result = filterCodes("캐시")

      // Assert
      expect(result.some((c) => c.code === 304)).toBe(true)
      expect(result.every((c) => c.desc.includes("캐시"))).toBe(true)
    })
  })

  describe("case insensitivity", () => {
    it("matches names regardless of query casing", () => {
      // Arrange / Act
      const lower = filterCodes("not found")
      const upper = filterCodes("NOT FOUND")
      const mixed = filterCodes("NoT FoUnD")

      // Assert
      expect(lower).toEqual(upper)
      expect(upper).toEqual(mixed)
      expect(lower[0].code).toBe(404)
    })
  })

  describe("no match", () => {
    it("returns an empty array when nothing matches", () => {
      // Arrange / Act
      const result = filterCodes("zzz-nonexistent-query")

      // Assert
      expect(result).toEqual([])
    })
  })

  describe("immutability", () => {
    it("does not mutate the underlying dataset", () => {
      // Arrange
      const before = HTTP_STATUS_CODES.length

      // Act
      filterCodes("404")

      // Assert
      expect(HTTP_STATUS_CODES.length).toBe(before)
    })
  })
})
