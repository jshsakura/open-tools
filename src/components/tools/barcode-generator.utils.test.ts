import { describe, it, expect } from "vitest"
import {
    encodeCode128B,
    buildBarcodeSvg,
    charToValueB,
    isEncodableCode128B,
    CODE128_PATTERNS,
    START_B,
    STOP,
    type BarcodeSvgOptions,
} from "./barcode-generator.utils"

const SVG_OPTS: BarcodeSvgOptions = {
    barHeight: 100,
    moduleWidth: 2,
    foreground: "#000000",
    background: "#ffffff",
    showText: true,
}

describe("CODE128_PATTERNS table", () => {
    it("contains 107 patterns (values 0–106)", () => {
        expect(CODE128_PATTERNS).toHaveLength(107)
    })

    it("uses the canonical Start B (104) and Stop (106) patterns", () => {
        expect(CODE128_PATTERNS[START_B]).toBe("211214")
        expect(CODE128_PATTERNS[STOP]).toBe("2331112")
    })

    it("has 6-module patterns for all data symbols and 7 for the stop", () => {
        for (let i = 0; i < 106; i++) {
            expect(CODE128_PATTERNS[i]).toHaveLength(6)
        }
        expect(CODE128_PATTERNS[106]).toHaveLength(7)
    })
})

describe("charToValueB", () => {
    it("maps space (ASCII 32) to value 0", () => {
        expect(charToValueB(" ")).toBe(0)
    })

    it("maps 'A' (ASCII 65) to value 33", () => {
        expect(charToValueB("A")).toBe(33)
    })

    it("maps '~' (ASCII 126) to value 94", () => {
        expect(charToValueB("~")).toBe(94)
    })

    it("returns null for characters below the encodable range", () => {
        expect(charToValueB("\n")).toBeNull()
    })

    it("returns null for non-ASCII characters", () => {
        expect(charToValueB("가")).toBeNull()
    })
})

describe("isEncodableCode128B", () => {
    it("accepts plain ASCII text", () => {
        expect(isEncodableCode128B("Hello 123!")).toBe(true)
    })

    it("rejects text with a non-encodable character", () => {
        expect(isEncodableCode128B("café")).toBe(false)
    })
})

describe("encodeCode128B", () => {
    it("prepends Start B (value 104)", () => {
        const { values } = encodeCode128B("A")
        expect(values[0]).toBe(104)
    })

    it("appends the Stop symbol (value 106) last", () => {
        const { values } = encodeCode128B("A")
        expect(values[values.length - 1]).toBe(106)
    })

    it("computes the mod-103 checksum for the known 'Wikipedia' example", () => {
        // Wikipedia's documented Code 128B example: checksum value 88.
        const { checksum } = encodeCode128B("Wikipedia")
        expect(checksum).toBe(88)
    })

    it("computes the checksum for a single 'A' (104 + 33·1) mod 103 = 34", () => {
        const { checksum } = encodeCode128B("A")
        expect(checksum).toBe(34)
    })

    it("places the checksum just before the stop symbol", () => {
        const { values, checksum } = encodeCode128B("Test")
        expect(values[values.length - 2]).toBe(checksum)
    })

    it("produces a values array of length text.length + 3 (start, checksum, stop)", () => {
        const { values } = encodeCode128B("Hello")
        expect(values).toHaveLength("Hello".length + 3)
    })

    it("builds a bars string that is the concatenation of the symbol patterns", () => {
        const { values, bars } = encodeCode128B("A")
        expect(bars).toBe(values.map((v) => CODE128_PATTERNS[v]).join(""))
    })

    it("ends the bars string with the stop pattern", () => {
        const { bars } = encodeCode128B("anything")
        expect(bars.endsWith("2331112")).toBe(true)
    })

    it("is deterministic for identical input", () => {
        expect(encodeCode128B("Repeat-99").bars).toBe(encodeCode128B("Repeat-99").bars)
    })

    it("throws on empty input", () => {
        expect(() => encodeCode128B("")).toThrow()
    })

    it("throws on a non-encodable character", () => {
        expect(() => encodeCode128B("héllo")).toThrow()
    })
})

describe("buildBarcodeSvg", () => {
    it("returns a well-formed standalone SVG", () => {
        const svg = buildBarcodeSvg("ABC123", SVG_OPTS)
        expect(svg.startsWith("<svg")).toBe(true)
        expect(svg.endsWith("</svg>")).toBe(true)
        expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
    })

    it("renders the human-readable text when showText is true", () => {
        const svg = buildBarcodeSvg("ABC123", SVG_OPTS)
        expect(svg).toContain("<text")
        expect(svg).toContain("ABC123")
    })

    it("omits the text element when showText is false", () => {
        const svg = buildBarcodeSvg("ABC123", { ...SVG_OPTS, showText: false })
        expect(svg).not.toContain("<text")
    })

    it("escapes XML-significant characters in the human-readable text", () => {
        const svg = buildBarcodeSvg("a<b>&\"'", SVG_OPTS)
        expect(svg).toContain("a&lt;b&gt;&amp;&quot;&apos;")
    })

    it("applies the foreground and background colors", () => {
        const svg = buildBarcodeSvg("X", { ...SVG_OPTS, foreground: "#112233", background: "#ffeedd" })
        expect(svg).toContain('fill="#112233"')
        expect(svg).toContain('fill="#ffeedd"')
    })

    it("is deterministic for identical input and options", () => {
        expect(buildBarcodeSvg("Stable", SVG_OPTS)).toBe(buildBarcodeSvg("Stable", SVG_OPTS))
    })

    it("propagates the encode error for non-encodable input", () => {
        expect(() => buildBarcodeSvg("über", SVG_OPTS)).toThrow()
    })
})
