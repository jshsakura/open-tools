/**
 * Pure Base64 encode/decode helpers with correct UTF-8 handling
 * (via TextEncoder/TextDecoder) and an optional URL-safe variant.
 */

const toBase64 = (bytes: Uint8Array): string => {
    let binary = ""
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

const fromBase64 = (base64: string): Uint8Array => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes
}

const toUrlSafe = (base64: string): string =>
    base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")

const fromUrlSafe = (input: string): string => {
    const replaced = input.replace(/-/g, "+").replace(/_/g, "/")
    const padding = replaced.length % 4
    return padding ? replaced + "=".repeat(4 - padding) : replaced
}

/**
 * Encode a UTF-8 string to Base64.
 * @param input plain text
 * @param urlSafe emit URL-safe Base64 (`-_`, no padding) when true
 */
export const encodeBase64 = (input: string, urlSafe = false): string => {
    if (!input) return ""
    const bytes = new TextEncoder().encode(input)
    const base64 = toBase64(bytes)
    return urlSafe ? toUrlSafe(base64) : base64
}

/**
 * Decode a Base64 (standard or URL-safe) string back to UTF-8 text.
 * Throws on invalid Base64 input.
 * @param input Base64 string
 * @param urlSafe interpret input as URL-safe Base64 when true
 */
export const decodeBase64 = (input: string, urlSafe = false): string => {
    if (!input) return ""
    const normalized = urlSafe ? fromUrlSafe(input) : input
    const bytes = fromBase64(normalized)
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes)
}
