import { describe, it, expect } from "vitest"
import {
    sha1Htpasswd,
    apr1,
    formatLine,
    generateSalt,
    APR1_SALT_CHARS,
    APR1_SALT_LENGTH,
} from "./htpasswd-generator.utils"

describe("sha1Htpasswd", () => {
    it("matches the known {SHA} vector for 'password'", () => {
        // Verified against: printf 'password' | openssl sha1 -binary | openssl base64
        expect(sha1Htpasswd("password")).toBe("{SHA}W6ph5Mm5Pz8GgiULbPgzG37mj9g=")
    })
    it("always carries the {SHA} prefix", () => {
        expect(sha1Htpasswd("anything")).toMatch(/^\{SHA\}/)
    })
    it("is deterministic", () => {
        expect(sha1Htpasswd("hello")).toBe(sha1Htpasswd("hello"))
    })
    it("matches the {SHA} vector for empty string", () => {
        // sha1("") base64 = 2jmj7l5rSw0yVb/vlWAYkK/YBwk=
        expect(sha1Htpasswd("")).toBe("{SHA}2jmj7l5rSw0yVb/vlWAYkK/YBwk=")
    })
})

describe("apr1", () => {
    it("matches a known reference vector (openssl passwd -apr1)", () => {
        // openssl passwd -apr1 -salt salt1234 myPassword
        expect(apr1("myPassword", "salt1234")).toBe("$apr1$salt1234$YTXcJKDBeWReyLZ5U.1SF/")
    })
    it("matches a second reference vector", () => {
        // openssl passwd -apr1 -salt abcd1234 hello
        expect(apr1("hello", "abcd1234")).toBe("$apr1$abcd1234$69HwUHN6dX4TkV1gVgXOb0")
    })
    it("starts with the $apr1$ prefix", () => {
        expect(apr1("pw", "ZZZZ0000")).toMatch(/^\$apr1\$/)
    })
    it("embeds the supplied salt", () => {
        const salt = "8charsXY"
        expect(apr1("pw", salt).startsWith(`$apr1$${salt}$`)).toBe(true)
    })
    it("is deterministic for a fixed password and salt", () => {
        expect(apr1("secret", "fixedslt")).toBe(apr1("secret", "fixedslt"))
    })
    it("produces a 22-character hash segment", () => {
        const segment = apr1("any", "saltsalt").split("$")[3]
        expect(segment).toHaveLength(22)
    })
})

describe("generateSalt", () => {
    it("produces the default apr1 salt length", () => {
        expect(generateSalt()).toHaveLength(APR1_SALT_LENGTH)
    })
    it("respects a custom length", () => {
        expect(generateSalt(12)).toHaveLength(12)
    })
    it("uses only itoa64 alphabet characters", () => {
        const salt = generateSalt(64)
        for (const ch of salt) {
            expect(APR1_SALT_CHARS).toContain(ch)
        }
    })
    it("is (almost certainly) non-repeating across calls", () => {
        expect(generateSalt()).not.toBe(generateSalt())
    })
})

describe("formatLine", () => {
    it("joins username and hash with a colon", () => {
        expect(formatLine("admin", "$apr1$x$y")).toBe("admin:$apr1$x$y")
    })
    it("handles {SHA} hashes", () => {
        expect(formatLine("user", "{SHA}abc=")).toBe("user:{SHA}abc=")
    })
    it("works end-to-end with apr1", () => {
        const line = formatLine("bob", apr1("hello", "abcd1234"))
        expect(line).toBe("bob:$apr1$abcd1234$69HwUHN6dX4TkV1gVgXOb0")
    })
})
