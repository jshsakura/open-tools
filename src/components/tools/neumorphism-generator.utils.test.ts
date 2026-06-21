import { describe, it, expect } from "vitest"
import { lightenDarken, buildNeumorphism } from "./neumorphism-generator.utils"

describe("lightenDarken", () => {
    it("lightens a color by adding to each channel", () => {
        expect(lightenDarken("#102030", 16)).toBe("#203040")
    })

    it("darkens a color with a negative amount", () => {
        expect(lightenDarken("#203040", -16)).toBe("#102030")
    })

    it("clamps the upper bound at 255 (ff)", () => {
        expect(lightenDarken("#fafafa", 50)).toBe("#ffffff")
    })

    it("clamps the lower bound at 0 (00)", () => {
        expect(lightenDarken("#0a0a0a", -50)).toBe("#000000")
    })

    it("returns a neutral grey for invalid input", () => {
        expect(lightenDarken("nope", 10)).toBe("#808080")
    })

    it("is a no-op when amount is 0", () => {
        expect(lightenDarken("#abcdef", 0)).toBe("#abcdef")
    })
})

describe("buildNeumorphism", () => {
    const base = {
        color: "#e0e0e0",
        size: 200,
        borderRadius: 30,
        distance: 20,
        intensity: 40,
        shape: "flat" as const,
        direction: "top-left" as const,
    }

    it("computes light and dark shadow colors from the base", () => {
        const r = buildNeumorphism(base)
        expect(r.lightColor).toBe(lightenDarken(base.color, 40))
        expect(r.darkColor).toBe(lightenDarken(base.color, -40))
    })

    it("places the dark shadow toward the away corner for top-left light", () => {
        const r = buildNeumorphism({ ...base, direction: "top-left" })
        // dark shadow first, positive offsets away from top-left light
        expect(r.boxShadow.startsWith(`20px 20px 40px ${r.darkColor}`)).toBe(true)
    })

    it("flips the X offset for top-right light", () => {
        const r = buildNeumorphism({ ...base, direction: "top-right" })
        expect(r.boxShadow.startsWith(`-20px 20px 40px ${r.darkColor}`)).toBe(true)
    })

    it("flips both offsets for bottom-right light", () => {
        const r = buildNeumorphism({ ...base, direction: "bottom-right" })
        expect(r.boxShadow.startsWith(`-20px -20px 40px ${r.darkColor}`)).toBe(true)
    })

    it("produces inset shadows for the pressed shape", () => {
        const r = buildNeumorphism({ ...base, shape: "pressed" })
        expect(r.boxShadow).toContain("inset")
        expect(r.css).toContain("inset")
    })

    it("uses a flat solid background for flat and pressed shapes", () => {
        expect(buildNeumorphism({ ...base, shape: "flat" }).background).toBe(base.color)
        expect(buildNeumorphism({ ...base, shape: "pressed" }).background).toBe(base.color)
    })

    it("produces a gradient background for concave and convex shapes", () => {
        const concave = buildNeumorphism({ ...base, shape: "concave" })
        const convex = buildNeumorphism({ ...base, shape: "convex" })
        expect(concave.background).toContain("linear-gradient")
        expect(convex.background).toContain("linear-gradient")
        // concave and convex invert the gradient stops, so they must differ
        expect(concave.background).not.toBe(convex.background)
    })

    it("includes box-shadow, background and border-radius in the css string", () => {
        const r = buildNeumorphism(base)
        expect(r.css).toContain("box-shadow:")
        expect(r.css).toContain("background:")
        expect(r.css).toContain("border-radius: 30px")
        expect(r.css).toContain(r.boxShadow)
    })
})
