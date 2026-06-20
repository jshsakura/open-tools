import { describe, expect, it } from "vitest"

import { beautifyCss, minifyCss } from "./css-minifier.utils"

describe("minifyCss", () => {
  it("removes comments and collapses whitespace", () => {
    const input = `/* header */\n.a {\n  color: red;\n  margin: 0;\n}`
    expect(minifyCss(input)).toBe(".a{color:red;margin:0}")
  })

  it("removes the last semicolon before a closing brace", () => {
    expect(minifyCss(".a{color:red;}")).toBe(".a{color:red}")
  })

  it("preserves content inside quoted strings, including semicolons", () => {
    const input = `.a::before { content: "a; b: c"; }`
    expect(minifyCss(input)).toBe(`.a::before{content:"a; b: c"}`)
  })

  it("preserves url() values", () => {
    const input = `.a { background: url(  ./img/pic.png  ); }`
    expect(minifyCss(input)).toBe(`.a{background:url(  ./img/pic.png  )}`)
  })

  it("preserves data-URIs with their special characters", () => {
    const dataUri =
      "url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmciPjwvc3ZnPg==)"
    const input = `.icon { background: ${dataUri}; }`
    const out = minifyCss(input)
    expect(out).toContain(dataUri)
    expect(out).toBe(`.icon{background:${dataUri}}`)
  })

  it("does not strip a colon inside a quoted content value", () => {
    const input = `a::after { content: "https://example.com"; color: blue; }`
    expect(minifyCss(input)).toBe(`a::after{content:"https://example.com";color:blue}`)
  })

  it("is idempotent — minifying twice gives the same result", () => {
    const input = `.a { color: red; background: url(x.png); }  /* c */`
    const once = minifyCss(input)
    expect(minifyCss(once)).toBe(once)
  })

  it("handles @media blocks", () => {
    const input = `@media (max-width: 600px) { .a { color: red; } }`
    expect(minifyCss(input)).toBe(`@media (max-width:600px){.a{color:red}}`)
  })
})

describe("beautifyCss", () => {
  it("formats a minified rule onto multiple lines", () => {
    const out = beautifyCss(".a{color:red;margin:0}")
    expect(out).toContain(".a {\n")
    expect(out).toContain("  color:red;\n")
    expect(out).toContain("}\n")
  })

  it("indents nested @media rules", () => {
    const out = beautifyCss("@media (max-width:600px){.a{color:red}}")
    const lines = out.split("\n")
    // The .a selector should be indented one level inside @media.
    expect(lines.some((l) => l.startsWith("  .a {"))).toBe(true)
    // color should be indented two levels.
    expect(lines.some((l) => l.startsWith("    color:red"))).toBe(true)
  })

  it("preserves quoted content and url() while beautifying", () => {
    const out = beautifyCss(`.a::before{content:"x; y"}.b{background:url(data:image/png;base64,AAA)}`)
    expect(out).toContain(`content:"x; y"`)
    expect(out).toContain(`url(data:image/png;base64,AAA)`)
  })

  it("round-trips: beautify then minify returns the minified form", () => {
    const minified = `.a{color:red;background:url(x.png)}`
    expect(minifyCss(beautifyCss(minified))).toBe(minified)
  })
})
