import { describe, it, expect } from "vitest"
import {
  buildAnimationCss,
  presetToAnimationName,
  KEYFRAMES,
  PRESETS,
  DEFAULT_OPTIONS,
  type AnimationOptions,
} from "./css-animation-generator.utils"

const base: AnimationOptions = { ...DEFAULT_OPTIONS }

describe("KEYFRAMES map", () => {
  it("has a keyframes definition for every preset", () => {
    for (const preset of PRESETS) {
      expect(KEYFRAMES[preset]).toBeDefined()
      expect(KEYFRAMES[preset].length).toBeGreaterThan(0)
    }
  })
})

describe("presetToAnimationName", () => {
  it("converts kebab-case preset to camelCase name", () => {
    expect(presetToAnimationName("slide-in")).toBe("slideIn")
  })

  it("leaves single-word presets untouched", () => {
    expect(presetToAnimationName("fade")).toBe("fade")
  })
})

describe("buildAnimationCss shorthand", () => {
  it("contains duration, timing-function and iteration count", () => {
    const css = buildAnimationCss({
      ...base,
      preset: "fade",
      duration: 2,
      timingFunction: "ease-in-out",
      iterationCount: 3,
    })
    expect(css.shorthand).toContain("2s")
    expect(css.shorthand).toContain("ease-in-out")
    expect(css.shorthand).toContain("3")
    expect(css.shorthand).toMatch(/^animation:/)
  })

  it("includes delay and direction", () => {
    const css = buildAnimationCss({
      ...base,
      delay: 0.5,
      direction: "alternate",
    })
    expect(css.shorthand).toContain("0.5s")
    expect(css.shorthand).toContain("alternate")
  })
})

describe("buildAnimationCss infinite handling", () => {
  it("uses 'infinite' keyword when infinite is true", () => {
    const css = buildAnimationCss({ ...base, infinite: true, iterationCount: 5 })
    expect(css.shorthand).toContain("infinite")
    expect(css.shorthand).not.toMatch(/\b5\b/)
  })

  it("uses numeric iteration count when not infinite", () => {
    const css = buildAnimationCss({ ...base, infinite: false, iterationCount: 4 })
    expect(css.shorthand).not.toContain("infinite")
    expect(css.shorthand).toContain("4")
  })

  it("clamps iteration count to at least 1", () => {
    const css = buildAnimationCss({ ...base, infinite: false, iterationCount: 0 })
    expect(css.shorthand).toContain("1")
  })
})

describe("buildAnimationCss keyframes", () => {
  it("produces a @keyframes block with the derived animation name", () => {
    const css = buildAnimationCss({ ...base, preset: "slide-in" })
    expect(css.keyframes).toContain("@keyframes slideIn")
  })

  it("generates keyframes for every preset", () => {
    for (const preset of PRESETS) {
      const css = buildAnimationCss({ ...base, preset })
      expect(css.keyframes).toMatch(/@keyframes \w+ \{/)
    }
  })

  it("full output combines keyframes and shorthand", () => {
    const css = buildAnimationCss({ ...base, preset: "pulse" })
    expect(css.full).toContain("@keyframes pulse")
    expect(css.full).toContain(css.shorthand)
  })
})
