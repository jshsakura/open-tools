/**
 * Pure helpers for the HMAC generator.
 *
 * The component lets a user supply the secret key in one of three encodings
 * (UTF-8, Hex, Base64) and render the HMAC output as Hex or Base64. These
 * helpers isolate that decoding/encoding so it can be unit-tested without the
 * Web Crypto runtime.
 */

export type KeyEncoding = "utf8" | "hex" | "base64"
export type OutputEncoding = "hex" | "base64"

/**
 * Decode a secret-key string into raw bytes according to the chosen encoding.
 * Throws a descriptive Error on malformed hex/base64 so callers can surface a
 * user-friendly message instead of failing silently.
 */
export function decodeKey(str: string, encoding: KeyEncoding): Uint8Array {
  switch (encoding) {
    case "utf8":
      return new TextEncoder().encode(str)
    case "hex":
      return hexToBytes(str)
    case "base64":
      return base64ToBytes(str)
    default:
      // Exhaustiveness guard for unexpected values from untrusted input.
      throw new Error(`Unsupported key encoding: ${String(encoding)}`)
  }
}

/** Convert a hex string (optionally with whitespace) into bytes. */
export function hexToBytes(hex: string): Uint8Array {
  const cleaned = hex.replace(/\s+/g, "")
  if (cleaned.length === 0) return new Uint8Array(0)
  if (cleaned.length % 2 !== 0) {
    throw new Error("Hex string must have an even number of characters")
  }
  if (!/^[0-9a-fA-F]+$/.test(cleaned)) {
    throw new Error("Hex string contains invalid characters")
  }
  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Decode a standard Base64 string into bytes. */
export function base64ToBytes(b64: string): Uint8Array {
  const cleaned = b64.replace(/\s+/g, "")
  if (cleaned.length === 0) return new Uint8Array(0)
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleaned)) {
    throw new Error("Base64 string contains invalid characters")
  }
  // atob exists in browsers and modern Node; decode to a binary string.
  let binary: string
  try {
    binary = atob(cleaned)
  } catch {
    throw new Error("Invalid Base64 string")
  }
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Format raw bytes as a lowercase hex string. */
export function bufToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** Format raw bytes as a standard Base64 string. */
export function bufToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
