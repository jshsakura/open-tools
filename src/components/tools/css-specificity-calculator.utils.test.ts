import { describe, expect, it } from "vitest"

import {
  calculateAll,
  calculateSpecificity,
  compareSpecificity,
  formatSpecificity,
} from "./css-specificity-calculator.utils"

describe("calculateSpecificity", () => {
  it("counts ID selectors as a", () => {
    expect(calculateSpecificity("#id")).toEqual({ a: 1, b: 0, c: 0 })
  })

  it("counts class selectors as b", () => {
    expect(calculateSpecificity(".cls")).toEqual({ a: 0, b: 1, c: 0 })
  })

  it("counts element selectors as c", () => {
    expect(calculateSpecificity("div")).toEqual({ a: 0, b: 0, c: 1 })
  })

  it("counts attribute selectors as b", () => {
    expect(calculateSpecificity("[type=text]")).toEqual({ a: 0, b: 1, c: 0 })
    expect(calculateSpecificity('input[type="text"]')).toEqual({
      a: 0,
      b: 1,
      c: 1,
    })
  })

  it("counts pseudo-classes as b", () => {
    expect(calculateSpecificity("a:hover")).toEqual({ a: 0, b: 1, c: 1 })
  })

  it("counts pseudo-elements as c", () => {
    expect(calculateSpecificity("::before")).toEqual({ a: 0, b: 0, c: 1 })
    expect(calculateSpecificity("p::first-line")).toEqual({ a: 0, b: 0, c: 2 })
    // Legacy single-colon pseudo-element syntax also counts as element-level.
    expect(calculateSpecificity(":before")).toEqual({ a: 0, b: 0, c: 1 })
  })

  it("combines a complex selector", () => {
    expect(calculateSpecificity("#id .cls a:hover")).toEqual({
      a: 1,
      b: 2,
      c: 1,
    })
  })

  it("treats the universal selector as zero", () => {
    expect(calculateSpecificity("*")).toEqual({ a: 0, b: 0, c: 0 })
    expect(calculateSpecificity("* .cls")).toEqual({ a: 0, b: 1, c: 0 })
  })

  it("ignores combinators", () => {
    expect(calculateSpecificity("div > p")).toEqual({ a: 0, b: 0, c: 2 })
    expect(calculateSpecificity("ul + li ~ a")).toEqual({ a: 0, b: 0, c: 3 })
    expect(calculateSpecificity(".a>.b")).toEqual({ a: 0, b: 2, c: 0 })
  })

  it("treats :where() as zero", () => {
    expect(calculateSpecificity(":where(.x)")).toEqual({ a: 0, b: 0, c: 0 })
    expect(calculateSpecificity(".y:where(#id .cls)")).toEqual({
      a: 0,
      b: 1,
      c: 0,
    })
  })

  it("takes the most specific argument of :not() and :is()", () => {
    expect(calculateSpecificity(":not(.cls)")).toEqual({ a: 0, b: 1, c: 0 })
    expect(calculateSpecificity(":not(#id, .cls)")).toEqual({
      a: 1,
      b: 0,
      c: 0,
    })
    expect(calculateSpecificity(":is(div, #id)")).toEqual({ a: 1, b: 0, c: 0 })
  })

  it("treats functional pseudo-classes like :nth-child as a class", () => {
    expect(calculateSpecificity("li:nth-child(2n+1)")).toEqual({
      a: 0,
      b: 1,
      c: 1,
    })
  })

  it("handles empty input", () => {
    expect(calculateSpecificity("")).toEqual({ a: 0, b: 0, c: 0 })
    expect(calculateSpecificity("   ")).toEqual({ a: 0, b: 0, c: 0 })
  })
})

describe("compareSpecificity", () => {
  it("ranks ID above any number of classes", () => {
    expect(compareSpecificity("#id", ".a.b.c.d")).toBeGreaterThan(0)
  })

  it("ranks classes above elements", () => {
    expect(compareSpecificity(".cls", "div span")).toBeGreaterThan(0)
  })

  it("returns zero for equal specificity", () => {
    expect(compareSpecificity(".a", ".b")).toBe(0)
  })

  it("returns negative when the second selector wins", () => {
    expect(compareSpecificity("div", "#id")).toBeLessThan(0)
  })
})

describe("formatSpecificity", () => {
  it("formats the tuple as a,b,c", () => {
    expect(formatSpecificity({ a: 1, b: 2, c: 3 })).toBe("1,2,3")
  })
})

describe("calculateAll", () => {
  it("parses multiple lines and finds the winner", () => {
    const { results, winners } = calculateAll("#id\n.cls\ndiv")
    expect(results).toHaveLength(3)
    expect(winners).toEqual([0])
  })

  it("reports ties as multiple winners", () => {
    const { winners } = calculateAll(".a\n.b\ndiv")
    expect(winners).toEqual([0, 1])
  })

  it("ignores blank lines", () => {
    const { results } = calculateAll("\n#id\n\n  \n.cls\n")
    expect(results).toHaveLength(2)
  })

  it("returns empty for empty input", () => {
    expect(calculateAll("")).toEqual({ results: [], winners: [] })
  })
})
