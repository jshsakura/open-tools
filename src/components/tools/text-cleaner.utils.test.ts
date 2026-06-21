import { describe, expect, it } from "vitest"

import {
  applyCase,
  cleanText,
  collapseInnerSpaces,
  countLines,
  DEFAULT_CLEAN_OPTIONS,
  removeLineNumber,
  splitLines,
  stripHtmlTags,
  type CleanOptions,
} from "./text-cleaner.utils"

const opts = (overrides: Partial<CleanOptions> = {}): CleanOptions => ({
  ...DEFAULT_CLEAN_OPTIONS,
  ...overrides,
})

describe("splitLines", () => {
  it("returns an empty array for empty input", () => {
    expect(splitLines("")).toEqual([])
  })

  it("normalizes CRLF and CR line endings", () => {
    expect(splitLines("a\r\nb\rc\nd")).toEqual(["a", "b", "c", "d"])
  })
})

describe("removeDuplicates", () => {
  it("keeps the first occurrence and drops later duplicates", () => {
    expect(cleanText("a\nb\na\nc\nb", opts({ removeDuplicates: true }))).toBe(
      "a\nb\nc",
    )
  })

  it("does not remove duplicates when disabled", () => {
    expect(cleanText("a\na", opts())).toBe("a\na")
  })
})

describe("trimLines", () => {
  it("trims leading and trailing whitespace per line", () => {
    expect(cleanText("  a  \n\tb\t", opts({ trimLines: true }))).toBe("a\nb")
  })
})

describe("collapseSpaces", () => {
  it("collapses runs of inner spaces and tabs to a single space", () => {
    expect(collapseInnerSpaces("a    b")).toBe("a b")
    expect(collapseInnerSpaces("a\t\tb")).toBe("a b")
    expect(cleanText("a    b", opts({ collapseSpaces: true }))).toBe("a b")
  })
})

describe("removeEmpty", () => {
  it("removes blank and whitespace-only lines", () => {
    expect(cleanText("a\n\n  \nb", opts({ removeEmpty: true }))).toBe("a\nb")
  })
})

describe("removeExtraBlank", () => {
  it("collapses multiple consecutive blank lines into one", () => {
    expect(cleanText("a\n\n\n\nb", opts({ removeExtraBlank: true }))).toBe(
      "a\n\nb",
    )
  })
})

describe("sort", () => {
  it("sorts ascending", () => {
    expect(cleanText("banana\napple\ncherry", opts({ sort: "asc" }))).toBe(
      "apple\nbanana\ncherry",
    )
  })

  it("sorts descending", () => {
    expect(cleanText("banana\napple\ncherry", opts({ sort: "desc" }))).toBe(
      "cherry\nbanana\napple",
    )
  })

  it("preserves order when sort is none", () => {
    expect(cleanText("b\na\nc", opts({ sort: "none" }))).toBe("b\na\nc")
  })
})

describe("case transforms", () => {
  it("lowercases", () => {
    expect(applyCase("Hello WORLD", "lower")).toBe("hello world")
  })

  it("uppercases", () => {
    expect(applyCase("Hello world", "upper")).toBe("HELLO WORLD")
  })

  it("title-cases each word", () => {
    expect(applyCase("hello brave new world", "title")).toBe(
      "Hello Brave New World",
    )
  })

  it("leaves text untouched for none", () => {
    expect(applyCase("Mixed CaSe", "none")).toBe("Mixed CaSe")
  })

  it("applies case mode through the pipeline", () => {
    expect(cleanText("foo\nbar", opts({ caseMode: "upper" }))).toBe("FOO\nBAR")
  })
})

describe("removeLineNumbers", () => {
  it("strips numeric prefixes with common delimiters", () => {
    expect(removeLineNumber("1. apple")).toBe("apple")
    expect(removeLineNumber("2) banana")).toBe("banana")
    expect(removeLineNumber("10: cherry")).toBe("cherry")
    expect(removeLineNumber("  3 date")).toBe("date")
  })

  it("does not strip numbers that are part of content", () => {
    expect(removeLineNumber("2024 was a year")).toBe("was a year")
    expect(removeLineNumber("no number here")).toBe("no number here")
  })

  it("works through the pipeline", () => {
    expect(
      cleanText("1. one\n2. two", opts({ removeLineNumbers: true })),
    ).toBe("one\ntwo")
  })
})

describe("stripHtml", () => {
  it("removes opening and closing tags but keeps text", () => {
    expect(stripHtmlTags("<p>Hello <b>world</b></p>")).toBe("Hello world")
  })

  it("removes tags with attributes", () => {
    expect(stripHtmlTags('<a href="x">link</a>')).toBe("link")
  })

  it("works through the pipeline", () => {
    expect(cleanText("<h1>Title</h1>", opts({ stripHtml: true }))).toBe("Title")
  })
})

describe("combined pipeline order", () => {
  it("strips html, trims, removes empties, dedups, then sorts", () => {
    const input = "  <b>banana</b> \n\n  apple  \n  banana  \n"
    const result = cleanText(
      input,
      opts({
        stripHtml: true,
        trimLines: true,
        removeEmpty: true,
        removeDuplicates: true,
        sort: "asc",
      }),
    )
    expect(result).toBe("apple\nbanana")
  })

  it("collapses spaces before applying case so output is normalized", () => {
    const result = cleanText(
      "the    quick   brown",
      opts({ collapseSpaces: true, caseMode: "title" }),
    )
    expect(result).toBe("The Quick Brown")
  })

  it("returns empty string for empty input regardless of options", () => {
    expect(
      cleanText("", opts({ removeDuplicates: true, sort: "asc" })),
    ).toBe("")
  })
})

describe("countLines", () => {
  it("returns 0 for empty input", () => {
    expect(countLines("")).toBe(0)
  })

  it("counts lines including blanks", () => {
    expect(countLines("a\n\nb")).toBe(3)
  })
})
