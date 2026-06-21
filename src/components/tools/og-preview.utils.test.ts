import { describe, it, expect } from "vitest"
import {
  buildMetaTags,
  truncate,
  extractDomain,
  escapeAttr,
  PLATFORM_LIMITS,
} from "./og-preview.utils"

describe("buildMetaTags", () => {
  const base = {
    title: "My Page",
    description: "A great description",
    image: "https://example.com/og.png",
    url: "https://example.com/post",
    type: "article",
  }

  it("includes og:title, og:image and twitter:card", () => {
    const out = buildMetaTags(base)
    expect(out).toContain(`<meta property="og:title" content="My Page" />`)
    expect(out).toContain(`<meta property="og:image" content="https://example.com/og.png" />`)
    expect(out).toContain(`<meta name="twitter:card" content="summary_large_image" />`)
  })

  it("includes og:type and og:url", () => {
    const out = buildMetaTags(base)
    expect(out).toContain(`<meta property="og:type" content="article" />`)
    expect(out).toContain(`<meta property="og:url" content="https://example.com/post" />`)
  })

  it("derives og:site_name from the url", () => {
    const out = buildMetaTags(base)
    expect(out).toContain(`<meta property="og:site_name" content="example.com" />`)
  })

  it("emits twitter mirror tags", () => {
    const out = buildMetaTags(base)
    expect(out).toContain(`<meta name="twitter:title" content="My Page" />`)
    expect(out).toContain(`<meta name="twitter:description" content="A great description" />`)
    expect(out).toContain(`<meta name="twitter:image" content="https://example.com/og.png" />`)
  })

  it("omits tags for empty fields", () => {
    const out = buildMetaTags({ title: "", description: "", image: "", url: "", type: "" })
    expect(out).not.toContain("og:title")
    expect(out).not.toContain("og:image")
    // twitter:card is always present
    expect(out).toContain("twitter:card")
  })

  it("escapes special characters in attribute values", () => {
    const out = buildMetaTags({ ...base, title: `Tom & "Jerry" <b>` })
    expect(out).toContain(`content="Tom &amp; &quot;Jerry&quot; &lt;b&gt;"`)
    expect(out).not.toContain(`<b>`)
  })
})

describe("truncate", () => {
  it("returns text unchanged when within the limit", () => {
    expect(truncate("hello", 10)).toBe("hello")
    expect(truncate("hello", 5)).toBe("hello")
  })

  it("truncates and appends an ellipsis when over the limit", () => {
    const result = truncate("hello world", 8)
    expect(result.length).toBeLessThanOrEqual(8)
    expect(result.endsWith("…")).toBe(true)
  })

  it("truncates exactly at the platform title limit", () => {
    const long = "x".repeat(200)
    const result = truncate(long, PLATFORM_LIMITS.twitter.title)
    expect(result.length).toBe(PLATFORM_LIMITS.twitter.title)
    expect(result.endsWith("…")).toBe(true)
  })

  it("returns empty string for non-positive max", () => {
    expect(truncate("hello", 0)).toBe("")
    expect(truncate("hello", -3)).toBe("")
  })
})

describe("extractDomain", () => {
  it("extracts hostname from a full URL", () => {
    expect(extractDomain("https://example.com/path?q=1")).toBe("example.com")
  })

  it("strips the www prefix", () => {
    expect(extractDomain("https://www.example.com")).toBe("example.com")
  })

  it("handles URLs without a protocol", () => {
    expect(extractDomain("example.com/foo")).toBe("example.com")
    expect(extractDomain("www.example.org")).toBe("example.org")
  })

  it("handles subdomains and ports", () => {
    expect(extractDomain("https://blog.example.co.uk:8080/a")).toBe("blog.example.co.uk")
  })

  it("lowercases the hostname", () => {
    expect(extractDomain("HTTPS://Example.COM")).toBe("example.com")
  })

  it("returns empty string for empty input", () => {
    expect(extractDomain("")).toBe("")
    expect(extractDomain("   ")).toBe("")
  })
})

describe("escapeAttr", () => {
  it("escapes ampersands, quotes and angle brackets", () => {
    expect(escapeAttr(`a & "b" 'c' <d>`)).toBe("a &amp; &quot;b&quot; &#39;c&#39; &lt;d&gt;")
  })
})
