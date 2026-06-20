import { describe, expect, it } from "vitest"

import { decodeBase64, encodeBase64 } from "./base64-converter.utils"

describe("base64-converter utils", () => {
    describe("encodeBase64", () => {
        it("returns empty string for empty input", () => {
            expect(encodeBase64("")).toBe("")
        })

        it("encodes ASCII text", () => {
            expect(encodeBase64("Hello, World!")).toBe("SGVsbG8sIFdvcmxkIQ==")
        })

        it("encodes UTF-8 multibyte text (Korean)", () => {
            expect(encodeBase64("안녕하세요")).toBe("7JWI64WV7ZWY7IS47JqU")
        })

        it("encodes emoji correctly", () => {
            // U+1F680 ROCKET -> 4 UTF-8 bytes
            expect(encodeBase64("🚀")).toBe("8J+agA==")
        })

        it("emits URL-safe alphabet without padding when urlSafe is true", () => {
            const standard = encodeBase64("<<???>>")
            const urlSafe = encodeBase64("<<???>>", true)
            expect(standard).toContain("+")
            expect(urlSafe).not.toContain("+")
            expect(urlSafe).not.toContain("/")
            expect(urlSafe).not.toContain("=")
        })
    })

    describe("decodeBase64", () => {
        it("returns empty string for empty input", () => {
            expect(decodeBase64("")).toBe("")
        })

        it("decodes ASCII text", () => {
            expect(decodeBase64("SGVsbG8sIFdvcmxkIQ==")).toBe("Hello, World!")
        })

        it("throws on invalid base64 input", () => {
            expect(() => decodeBase64("###not-base64###")).toThrow()
        })

        it("decodes URL-safe base64 with missing padding", () => {
            const urlSafe = encodeBase64("안녕🚀", true)
            expect(decodeBase64(urlSafe, true)).toBe("안녕🚀")
        })
    })

    describe("round-trips", () => {
        const samples = [
            "Hello, World!",
            "안녕하세요 세계",
            "你好，世界",
            "Emoji party 🎉🚀🔥",
            "Mixed 123 abc 한글 🙂",
        ]

        for (const sample of samples) {
            it(`standard round-trip preserves "${sample}"`, () => {
                expect(decodeBase64(encodeBase64(sample))).toBe(sample)
            })

            it(`url-safe round-trip preserves "${sample}"`, () => {
                expect(decodeBase64(encodeBase64(sample, true), true)).toBe(sample)
            })
        }
    })
})
