import { describe, it, expect } from "vitest"
import {
  buildFlexCss,
  buildFlexTailwind,
  DEFAULT_FLEX_OPTIONS,
  type FlexOptions,
} from "./flexbox-generator.utils"

const opts = (patch: Partial<FlexOptions> = {}): FlexOptions => ({
  ...DEFAULT_FLEX_OPTIONS,
  ...patch,
})

describe("buildFlexCss", () => {
  it("emits display:flex and every chosen prop", () => {
    const css = buildFlexCss(
      opts({
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        alignContent: "space-around",
        flexWrap: "wrap",
        gap: 24,
      }),
    )
    expect(css).toContain("display: flex;")
    expect(css).toContain("flex-direction: column;")
    expect(css).toContain("justify-content: space-between;")
    expect(css).toContain("align-items: center;")
    expect(css).toContain("align-content: space-around;")
    expect(css).toContain("flex-wrap: wrap;")
    expect(css).toContain("gap: 24px;")
  })

  it("uses the defaults when no overrides are given", () => {
    const css = buildFlexCss(DEFAULT_FLEX_OPTIONS)
    expect(css).toContain("flex-direction: row;")
    expect(css).toContain("justify-content: flex-start;")
    expect(css).toContain("align-items: stretch;")
    expect(css).toContain("flex-wrap: nowrap;")
    expect(css).toContain("gap: 16px;")
  })
})

describe("buildFlexTailwind", () => {
  it("maps direction to flex utilities", () => {
    expect(buildFlexTailwind(opts({ flexDirection: "row" }))).toContain("flex-row")
    expect(buildFlexTailwind(opts({ flexDirection: "row-reverse" }))).toContain("flex-row-reverse")
    expect(buildFlexTailwind(opts({ flexDirection: "column" }))).toContain("flex-col")
    expect(buildFlexTailwind(opts({ flexDirection: "column-reverse" }))).toContain(
      "flex-col-reverse",
    )
  })

  it("maps justify-content to justify utilities", () => {
    expect(buildFlexTailwind(opts({ justifyContent: "flex-start" }))).toContain("justify-start")
    expect(buildFlexTailwind(opts({ justifyContent: "center" }))).toContain("justify-center")
    expect(buildFlexTailwind(opts({ justifyContent: "space-between" }))).toContain("justify-between")
    expect(buildFlexTailwind(opts({ justifyContent: "space-evenly" }))).toContain("justify-evenly")
  })

  it("maps align-items to items utilities", () => {
    expect(buildFlexTailwind(opts({ alignItems: "flex-end" }))).toContain("items-end")
    expect(buildFlexTailwind(opts({ alignItems: "center" }))).toContain("items-center")
    expect(buildFlexTailwind(opts({ alignItems: "stretch" }))).toContain("items-stretch")
    expect(buildFlexTailwind(opts({ alignItems: "baseline" }))).toContain("items-baseline")
  })

  it("maps align-content to content utilities", () => {
    expect(buildFlexTailwind(opts({ alignContent: "center" }))).toContain("content-center")
    expect(buildFlexTailwind(opts({ alignContent: "space-between" }))).toContain("content-between")
  })

  it("maps flex-wrap to wrap utilities", () => {
    expect(buildFlexTailwind(opts({ flexWrap: "nowrap" }))).toContain("flex-nowrap")
    expect(buildFlexTailwind(opts({ flexWrap: "wrap" }))).toContain("flex-wrap")
    expect(buildFlexTailwind(opts({ flexWrap: "wrap-reverse" }))).toContain("flex-wrap-reverse")
  })

  it("maps the gap onto the spacing scale, with an arbitrary fallback", () => {
    expect(buildFlexTailwind(opts({ gap: 0 }))).toContain("gap-0")
    expect(buildFlexTailwind(opts({ gap: 16 }))).toContain("gap-4")
    expect(buildFlexTailwind(opts({ gap: 10 }))).toContain("gap-[10px]")
  })

  it("starts with the flex base class for the defaults", () => {
    expect(buildFlexTailwind(DEFAULT_FLEX_OPTIONS).split(" ")[0]).toBe("flex")
  })
})
