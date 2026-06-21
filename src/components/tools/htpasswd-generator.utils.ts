import CryptoJS from "crypto-js"

/**
 * Pure utilities for generating Apache .htpasswd lines.
 *
 * Supported algorithms:
 *  - sha1:   {SHA} + base64(sha1(password))
 *  - apr1:   Apache's iterated/salted MD5 ($apr1$salt$hash)
 *  - bcrypt: handled in the component via bcryptjs (async), then prefix-rewritten to $2y$
 */

/** Characters allowed in an apr1 salt (the crypt(3) alphabet). */
export const APR1_SALT_CHARS =
    "./0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

/** Apache uses an 8-character salt for the apr1 algorithm. */
export const APR1_SALT_LENGTH = 8

/** apr1 base64 alphabet (same as the salt alphabet). */
const ITOA64 = APR1_SALT_CHARS

/** Number of MD5 iterations the apr1 algorithm performs. */
const APR1_ITERATIONS = 1000

const APR1_MAGIC = "$apr1$"

/**
 * Generate a cryptographically-random apr1 salt of the given length.
 * Uses crypto.getRandomValues; falls back to Math.random only if unavailable.
 */
export function generateSalt(length: number = APR1_SALT_LENGTH): string {
    const bytes = new Uint8Array(length)
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes)
    } else {
        for (let i = 0; i < length; i++) {
            bytes[i] = Math.floor(Math.random() * 256)
        }
    }
    let salt = ""
    for (let i = 0; i < length; i++) {
        salt += APR1_SALT_CHARS[bytes[i] % APR1_SALT_CHARS.length]
    }
    return salt
}

/** Convert a binary (latin1) string to an array of byte values. */
function strToBytes(str: string): number[] {
    const bytes: number[] = []
    for (let i = 0; i < str.length; i++) {
        bytes.push(str.charCodeAt(i) & 0xff)
    }
    return bytes
}

/** Build a CryptoJS WordArray from an array of byte values. */
function bytesToWordArray(bytes: number[]): CryptoJS.lib.WordArray {
    const words: number[] = []
    for (let i = 0; i < bytes.length; i++) {
        words[i >>> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8)
    }
    return CryptoJS.lib.WordArray.create(words, bytes.length)
}

/** Convert a CryptoJS WordArray to an array of byte values. */
function wordArrayToBytes(wa: CryptoJS.lib.WordArray): number[] {
    const out: number[] = []
    for (let i = 0; i < wa.sigBytes; i++) {
        out.push((wa.words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff)
    }
    return out
}

/** Raw 16-byte MD5 digest of the given bytes. */
function md5Bytes(bytes: number[]): number[] {
    return wordArrayToBytes(CryptoJS.MD5(bytesToWordArray(bytes)))
}

/**
 * Apache apr1 (APR1 / "$apr1$") salted, iterated MD5 hash.
 * Faithful port of Apache's apr_md5_encode / the classic crypt-md5 algorithm.
 * Deterministic for a fixed (password, salt). Verified against `openssl passwd -apr1`.
 */
export function apr1(password: string, salt: string): string {
    const pwB = strToBytes(password)
    const saltB = strToBytes(salt)

    // "Alternate" digest: md5(password + salt + password)
    const alt = md5Bytes(pwB.concat(saltB).concat(pwB))

    // Primary context: password + magic + salt
    let ctx = pwB.concat(strToBytes(APR1_MAGIC)).concat(saltB)

    // Append the alternate digest, password-length bytes of it.
    for (let i = pwB.length; i > 0; i -= 16) {
        ctx = ctx.concat(alt.slice(0, Math.min(16, i)))
    }

    // For each bit of the password length: append NUL (bit set) or first pw byte.
    for (let i = pwB.length; i > 0; i >>= 1) {
        ctx = (i & 1) !== 0 ? ctx.concat([0]) : ctx.concat([pwB[0] ?? 0])
    }

    let final = md5Bytes(ctx)

    // 1000 iterations of strengthening.
    for (let i = 0; i < APR1_ITERATIONS; i++) {
        let c: number[] = []
        c = (i & 1) !== 0 ? c.concat(pwB) : c.concat(final)
        if (i % 3 !== 0) c = c.concat(saltB)
        if (i % 7 !== 0) c = c.concat(pwB)
        c = (i & 1) !== 0 ? c.concat(final) : c.concat(pwB)
        final = md5Bytes(c)
    }

    return APR1_MAGIC + salt + "$" + encodeApr1(final)
}

/** Encode the 16-byte apr1 digest using the custom base64 (itoa64) scheme. */
function encodeApr1(final: number[]): string {
    let out = ""
    const to64 = (value: number, count: number): void => {
        let v = value
        for (let i = 0; i < count; i++) {
            out += ITOA64[v & 0x3f]
            v = Math.floor(v / 64)
        }
    }
    to64((final[0] << 16) | (final[6] << 8) | final[12], 4)
    to64((final[1] << 16) | (final[7] << 8) | final[13], 4)
    to64((final[2] << 16) | (final[8] << 8) | final[14], 4)
    to64((final[3] << 16) | (final[9] << 8) | final[15], 4)
    to64((final[4] << 16) | (final[10] << 8) | final[5], 4)
    to64(final[11], 2)
    return out
}

/**
 * Apache {SHA} password hash: "{SHA}" + base64(sha1(password)).
 * Insecure (unsalted) — provided for legacy compatibility only.
 */
export function sha1Htpasswd(password: string): string {
    const digest = CryptoJS.SHA1(password)
    return "{SHA}" + CryptoJS.enc.Base64.stringify(digest)
}

/** Format a final .htpasswd line: "username:hash". */
export function formatLine(username: string, hash: string): string {
    return `${username}:${hash}`
}
