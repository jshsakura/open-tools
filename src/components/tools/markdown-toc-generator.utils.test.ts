import { describe, expect, it } from "vitest"

import {
  DEFAULT_TOC_OPTIONS,
  type TocOptions,
  extractHeadings,
  generateToc,
  slugifyAnchor,
} from "./markdown-toc-generator.utils"

const opts = (overrides: Partial<TocOptions> = {}): TocOptions => ({
  ...DEFAULT_TOC_OPTIONS,
  ...overrides,
})

describe("extractHeadings", () => {
  it("extracts headings with their levels", () => {
    const md = "# Title\n\nsome text\n\n## Section\n\n### Sub"
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: "Title" },
      { level: 2, text: "Section" },
      { level: 3, text: "Sub" },
    ])
  })

  it("ignores headings inside fenced code blocks", () => {
    const md = "# Real\n\n```\n# Fake heading\n## Also fake\n```\n\n## After"
    expect(extractHeadings(md)).toEqual([
      { level: 1, text: "Real" },
      { level: 2, text: "After" },
    ])
  })

  it("handles tilde fences", () => {
    const md = "# Real\n\n~~~\n# Fake\n~~~\n\n## After"
    expect(extractHeadings(md).map((h) => h.text)).toEqual(["Real", "After"])
  })

  it("strips trailing closing hashes and skips empty headings", () => {
    const md = "## Title ##\n\n#\n\n#    "
    expect(extractHeadings(md)).toEqual([{ level: 2, text: "Title" }])
  })

  it("does not treat more than 6 hashes as a heading", () => {
    expect(extractHeadings("####### Nope")).toEqual([])
  })
})

describe("slugifyAnchor", () => {
  it("lowercases and hyphenates", () => {
    expect(slugifyAnchor("Hello World")).toBe("hello-world")
  })

  it("strips punctuation and markdown emphasis", () => {
    expect(slugifyAnchor("What's New?!")).toBe("whats-new")
    expect(slugifyAnchor("**Bold** _italic_")).toBe("bold-italic")
  })

  it("keeps unicode letters", () => {
    expect(slugifyAnchor("한국어 제목")).toBe("한국어-제목")
  })

  it("unwraps inline links", () => {
    expect(slugifyAnchor("See [docs](http://x.com)")).toBe("see-docs")
  })
})

describe("generateToc", () => {
  it("produces a bullet list with anchor links", () => {
    const md = "# Title\n## Section"
    expect(generateToc(md, opts())).toBe(
      "- [Title](#title)\n  - [Section](#section)",
    )
  })

  it("disambiguates duplicate anchors with -1, -2 suffixes", () => {
    const md = "# Intro\n# Intro\n# Intro"
    expect(generateToc(md, opts())).toBe(
      "- [Intro](#intro)\n- [Intro](#intro-1)\n- [Intro](#intro-2)",
    )
  })

  it("filters by min/max depth", () => {
    const md = "# H1\n## H2\n### H3\n#### H4"
    const toc = generateToc(md, opts({ minDepth: 2, maxDepth: 3 }))
    expect(toc).toBe("- [H2](#h2)\n  - [H3](#h3)")
  })

  it("ignores headings inside code fences", () => {
    const md = "# Real\n```\n# Fake\n```\n## After"
    expect(generateToc(md, opts())).toBe(
      "- [Real](#real)\n  - [After](#after)",
    )
  })

  it("renders an ordered list when ordered is true", () => {
    const md = "# One\n# Two\n## Two-a\n## Two-b"
    expect(generateToc(md, opts({ ordered: true }))).toBe(
      "1. [One](#one)\n2. [Two](#two)\n  1. [Two-a](#two-a)\n  2. [Two-b](#two-b)",
    )
  })

  it("wraps in TOC markers when requested", () => {
    const md = "# Title"
    expect(generateToc(md, opts({ wrapInMarkers: true }))).toBe(
      "<!-- TOC -->\n- [Title](#title)\n<!-- /TOC -->",
    )
  })

  it("returns an empty string when there are no headings", () => {
    expect(generateToc("just text", opts())).toBe("")
  })
})
