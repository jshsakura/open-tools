import { describe, expect, it } from "vitest"

import { parseUrl } from "./url-parser.utils"

describe("url-parser utils", () => {
  describe("full URL", () => {
    it("breaks a complete URL into all labeled parts", () => {
      // Arrange / Act
      const result = parseUrl(
        "https://user:pass@example.com:8080/path/to/page?q=hello#section",
      )

      // Assert
      expect(result.valid).toBe(true)
      const parts = result.parts!
      expect(parts.protocol).toBe("https")
      expect(parts.username).toBe("user")
      expect(parts.password).toBe("pass")
      expect(parts.hostname).toBe("example.com")
      expect(parts.port).toBe("8080")
      expect(parts.pathname).toBe("/path/to/page")
      expect(parts.hash).toBe("section")
      expect(parts.origin).toBe("https://example.com:8080")
    })
  })

  describe("missing parts", () => {
    it("returns empty strings for absent auth, port, and hash", () => {
      // Arrange / Act
      const result = parseUrl("https://example.com/")

      // Assert
      expect(result.valid).toBe(true)
      const parts = result.parts!
      expect(parts.username).toBe("")
      expect(parts.password).toBe("")
      expect(parts.port).toBe("")
      expect(parts.hash).toBe("")
      expect(parts.pathname).toBe("/")
      expect(result.params).toEqual([])
    })
  })

  describe("invalid input", () => {
    it("marks a malformed string as invalid", () => {
      const result = parseUrl("not a url")
      expect(result.valid).toBe(false)
      expect(result.parts).toBeNull()
      expect(result.params).toEqual([])
    })

    it("marks an empty string as invalid without throwing", () => {
      const result = parseUrl("")
      expect(result.valid).toBe(false)
      expect(result.parts).toBeNull()
    })
  })

  describe("query params with encoding", () => {
    it("returns decoded values for percent-encoded params", () => {
      // Arrange / Act
      const result = parseUrl(
        "https://example.com/?name=John%20Doe&city=S%C3%A3o%20Paulo",
      )

      // Assert
      expect(result.valid).toBe(true)
      expect(result.params).toEqual([
        { key: "name", value: "John Doe" },
        { key: "city", value: "São Paulo" },
      ])
    })

    it("decodes plus signs as spaces in the query string", () => {
      const result = parseUrl("https://example.com/search?q=open+tools")
      expect(result.params).toEqual([{ key: "q", value: "open tools" }])
    })
  })

  describe("ports", () => {
    it("exposes an explicit non-default port", () => {
      const result = parseUrl("http://localhost:3000/api")
      expect(result.parts!.port).toBe("3000")
      expect(result.parts!.host).toBe("localhost:3000")
    })

    it("omits the port for the protocol default", () => {
      const result = parseUrl("https://example.com:443/")
      expect(result.parts!.port).toBe("")
    })
  })
})
