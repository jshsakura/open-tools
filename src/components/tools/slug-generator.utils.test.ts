import { describe, expect, it } from "vitest"

import {
  DEFAULT_SLUG_OPTIONS,
  generateSlug,
  generateSlugs,
  type SlugOptions,
} from "./slug-generator.utils"

const opts = (overrides: Partial<SlugOptions> = {}): SlugOptions => ({
  ...DEFAULT_SLUG_OPTIONS,
  ...overrides,
})

describe("generateSlug", () => {
  it("converts English text to a hyphenated slug", () => {
    expect(generateSlug("Hello World", opts())).toBe("hello-world")
  })

  it("returns empty string for blank input", () => {
    expect(generateSlug("   ", opts())).toBe("")
    expect(generateSlug("", opts())).toBe("")
  })

  it("respects the underscore separator option", () => {
    expect(generateSlug("Hello World Again", opts({ separator: "_" }))).toBe(
      "hello_world_again",
    )
  })

  it("preserves case when lowercase is disabled", () => {
    expect(generateSlug("Hello World", opts({ lowercase: false }))).toBe(
      "Hello-World",
    )
  })

  it("strips special characters when stripSpecial is on", () => {
    expect(generateSlug("Hello, World! & More?", opts())).toBe(
      "hello-world-and-more",
    )
  })

  it("keeps non-stripped punctuation when stripSpecial is off", () => {
    const result = generateSlug("a.b.c", opts({ stripSpecial: false }))
    expect(result).toBe("a.b.c")
  })

  it("truncates to maxLength without trailing separators", () => {
    const result = generateSlug("the quick brown fox", opts({ maxLength: 9 }))
    expect(result.length).toBeLessThanOrEqual(9)
    expect(result.endsWith("-")).toBe(false)
    expect(result).toBe("the-quick")
  })

  it("transliterates Korean to lowercase ascii with the chosen separator", () => {
    const result = generateSlug("안녕하세요 세계", opts())
    expect(result).toBe("annyeonghaseyo-segye")
    expect(result).toMatch(/^[a-z0-9-]+$/)
    expect(result).not.toMatch(/\s/)
  })

  it("transliterates Korean with the underscore separator", () => {
    const result = generateSlug("안녕하세요 세계", opts({ separator: "_" }))
    expect(result).toBe("annyeonghaseyo_segye")
    expect(result).toMatch(/^[a-z0-9_]+$/)
  })
})

describe("generateSlugs", () => {
  it("produces one slug per non-empty line", () => {
    const input = "First Title\nSecond Title\n\nThird Title"
    expect(generateSlugs(input, opts())).toEqual([
      "first-title",
      "second-title",
      "third-title",
    ])
  })

  it("handles CRLF line endings and mixed Korean/English", () => {
    const input = "Hello World\r\n안녕하세요 세계"
    expect(generateSlugs(input, opts())).toEqual([
      "hello-world",
      "annyeonghaseyo-segye",
    ])
  })

  it("returns an empty array for empty input", () => {
    expect(generateSlugs("", opts())).toEqual([])
    expect(generateSlugs("\n\n", opts())).toEqual([])
  })
})
