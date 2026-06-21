import { describe, it, expect } from "vitest"
import {
  trackToCss,
  tracksToTemplate,
  buildGridCss,
  buildGridTailwind,
  type Track,
} from "./css-grid-generator.utils"

const fr = (value = 1): Track => ({ unit: "fr", value })

describe("trackToCss", () => {
  it("renders fr tracks", () => {
    expect(trackToCss({ unit: "fr", value: 2 })).toBe("2fr")
  })
  it("renders px tracks", () => {
    expect(trackToCss({ unit: "px", value: 120 })).toBe("120px")
  })
  it("renders auto tracks", () => {
    expect(trackToCss({ unit: "auto", value: 0 })).toBe("auto")
  })
  it("renders minmax tracks", () => {
    expect(trackToCss({ unit: "minmax", value: 200 })).toBe("minmax(200px, 1fr)")
  })
})

describe("tracksToTemplate", () => {
  it("joins multiple tracks", () => {
    expect(tracksToTemplate([fr(), { unit: "px", value: 80 }, fr(2)])).toBe("1fr 80px 2fr")
  })
  it("returns none for an empty list", () => {
    expect(tracksToTemplate([])).toBe("none")
  })
})

describe("buildGridCss", () => {
  it("builds a full grid container rule", () => {
    const css = buildGridCss({ columns: [fr(), fr()], rows: [fr()], gap: 16 })
    expect(css).toContain("grid-template-columns: 1fr 1fr;")
    expect(css).toContain("grid-template-rows: 1fr;")
    expect(css).toContain("gap: 16px;")
  })
})

describe("buildGridTailwind", () => {
  it("uses grid-cols-N for equal fr columns", () => {
    const tw = buildGridTailwind({ columns: [fr(), fr(), fr()], rows: [fr()], gap: 16 })
    expect(tw).toContain("grid-cols-3")
    expect(tw).toContain("grid-rows-1")
    expect(tw).toContain("gap-4")
  })
  it("uses arbitrary values for mixed tracks", () => {
    const tw = buildGridTailwind({
      columns: [{ unit: "px", value: 80 }, fr()],
      rows: [fr()],
      gap: 10,
    })
    expect(tw).toContain("grid-cols-[80px_1fr]")
    expect(tw).toContain("gap-[10px]")
  })
  it("renders gap-0 for zero gap", () => {
    const tw = buildGridTailwind({ columns: [fr()], rows: [fr()], gap: 0 })
    expect(tw).toContain("gap-0")
  })
})
